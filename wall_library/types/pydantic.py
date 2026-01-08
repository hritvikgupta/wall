"""Pydantic type definitions."""

from typing import Union, List
from typing_extensions import TypeAlias

try:
    from pydantic import BaseModel

    ModelOrListOfModels: TypeAlias = Union[
        type[BaseModel],
        List[type[BaseModel]],
        BaseModel,
        List[BaseModel],
    ]
except ImportError:
    # Fallback if pydantic not available
    ModelOrListOfModels: TypeAlias = Union[type, List[type]]  # type: ignore

__all__ = ["ModelOrListOfModels"]

