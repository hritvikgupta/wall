"""Prompt utilities."""

from typing import List, Dict, Any, Optional
from wall_library.prompt.messages import Messages


def messages_to_prompt_string(messages: List[Dict[str, Any]]) -> str:
    """Convert messages list to prompt string.

    Args:
        messages: List of message dictionaries

    Returns:
        Prompt string
    """
    msg_obj = Messages(messages=messages)
    return msg_obj.to_string()


def prompt_content_for_schema(schema: Dict[str, Any]) -> str:
    """Generate prompt content for schema.

    Args:
        schema: JSON schema dictionary

    Returns:
        Prompt content string
    """
    # Simplified implementation
    schema_str = str(schema)
    return f"Please generate output matching this schema:\n{schema_str}"


