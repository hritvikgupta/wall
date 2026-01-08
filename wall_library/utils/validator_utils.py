"""Validator utilities."""

from typing import Optional, Dict, Any
from wall_library.validator_base import Validator, get_validator
from wall_library.classes.validation.validator_reference import ValidatorReference


def parse_validator_reference(ref_spec: str) -> Optional[ValidatorReference]:
    """Parse validator reference from string specification.

    Args:
        ref_spec: Validator reference specification

    Returns:
        ValidatorReference or None
    """
    # Simple parsing - would be more sophisticated in full implementation
    parts = ref_spec.split(":")
    validator_id = parts[0]

    validator_cls = get_validator(validator_id)
    if not validator_cls:
        return None

    kwargs = {}
    if len(parts) > 1:
        # Parse kwargs (simplified)
        kwargs_str = parts[1]
        kwargs = dict(item.split("=") for item in kwargs_str.split(","))

    return ValidatorReference(
        id=validator_id,
        on="output",
        kwargs=kwargs,
    )


def verify_metadata_requirements(validator: Validator, metadata: Dict[str, Any]) -> bool:
    """Verify that metadata meets validator requirements.

    Args:
        validator: Validator instance
        metadata: Metadata dictionary

    Returns:
        True if metadata meets requirements
    """
    required_keys = getattr(validator, "required_metadata_keys", [])
    return all(key in metadata for key in required_keys)

