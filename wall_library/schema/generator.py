"""Schema generation utilities."""

from typing import Any, Dict


def generate_json_schema(processed_schema) -> Dict[str, Any]:
    """Generate JSON schema from processed schema.

    Args:
        processed_schema: ProcessedSchema instance

    Returns:
        JSON schema dictionary
    """
    return processed_schema.schema

