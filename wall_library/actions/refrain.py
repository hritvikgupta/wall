"""Refrain action implementation."""

from typing import Any

from wall_library.classes.validation.validation_result import FailResult


class Refrain:
    """Refrain action for handling validation failures."""

    @staticmethod
    def apply(value: Any, fail_result: FailResult) -> str:
        """Return empty value on failure.

        Args:
            value: Value that failed validation
            fail_result: Failure result

        Returns:
            Empty string
        """
        return ""

