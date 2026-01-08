"""Output history class."""

from dataclasses import dataclass, field
from typing import Any, Dict, Optional


@dataclass
class Outputs:
    """Output tracking class."""

    raw_output: Optional[str] = None
    validated_output: Optional[Any] = None
    metadata: Dict[str, Any] = field(default_factory=dict)

    def __repr__(self) -> str:
        return f"Outputs(validated={self.validated_output is not None})"

