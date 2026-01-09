"""Primitive schema conversion utilities."""

from typing import Any, Dict, Type, get_origin, get_args


def primitive_to_schema(primitive_type: Type) -> Dict[str, Any]:
    """Convert primitive type to JSON schema.

    Args:
        primitive_type: Primitive type class

    Returns:
        JSON schema dictionary
    """
    type_mapping = {
        str: {"type": "string"},
        int: {"type": "integer"},
        float: {"type": "number"},
        bool: {"type": "boolean"},
        list: {"type": "array", "items": {}},
        dict: {"type": "object", "properties": {}},
    }

    # Handle typing.List, typing.Dict, etc.
    origin = get_origin(primitive_type)
    if origin is not None:
        if origin is list:
            args = get_args(primitive_type)
            item_schema = primitive_to_schema(args[0]) if args else {}
            return {"type": "array", "items": item_schema}
        elif origin is dict:
            args = get_args(primitive_type)
            return {"type": "object", "properties": {}}

    # Direct type mapping
    if primitive_type in type_mapping:
        return type_mapping[primitive_type]

    # Default to string
    return {"type": "string"}


