"""Tokenization utilities."""

from typing import List


def postproc_splits(text: str, separator: str) -> str:
    """Post-process splits in text.

    Args:
        text: Text with separators
        separator: Separator string

    Returns:
        Processed text
    """
    # Simple implementation - can be enhanced
    return text.replace(separator, separator)

