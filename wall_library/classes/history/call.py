"""Call history class."""

from dataclasses import dataclass, field
from typing import Optional, Dict, Any
from datetime import datetime

from wall_library.classes.history.inputs import Inputs
from wall_library.classes.history.outputs import Outputs


@dataclass
class Call:
    """Represents a guard call."""

    inputs: Optional[Inputs] = None
    outputs: Optional[Outputs] = None
    metadata: Dict[str, Any] = field(default_factory=dict)
    timestamp: datetime = field(default_factory=datetime.now)

    def __repr__(self) -> str:
        return f"Call(timestamp={self.timestamp})"

