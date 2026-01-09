"""Exception utilities."""

from typing import Any, Optional


class UserFacingException(Exception):
    """User-facing exception with user-friendly message."""

    def __init__(self, message: str, user_message: Optional[str] = None, **kwargs):
        """Initialize user-facing exception.

        Args:
            message: Technical error message
            user_message: User-friendly message
            **kwargs: Additional exception data
        """
        super().__init__(message)
        self.user_message = user_message or message
        self.kwargs = kwargs

    def __str__(self) -> str:
        return self.user_message


