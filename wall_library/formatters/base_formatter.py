"""Base formatter class."""

from abc import ABC, abstractmethod
from typing import Any, Dict


class BaseFormatter(ABC):
    """Base class for formatters."""

    @abstractmethod
    def format(self, data: Any) -> str:
        """Format data to string.

        Args:
            data: Data to format

        Returns:
            Formatted string
        """
        pass

    @abstractmethod
    def parse(self, text: str) -> Any:
        """Parse formatted string to data.

        Args:
            text: Formatted string

        Returns:
            Parsed data
        """
        pass


