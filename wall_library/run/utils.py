"""Utility functions for runner operations."""

from typing import List, Dict, Any, Optional


def messages_source(messages: List[Dict[str, Any]]) -> Optional[str]:
    """Get message source from messages list.

    Args:
        messages: List of message dictionaries

    Returns:
        Source string or None
    """
    if not messages:
        return None

    # Extract text from messages
    texts = []
    for msg in messages:
        content = msg.get("content", "")
        if isinstance(content, str):
            texts.append(content)
        elif isinstance(content, list):
            # Handle multimodal content
            for item in content:
                if isinstance(item, dict) and item.get("type") == "text":
                    texts.append(item.get("text", ""))

    return " ".join(texts)

