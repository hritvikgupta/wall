"""Type definitions for wall_library."""

from wall_library.types.on_fail import OnFailAction
from wall_library.types.validator import (
    ValidatorMap,
    UseValidatorSpec,
    UseManyValidatorSpec,
    UseManyValidatorTuple,
)
from wall_library.types.pydantic import ModelOrListOfModels

__all__ = [
    "OnFailAction",
    "ValidatorMap",
    "UseValidatorSpec",
    "UseManyValidatorSpec",
    "UseManyValidatorTuple",
    "ModelOrListOfModels",
]

