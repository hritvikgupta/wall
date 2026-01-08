"""Async Guard class for wall_library."""

from typing import Any, Callable, Dict, Generic, Optional, List
import asyncio

from wall_library.classes.output_type import OT
from wall_library.classes.validation_outcome import ValidationOutcome
from wall_library.guard import WallGuard
from wall_library.types.validator import UseValidatorSpec


class AsyncGuard(Generic[OT], WallGuard[OT]):
    """Async Guard class for validating LLM outputs asynchronously."""

    async def async_validate(
        self, llm_output: str, *args, **kwargs
    ) -> ValidationOutcome[OT]:
        """Async validate LLM output.

        Args:
            llm_output: LLM output to validate
            *args: Additional arguments
            **kwargs: Additional keyword arguments

        Returns:
            ValidationOutcome
        """
        from wall_library.validator_service.async_validator_service import (
            AsyncValidatorService,
        )

        # Get output validators
        output_validators = self.validator_map.get("output", [])

        # Run validators asynchronously
        service = AsyncValidatorService()
        validation_results = []
        error_spans = []

        for validator in output_validators:
            result = await validator.async_validate(
                llm_output, metadata=kwargs.get("metadata", {})
            )
            validation_results.append(result)

            if result.is_fail and hasattr(result, "error_spans"):
                error_spans.extend(result.error_spans)

        # Check if validation passed
        validation_passed = all(r.is_pass for r in validation_results)

        return ValidationOutcome(
            validated_output=llm_output if validation_passed else None,
            raw_output=llm_output,
            validation_passed=validation_passed,
            error_spans=error_spans,
            metadata={"validation_results": validation_results},
        )

    async def __call__(
        self, llm_api: Optional[Callable] = None, engine: Optional[str] = None, **kwargs
    ) -> tuple:
        """Async execute guard with LLM API.

        Args:
            llm_api: LLM API callable
            engine: LLM engine name
            **kwargs: Additional keyword arguments

        Returns:
            Tuple of (raw_output, validated_output, ...)
        """
        if llm_api is None:
            output = kwargs.get("output", "")
            outcome = await self.async_validate(output, **kwargs)
            return (outcome.raw_output, outcome.validated_output, outcome)

        # Execute async LLM call
        from wall_library.run.async_runner import AsyncRunner

        runner = AsyncRunner(
            api=llm_api,
            output_schema=self.output_schema or {},
            validation_map=self.validator_map,
            num_reasks=self.num_reasks,
        )

        prompt = kwargs.get("prompt", "")
        output = await runner.run(prompt=prompt, **kwargs)

        # Validate output
        outcome = await self.async_validate(output, **kwargs)

        return (outcome.raw_output, outcome.validated_output, outcome)

