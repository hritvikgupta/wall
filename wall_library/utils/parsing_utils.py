"""Parsing utilities."""

from typing import Any, Dict, List
import json


def parse_llm_output(output: str) -> Any:
    """Parse LLM output.

    Args:
        output: LLM output string

    Returns:
        Parsed output
    """
    # Try to parse as JSON first
    try:
        return json.loads(output)
    except json.JSONDecodeError:
        # Return as string
        return output


def coerce_types(value: Any, target_type: type) -> Any:
    """Coerce value to target type.

    Args:
        value: Value to coerce
        target_type: Target type

    Returns:
        Coerced value
    """
    try:
        if target_type == str:
            return str(value)
        elif target_type == int:
            return int(value)
        elif target_type == float:
            return float(value)
        elif target_type == bool:
            return bool(value)
        elif target_type == list:
            if isinstance(value, list):
                return value
            return [value]
        elif target_type == dict:
            if isinstance(value, dict):
                return value
            return {"value": value}
        else:
            return value
    except (ValueError, TypeError):
        return value


def prune_extra_keys(data: Dict[str, Any], schema: Dict[str, Any]) -> Dict[str, Any]:
    """Prune extra keys from data based on schema.

    Args:
        data: Data dictionary
        schema: JSON schema

    Returns:
        Pruned data dictionary
    """
    properties = schema.get("properties", {})
    pruned = {}

    for key, value in data.items():
        if key in properties:
            pruned[key] = value

    return pruned


