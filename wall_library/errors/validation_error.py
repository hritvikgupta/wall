"""Validation error exception."""


class ValidationError(Exception):
    """Main validation error exception."""

    def __init__(self, message: str, error_spans=None, fix_value=None):
        """Initialize validation error."""
        super().__init__(message)
        self.message = message
        self.error_spans = error_spans or []
        self.fix_value = fix_value

    def __repr__(self) -> str:
        return f"ValidationError({self.message})"

