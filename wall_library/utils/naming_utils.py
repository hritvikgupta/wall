"""Naming utilities."""

import uuid


def random_id(prefix: str = "wall") -> str:
    """Generate a random ID.

    Args:
        prefix: Prefix for the ID

    Returns:
        Random ID string
    """
    return f"{prefix}_{uuid.uuid4().hex[:8]}"

