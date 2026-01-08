"""Schema validation utilities."""

from typing import Any, Dict
import jsonschema
from jsonschema import validate as jsonschema_validate, ValidationError as JSONSchemaValidationError

from wall_library.errors.validation_error import ValidationError


class SchemaValidationError(ValidationError):
    """Custom exception for schema validation errors."""

    pass


def validate_json_schema(instance: Any, schema: Dict[str, Any]) -> bool:
    """Validate instance against JSON schema.

    Args:
        instance: Instance to validate
        schema: JSON schema

    Returns:
        True if valid, raises SchemaValidationError if invalid
    """
    try:
        jsonschema_validate(instance=instance, schema=schema)
        return True
    except JSONSchemaValidationError as e:
        raise SchemaValidationError(
            f"Schema validation failed: {e.message}",
            fix_value=e.instance,
        )


def schema_validation(instance: Any, schema: Dict[str, Any]) -> bool:
    """General schema validation.

    Args:
        instance: Instance to validate
        schema: Schema dictionary

    Returns:
        True if valid, raises SchemaValidationError if invalid
    """
    return validate_json_schema(instance, schema)

