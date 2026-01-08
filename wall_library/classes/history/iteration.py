"""Iteration history class."""

from dataclasses import dataclass, field
from typing import Optional, Dict, Any, List


@dataclass
class Iteration:
    """Re-ask iteration tracking class."""

    iteration_number: int = 0
    output: Optional[str] = None
    validation_results: List[Dict[str, Any]] = field(default_factory=list)
    metadata: Dict[str, Any] = field(default_factory=dict)

    def __repr__(self) -> str:
        return f"Iteration(number={self.iteration_number})"

