"""Validator type definitions."""

from typing import Dict, List, Tuple, Union, Callable, Any
from typing_extensions import TypeAlias

from wall_library.validator_base import Validator
from wall_library.types.on_fail import OnFailAction

# Validator map: json_path -> list of validators
ValidatorMap: TypeAlias = Dict[str, List[Validator]]

# Validator specification for use()
UseValidatorSpec: TypeAlias = Union[
    Validator,
    type[Validator],
    Tuple[type[Validator], Dict[str, Any]],
    Tuple[type[Validator], Dict[str, Any], OnFailAction],
]

# Validator specification for use_many()
UseManyValidatorSpec: TypeAlias = Union[
    Validator,
    type[Validator],
    Tuple[type[Validator], Dict[str, Any]],
    Tuple[type[Validator], Dict[str, Any], OnFailAction],
]

# Tuple of validators for use_many()
UseManyValidatorTuple: TypeAlias = Tuple[UseManyValidatorSpec, ...]

__all__ = [
    "ValidatorMap",
    "UseValidatorSpec",
    "UseManyValidatorSpec",
    "UseManyValidatorTuple",
]


