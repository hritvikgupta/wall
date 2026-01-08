"""Base validator class."""

import asyncio
from contextvars import ContextVar
from dataclasses import dataclass, field
from typing import Any, Callable, Dict, List, Optional, Type, Union
from functools import partial
import re

from wall_library.settings import settings
from wall_library.classes.validation.validation_result import (
    ValidationResult,
    PassResult,
    FailResult,
)
from wall_library.types.on_fail import OnFailAction
from wall_library.constants.hub import VALIDATOR_HUB_SERVICE
from wall_library.logger import logger
from wall_library.utils.safe_get import safe_get
from wall_library.utils.tokenization_utils import postproc_splits


# Validator registry
_VALIDATOR_REGISTRY: Dict[str, Type["Validator"]] = {}


# Export registry for external access
__all__ = ["Validator", "register_validator", "get_validator", "_VALIDATOR_REGISTRY"]


def split_sentence_str(chunk: str) -> List[str]:
    """A naive sentence splitter that splits on periods."""
    if "." not in chunk:
        return []
    fragments = chunk.split(".")
    return [fragments[0] + ".", ".".join(fragments[1:])]


def split_sentence_word_tokenizers_jl_separator(
    chunk: str, separator: str = "abcdsentenceseperatordcba"
) -> List[str]:
    """Use a sentence tokenizer to detect if at least one sentence is present
    in the chunk. We return the first sentence and the remaining chunks without
    the first sentence.
    """
    # Check at least 3 characters have been accumulated before splitting
    third_chunk = safe_get(chunk, 2)
    is_minimum_length = third_chunk is not None

    # Check for potential line endings
    chunk_with_potential_line_endings, count = re.subn(
        r"([?!.])(?=\s|$)", rf"\1{separator}", chunk
    )
    any_potential_line_endings = count > 0
    if not is_minimum_length or not any_potential_line_endings:
        return []

    sentences = postproc_splits(chunk_with_potential_line_endings, separator)
    sentences = re.split(rf"\n?{separator} ?\n?", sentences)
    # If not more than one sentence, we haven't accumulated enough for a validation
    if len(sentences) <= 1:
        return []

    # Return the sentence then the remaining chunks
    return [sentences[0], "".join(sentences[1:])]


@dataclass
class Validator:
    """Base class for validators."""

    rail_alias: str = ""
    run_in_separate_process: bool = False
    override_value_on_pass: bool = False
    required_metadata_keys: List[str] = field(default_factory=list)
    _metadata: Dict[str, Any] = field(default_factory=dict)
    accumulated_chunks: List[str] = field(default_factory=list)

    def __init__(
        self,
        on_fail: Optional[Union[Callable[[Any, FailResult], Any], OnFailAction]] = None,
        **kwargs,
    ):
        """Initialize validator."""
        # Make RC optional for local validators
        require_rc = kwargs.pop("require_rc", True)
        self._disable_telemetry = not settings.rc or not settings.rc.enable_metrics
        self.use_local = kwargs.get("use_local", None)
        self.validation_endpoint = kwargs.get("validation_endpoint", None)

        if require_rc and not settings.rc:
            raise ValueError(
                "No .wallrc file found. Please run `wall configure` and try again."
            )

        if not self.validation_endpoint and self.rail_alias:
            validator_id = self.rail_alias.split("/")[-1]
            submission_url = f"{VALIDATOR_HUB_SERVICE}/validator/{validator_id}/inference"
            self.validation_endpoint = submission_url

        self.on_fail_descriptor: Union[str, OnFailAction] = "custom"
        self.accumulated_chunks: List[str] = []

        if on_fail is None:
            on_fail = OnFailAction.EXCEPTION
        if isinstance(on_fail, OnFailAction):
            self.on_fail_descriptor = on_fail
            self.on_fail_method = None
        elif (
            isinstance(on_fail, str)
            and OnFailAction.__members__.get(on_fail.upper()) is not None
        ):
            self.on_fail_descriptor = OnFailAction[on_fail.upper()]
            self.on_fail_method = None
        elif callable(on_fail):
            self.on_fail_descriptor = OnFailAction.CUSTOM
            self.on_fail_method = on_fail
        else:
            self.on_fail_descriptor = OnFailAction.EXCEPTION
            self.on_fail_method = None

    def validate(self, value: Any, metadata: Dict[str, Any] = None) -> ValidationResult:
        """Validate a value.

        Args:
            value: Value to validate
            metadata: Optional metadata for validation

        Returns:
            ValidationResult
        """
        metadata = metadata or {}
        try:
            result = self._validate(value, metadata)
            return result
        except Exception as e:
            logger.error(f"Validator {self.rail_alias} failed with error: {e}")
            return FailResult(
                error_message=str(e),
                metadata=metadata,
            )

    async def async_validate(
        self, value: Any, metadata: Dict[str, Any] = None
    ) -> ValidationResult:
        """Async validate a value.

        Args:
            value: Value to validate
            metadata: Optional metadata for validation

        Returns:
            ValidationResult
        """
        metadata = metadata or {}
        try:
            result = await self._async_validate(value, metadata)
            return result
        except Exception as e:
            logger.error(f"Validator {self.rail_alias} failed with error: {e}")
            return FailResult(
                error_message=str(e),
                metadata=metadata,
            )

    def _validate(self, value: Any, metadata: Dict[str, Any]) -> ValidationResult:
        """Internal validation method to be overridden by subclasses."""
        # Default implementation - pass all values
        return PassResult(metadata=metadata)

    async def _async_validate(self, value: Any, metadata: Dict[str, Any]) -> ValidationResult:
        """Internal async validation method to be overridden by subclasses."""
        # Default implementation - pass all values
        return PassResult(metadata=metadata)

    def get_args(self) -> Dict[str, Any]:
        """Get validator arguments for serialization."""
        return {}

    def on_fail_handler(self, value: Any, fail_result: FailResult) -> Any:
        """Handle validation failure based on on_fail action."""
        if self.on_fail_descriptor == OnFailAction.EXCEPTION:
            from wall_library.errors.validation_error import ValidationError

            raise ValidationError(
                fail_result.error_message,
                error_spans=fail_result.error_spans,
                fix_value=fail_result.fix_value,
            )
        elif self.on_fail_descriptor == OnFailAction.FILTER:
            return None
        elif self.on_fail_descriptor == OnFailAction.FIX:
            return fail_result.fix_value
        elif self.on_fail_descriptor == OnFailAction.REFRAIN:
            return ""
        elif self.on_fail_descriptor == OnFailAction.NOOP:
            return value
        elif self.on_fail_descriptor == OnFailAction.CUSTOM and self.on_fail_method:
            return self.on_fail_method(value, fail_result)
        else:
            return value


def register_validator(rail_alias: str = None):
    """Decorator to register a validator.

    Args:
        rail_alias: RAIL alias for the validator
    """

    def decorator(cls: Type[Validator]) -> Type[Validator]:
        alias = rail_alias or cls.rail_alias or cls.__name__.lower()
        _VALIDATOR_REGISTRY[alias] = cls
        cls.rail_alias = alias
        return cls

    return decorator


def get_validator(validator_id: str) -> Optional[Type[Validator]]:
    """Get validator by ID from registry.

    Args:
        validator_id: Validator ID

    Returns:
        Validator class or None
    """
    return _VALIDATOR_REGISTRY.get(validator_id)

