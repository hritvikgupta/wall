"""Processed schema class."""

from dataclasses import dataclass, field
from typing import Any, Dict, List

from wall_library.classes.validation.validator_reference import ValidatorReference
from wall_library.types.validator import ValidatorMap
from wall_library.validator_base import Validator


@dataclass
class ProcessedSchema:
    """Processed schema representation."""

    schema: Dict[str, Any] = field(default_factory=dict)
    validators: List[ValidatorReference] = field(default_factory=list)
    validator_map: ValidatorMap = field(default_factory=dict)

    def add_validator(
        self, validator: Validator, json_path: str, on_fail=None, **kwargs
    ):
        """Add a validator to the schema."""
        from wall_library.classes.validation.validator_reference import ValidatorReference
        from wall_library.types.on_fail import OnFailAction

        validator_ref = ValidatorReference(
            id=validator.rail_alias or validator.__class__.__name__,
            on=json_path,
            on_fail=on_fail or OnFailAction.NOOP,
            kwargs=kwargs,
        )
        self.validators.append(validator_ref)

        if json_path not in self.validator_map:
            self.validator_map[json_path] = []
        self.validator_map[json_path].append(validator)

    def __repr__(self) -> str:
        return f"ProcessedSchema(validators={len(self.validators)})"


