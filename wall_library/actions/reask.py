"""Re-ask action implementation."""

from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional

from wall_library.classes.validation.validation_result import FailResult


@dataclass
class ReAsk:
    """Re-ask functionality for validation failures."""

    value: Any
    fail_results: List[FailResult] = field(default_factory=list)
    metadata: Dict[str, Any] = field(default_factory=dict)

    def __repr__(self) -> str:
        return f"ReAsk(value={self.value}, errors={len(self.fail_results)})"


@dataclass
class NonParseableReAsk:
    """Non-parseable re-ask."""

    value: str
    error_message: str
    metadata: Dict[str, Any] = field(default_factory=dict)

    def __repr__(self) -> str:
        return f"NonParseableReAsk(error={self.error_message})"


def get_reask_setup() -> Dict[str, Any]:
    """Get re-ask configuration."""
    return {
        "max_reasks": 3,
        "backoff_factor": 2.0,
    }


def introspect(fail_result: FailResult) -> str:
    """Introspect validation failure and generate error message."""
    if fail_result.error_message:
        return fail_result.error_message

    if fail_result.error_spans:
        error_messages = [span.message for span in fail_result.error_spans]
        return "; ".join(error_messages)

    return "Validation failed"


