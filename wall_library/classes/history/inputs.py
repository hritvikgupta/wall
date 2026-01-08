"""Input history class."""

from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional


@dataclass
class Inputs:
    """Input tracking class."""

    prompt: Optional[str] = None
    messages: Optional[List[Dict[str, Any]]] = None
    kwargs: Dict[str, Any] = field(default_factory=dict)

    def __repr__(self) -> str:
        return f"Inputs(prompt={self.prompt})"

