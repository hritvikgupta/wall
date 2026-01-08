"""Formatter modules."""

from wall_library.formatters.base_formatter import BaseFormatter
from wall_library.formatters.json_formatter import JSONFormatter

__all__ = [
    "BaseFormatter",
    "JSONFormatter",
    "get_formatter",
]


def get_formatter(formatter_type: str) -> BaseFormatter:
    """Get formatter by type.

    Args:
        formatter_type: Type of formatter (json, etc.)

    Returns:
        Formatter instance
    """
    if formatter_type == "json":
        return JSONFormatter()
    else:
        raise ValueError(f"Unknown formatter type: {formatter_type}")

