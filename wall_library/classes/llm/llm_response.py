"""LLM response class."""

from dataclasses import dataclass, field
from typing import Any, Dict, Optional


@dataclass
class LLMResponse:
    """LLM response wrapper."""

    output: str
    metadata: Dict[str, Any] = field(default_factory=dict)
    model: Optional[str] = None
    usage: Optional[Dict[str, Any]] = None

    def __repr__(self) -> str:
        return f"LLMResponse(output={self.output[:50]}..., model={self.model})"

