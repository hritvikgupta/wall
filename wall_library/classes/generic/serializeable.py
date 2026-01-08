"""Serializable base class."""

from abc import ABC
from typing import Any, Dict
import json


class Serializable(ABC):
    """Base class for serializable objects."""

    def to_dict(self) -> Dict[str, Any]:
        """Convert object to dictionary."""
        return {}

    def to_json(self) -> str:
        """Convert object to JSON string."""
        return json.dumps(self.to_dict())

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> Any:
        """Create object from dictionary."""
        return cls(**data)

