"""Validation outcome class."""

from dataclasses import dataclass, field
from typing import Generic, TypeVar, Optional, List, Any, Dict

from wall_library.classes.validation import ErrorSpan

OT = TypeVar("OT")


@dataclass
class ValidationOutcome(Generic[OT]):
    """Generic validation result."""

    validated_output: Optional[OT] = None
    raw_output: Optional[str] = None
    metadata: Dict[str, Any] = field(default_factory=dict)
    error_spans: List[ErrorSpan] = field(default_factory=list)
    validation_passed: bool = True

    def __repr__(self) -> str:
        return f"ValidationOutcome(passed={self.validation_passed}, output={self.validated_output})"

