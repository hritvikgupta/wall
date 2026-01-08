"""Input type definitions."""

from enum import Enum


class InputType(str, Enum):
    """Input types for validation."""

    STRING = "string"
    MESSAGES = "messages"


__all__ = ["InputType"]

