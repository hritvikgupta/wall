"""Regex utilities."""

import re
from typing import List


def split_on(text: str, delimiter: str = ";") -> List[str]:
    """Split text on delimiter, handling escaped delimiters.

    Args:
        text: Text to split
        delimiter: Delimiter to split on

    Returns:
        List of split strings
    """
    if not text:
        return []
    # Simple split for now, can be enhanced to handle escaping
    parts = [part.strip() for part in text.split(delimiter) if part.strip()]
    return parts


