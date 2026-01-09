"""RAIL type definitions."""

from typing import Literal
from typing_extensions import TypeAlias

RailTypes: TypeAlias = Literal[
    "string",
    "integer",
    "float",
    "bool",
    "date",
    "time",
    "datetime",
    "url",
    "email",
    "pythoncode",
    "sql",
    "object",
    "array",
    "list",
    "choice",
]

__all__ = ["RailTypes"]


