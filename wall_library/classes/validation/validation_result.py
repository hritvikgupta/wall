"""Validation result classes."""

from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional


@dataclass
class ErrorSpan:
    """Represents an error span in output."""

    start: int
    end: int
    message: str
    fix_value: Optional[Any] = None

    def __repr__(self) -> str:
        return f"ErrorSpan({self.start}:{self.end}, {self.message})"


@dataclass
class ValidationResult:
    """Base validation result."""

    outcome: str = "pass"
    metadata: Dict[str, Any] = field(default_factory=dict)

    @property
    def is_pass(self) -> bool:
        """Check if validation passed."""
        return self.outcome == "pass"

    @property
    def is_fail(self) -> bool:
        """Check if validation failed."""
        return self.outcome == "fail"


@dataclass
class PassResult(ValidationResult):
    """Successful validation result."""

    outcome: str = "pass"

    def __repr__(self) -> str:
        return "PassResult()"


@dataclass
class FailResult(ValidationResult):
    """Failed validation result."""

    outcome: str = "fail"
    error_message: str = ""
    fix_value: Optional[Any] = None
    error_spans: List[ErrorSpan] = field(default_factory=list)

    def __repr__(self) -> str:
        return f"FailResult({self.error_message})"

    def add_error_span(
        self, start: int, end: int, message: str, fix_value: Optional[Any] = None
    ) -> None:
        """Add an error span."""
        self.error_spans.append(ErrorSpan(start, end, message, fix_value))


