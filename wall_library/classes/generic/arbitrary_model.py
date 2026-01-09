"""Arbitrary model support."""

from typing import Any, Dict


class ArbitraryModel:
    """Model for arbitrary data."""

    def __init__(self, data: Dict[str, Any]):
        """Initialize arbitrary model.

        Args:
            data: Dictionary of data
        """
        self._data = data

    def __getattr__(self, name: str) -> Any:
        """Get attribute from data."""
        return self._data.get(name)

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary."""
        return self._data.copy()


