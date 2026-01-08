"""Validator reference class."""

from dataclasses import dataclass, field
from typing import Any, Dict, Optional

from wall_library.types.on_fail import OnFailAction


@dataclass
class ValidatorReference:
    """Reference to a validator."""

    id: str
    on: str  # JSON path
    on_fail: OnFailAction = OnFailAction.EXCEPTION
    kwargs: Dict[str, Any] = field(default_factory=dict)

    def __repr__(self) -> str:
        return f"ValidatorReference(id={self.id}, on={self.on}, on_fail={self.on_fail})"

