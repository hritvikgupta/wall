"""Output type definitions."""

from enum import Enum
from typing import TypeVar, Generic

OT = TypeVar("OT")


class OutputTypes(str, Enum):
    """Output types for validation."""

    STRING = "string"
    JSON = "json"
    OBJECT = "object"
    ARRAY = "array"
    PYDANTIC = "pydantic"


__all__ = ["OT", "OutputTypes"]

