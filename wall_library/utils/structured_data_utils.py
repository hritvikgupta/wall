"""Structured data utilities."""

from typing import Any, Dict
import json


def json_function_calling_tool(schema: Dict[str, Any]) -> Dict[str, Any]:
    """Create JSON function calling tool definition.

    Args:
        schema: JSON schema

    Returns:
        Function calling tool definition
    """
    return {
        "type": "function",
        "function": {
            "name": "structured_output",
            "description": "Generate structured output",
            "parameters": schema,
        },
    }


def output_format_json_schema(schema: Dict[str, Any]) -> Dict[str, Any]:
    """Format JSON schema for output.

    Args:
        schema: JSON schema

    Returns:
        Formatted JSON schema
    """
    # Ensure schema is properly formatted
    formatted = {
        "type": schema.get("type", "object"),
        "properties": schema.get("properties", {}),
    }

    if "required" in schema:
        formatted["required"] = schema["required"]

    return formatted

