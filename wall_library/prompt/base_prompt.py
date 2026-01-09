"""Base prompt class."""

from abc import ABC, abstractmethod
from typing import Any, Dict, Optional


class BasePrompt(ABC):
    """Base class for prompts."""

    @abstractmethod
    def to_string(self) -> str:
        """Convert prompt to string."""
        pass

    @abstractmethod
    def to_dict(self) -> Dict[str, Any]:
        """Convert prompt to dictionary."""
        pass


