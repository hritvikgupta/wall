"""Main Guard class for wall_library."""

from typing import (
    Any,
    Callable,
    Dict,
    Generic,
    Iterator,
    List,
    Optional,
    Sequence,
    Type,
    Union,
    overload,
)
from contextvars import ContextVar

from wall_library.classes.output_type import OT
from wall_library.classes.validation_outcome import ValidationOutcome
from wall_library.classes.validation.validation_result import ErrorSpan
from wall_library.classes.execution.guard_execution_options import GuardExecutionOptions
from wall_library.classes.schema.processed_schema import ProcessedSchema
from wall_library.types.on_fail import OnFailAction
from wall_library.types.validator import (
    ValidatorMap,
    UseValidatorSpec,
    UseManyValidatorSpec,
)
from wall_library.types.pydantic import ModelOrListOfModels
from wall_library.validator_base import Validator, get_validator
from wall_library.logger import logger
from wall_library.stores.context import set_guard_name, set_tracer, Tracer
from wall_library.settings import settings

# Validator registry context
_validator_map_context: ContextVar[ValidatorMap] = ContextVar(
    "_validator_map", default={}
)


class WallGuard(Generic[OT]):
    """Main Guard class for validating LLM outputs."""

    def __init__(
        self,
        validators: Optional[List[Validator]] = None,
        num_reasks: int = 0,
        tracer: Optional[Tracer] = None,
        name: Optional[str] = None,
        logger: Optional[Any] = None,
    ):
        """Initialize Guard.

        Args:
            validators: List of validators to use
            num_reasks: Maximum number of re-asks
            tracer: Tracer for telemetry
            name: Guard name
            logger: Optional WallLogger instance for logging
        """
        self.validators: List[Validator] = validators or []
        self.num_reasks: int = num_reasks
        self.tracer = tracer
        self.name = name
        self.logger = logger
        self.exec_options = GuardExecutionOptions(num_reasks=num_reasks)
        self.validator_map: ValidatorMap = {}
        self.processed_schema: Optional[ProcessedSchema] = None
        self.output_schema: Optional[Dict[str, Any]] = None

        if self.name:
            set_guard_name(self.name)
        if self.tracer:
            set_tracer(self.tracer)

    def configure(self, **kwargs):
        """Configure guard settings."""
        if "num_reasks" in kwargs:
            self.num_reasks = kwargs["num_reasks"]
            self.exec_options.num_reasks = kwargs["num_reasks"]
        if "tracer" in kwargs:
            self.tracer = kwargs["tracer"]
            set_tracer(kwargs["tracer"])
        if "logger" in kwargs:
            self.logger = kwargs["logger"]
        return self
    
    def set_logger(self, logger: Any):
        """Set logger for this guard.
        
        Args:
            logger: WallLogger instance
        """
        self.logger = logger
        return self

    def use(
        self, validator: UseValidatorSpec, *, on: str = "output"
    ) -> "WallGuard[OT]":
        """Add a single validator to the guard.

        Args:
            validator: Validator to add
            on: Where to apply validator ("input" or "output")

        Returns:
            Self for chaining
        """
        # Parse validator specification
        if isinstance(validator, type) and issubclass(validator, Validator):
            validator_instance = validator()
        elif isinstance(validator, Validator):
            validator_instance = validator
        elif isinstance(validator, tuple):
            validator_cls = validator[0]
            kwargs = validator[1] if len(validator) > 1 else {}
            on_fail = validator[2] if len(validator) > 2 else OnFailAction.EXCEPTION
            validator_instance = validator_cls(on_fail=on_fail, **kwargs)
        else:
            raise ValueError(f"Invalid validator specification: {validator}")

        self.validators.append(validator_instance)

        # Update validator map
        if on not in self.validator_map:
            self.validator_map[on] = []
        self.validator_map[on].append(validator_instance)

        return self

    def use_many(
        self, *validators: UseManyValidatorSpec, on: str = "output"
    ) -> "WallGuard[OT]":
        """Add multiple validators to the guard.

        Args:
            *validators: Validators to add
            on: Where to apply validators ("input" or "output")

        Returns:
            Self for chaining
        """
        for validator in validators:
            self.use(validator, on=on)
        return self

    @classmethod
    def for_pydantic(
        cls,
        output_class: ModelOrListOfModels,
        prompt: Optional[str] = None,
        *args,
        **kwargs,
    ) -> "WallGuard":
        """Create a guard from a Pydantic model.

        Args:
            output_class: Pydantic model class or list of models
            prompt: Optional prompt template
            *args: Additional arguments
            **kwargs: Additional keyword arguments

        Returns:
            Guard instance
        """
        from wall_library.schema.pydantic_schema import pydantic_model_to_schema

        schema = pydantic_model_to_schema(output_class)
        guard = cls(*args, **kwargs)
        guard.output_schema = schema
        guard.processed_schema = ProcessedSchema(schema=schema)
        return guard

    @classmethod
    def for_rail(
        cls, rail_file: str, *args, **kwargs
    ) -> "WallGuard":
        """Create a guard from a RAIL file.

        Args:
            rail_file: Path to RAIL file
            *args: Additional arguments
            **kwargs: Additional keyword arguments

        Returns:
            Guard instance
        """
        from wall_library.schema.rail_schema import rail_file_to_schema

        schema = rail_file_to_schema(rail_file)
        guard = cls(*args, **kwargs)
        guard.output_schema = schema.schema
        guard.processed_schema = schema
        return guard

    @classmethod
    def for_rail_string(
        cls, rail_string: str, *args, **kwargs
    ) -> "WallGuard":
        """Create a guard from a RAIL string.

        Args:
            rail_string: RAIL specification string
            *args: Additional arguments
            **kwargs: Additional keyword arguments

        Returns:
            Guard instance
        """
        from wall_library.schema.rail_schema import rail_string_to_schema

        schema = rail_string_to_schema(rail_string)
        guard = cls(*args, **kwargs)
        guard.output_schema = schema.schema
        guard.processed_schema = schema
        return guard

    def validate(
        self, llm_output: str, *args, **kwargs
    ) -> ValidationOutcome[OT]:
        """Validate LLM output.

        Args:
            llm_output: LLM output to validate
            *args: Additional arguments
            **kwargs: Additional keyword arguments

        Returns:
            ValidationOutcome
        """
        from wall_library.validator_service.sequential_validator_service import (
            SequentialValidatorService,
        )

        # Get output validators
        output_validators = self.validator_map.get("output", [])

        # Run validators
        service = SequentialValidatorService()
        validation_results = []
        error_spans = []

        for validator in output_validators:
            result = validator.validate(llm_output, metadata=kwargs.get("metadata", {}))
            validation_results.append(result)

            if result.is_fail and hasattr(result, "error_spans"):
                error_spans.extend(result.error_spans)
            
            # Log validation if logger is set
            if self.logger:
                validator_name = getattr(validator, "rail_alias", validator.__class__.__name__)
                self.logger.log_validation(
                    value=llm_output,
                    result=result,
                    validator_name=validator_name,
                    metadata={"guard_name": self.name} if self.name else None,
                )

        # Check if validation passed
        validation_passed = all(r.is_pass for r in validation_results)

        if not validation_passed:
            error_messages = [
                r.error_message
                for r in validation_results
                if r.is_fail and hasattr(r, "error_message")
            ]
            logger.warning(f"Validation failed: {', '.join(error_messages)}")

        return ValidationOutcome(
            validated_output=llm_output if validation_passed else None,
            raw_output=llm_output,
            validation_passed=validation_passed,
            error_spans=error_spans,
            metadata={"validation_results": validation_results},
        )

    def __call__(
        self, llm_api: Optional[Callable] = None, engine: Optional[str] = None, **kwargs
    ) -> tuple:
        """Execute guard with LLM API.

        Args:
            llm_api: LLM API callable
            engine: LLM engine name
            **kwargs: Additional keyword arguments

        Returns:
            Tuple of (raw_output, validated_output, ...)
        """
        if llm_api is None:
            # Just validate provided output
            output = kwargs.get("output", "")
            outcome = self.validate(output, **kwargs)
            return (outcome.raw_output, outcome.validated_output, outcome)

        # Execute LLM call (would integrate with Runner)
        from wall_library.run.runner import Runner

        runner = Runner(
            api=llm_api,
            output_schema=self.output_schema or {},
            validation_map=self.validator_map,
            num_reasks=self.num_reasks,
        )

        prompt = kwargs.get("prompt", "")
        output = runner.run(prompt=prompt, **kwargs)

        # Validate output
        outcome = self.validate(output, **kwargs)

        return (outcome.raw_output, outcome.validated_output, outcome)

    def error_spans_in_output(self) -> List[ErrorSpan]:
        """Get error spans in output."""
        # This would be populated during validation
        return []

    def to_dict(self) -> Dict[str, Any]:
        """Serialize guard to dictionary."""
        return {
            "name": self.name,
            "num_reasks": self.num_reasks,
            "validators": [
                {
                    "rail_alias": v.rail_alias,
                    "on_fail": v.on_fail_descriptor.value
                    if hasattr(v.on_fail_descriptor, "value")
                    else str(v.on_fail_descriptor),
                }
                for v in self.validators
            ],
        }

    @classmethod
    def from_dict(cls, obj: Optional[Dict[str, Any]]) -> Optional["WallGuard"]:
        """Deserialize guard from dictionary."""
        if obj is None:
            return None

        guard = cls(
            num_reasks=obj.get("num_reasks", 0),
            name=obj.get("name"),
        )

        # Reconstruct validators (simplified)
        for v_spec in obj.get("validators", []):
            validator_id = v_spec.get("rail_alias")
            if validator_id:
                validator_cls = get_validator(validator_id)
                if validator_cls:
                    on_fail = OnFailAction.get(v_spec.get("on_fail"))
                    guard.use(validator_cls(on_fail=on_fail))

        return guard

