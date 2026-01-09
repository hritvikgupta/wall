"""API utilities."""

from typing import Any, Dict


def extract_serializeable_metadata(metadata: Dict[str, Any]) -> Dict[str, Any]:
    """Extract serializable metadata.

    Args:
        metadata: Metadata dictionary

    Returns:
        Serializable metadata dictionary
    """
    import json

    serializable = {}
    for key, value in metadata.items():
        try:
            json.dumps(value)
            serializable[key] = value
        except (TypeError, ValueError):
            # Skip non-serializable values
            pass

    return serializable


