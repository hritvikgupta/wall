"""Data type definitions."""

from typing import Any, Dict, List, Union, Optional
from typing_extensions import TypeAlias

# Common type aliases
StringList: TypeAlias = List[str]
DictStrAny: TypeAlias = Dict[str, Any]
OptionalStr: TypeAlias = Optional[str]

__all__ = [
    "StringList",
    "DictStrAny",
    "OptionalStr",
]

