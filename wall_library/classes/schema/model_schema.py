"""Model schema class."""

from dataclasses import dataclass
from typing import Any, Dict, Optional, Type


@dataclass
class ModelSchema:
    """Pydantic model wrapper."""

    model: Type
    schema_dict: Dict[str, Any]
    field_descriptions: Dict[str, str] = None

    def __post_init__(self):
        """Initialize field descriptions if not provided."""
        if self.field_descriptions is None:
            self.field_descriptions = {}

    def __repr__(self) -> str:
        return f"ModelSchema(model={self.model.__name__})"


