"""Primitive type definitions."""

from typing import Union, List, Dict, Any
from typing_extensions import TypeAlias

PrimitiveTypes: TypeAlias = Union[
    str,
    int,
    float,
    bool,
    List[Any],
    Dict[str, Any],
]

__all__ = ["PrimitiveTypes"]

