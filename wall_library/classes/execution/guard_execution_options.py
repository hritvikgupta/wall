"""Guard execution options."""

from dataclasses import dataclass, field
from typing import Optional, Dict, Any


@dataclass
class GuardExecutionOptions:
    """Execution options for guard."""

    num_reasks: int = 0
    full_schema_reask: bool = False
    disable_tracer: bool = False
    metadata: Dict[str, Any] = field(default_factory=dict)

    def __repr__(self) -> str:
        return f"GuardExecutionOptions(num_reasks={self.num_reasks})"

