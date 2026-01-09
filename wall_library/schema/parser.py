"""Schema parsing utilities."""

from typing import Any, Dict


def parse_schema(schema_input: Any) -> Dict[str, Any]:
    """Parse schema from various formats.

    Args:
        schema_input: Schema in various formats

    Returns:
        JSON schema dictionary
    """
    if isinstance(schema_input, dict):
        return schema_input
    elif isinstance(schema_input, str):
        # Try to parse as JSON
        import json

        try:
            return json.loads(schema_input)
        except json.JSONDecodeError:
            # Treat as RAIL string
            from wall_library.schema.rail_schema import rail_string_to_schema

            processed = rail_string_to_schema(schema_input)
            return processed.schema
    else:
        raise ValueError(f"Unsupported schema format: {type(schema_input)}")


