"""Input type definitions."""

from typing import Literal
from typing_extensions import TypeAlias

InputType: TypeAlias = Literal["string", "messages"]

__all__ = ["InputType"]


