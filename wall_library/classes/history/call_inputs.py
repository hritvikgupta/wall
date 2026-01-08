"""Call inputs class."""

from dataclasses import dataclass, field
from typing import Any, Dict, Optional


@dataclass
class CallInputs:
    """Call input details class."""

    llm_api: Optional[Any] = None
    engine: Optional[str] = None
    kwargs: Dict[str, Any] = field(default_factory=dict)

    def __repr__(self) -> str:
        return f"CallInputs(engine={self.engine})"

