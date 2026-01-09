"""Instructions class."""

from dataclasses import dataclass
from typing import Optional

from wall_library.prompt.base_prompt import BasePrompt


@dataclass
class Instructions(BasePrompt):
    """System instructions class."""

    content: str
    source: Optional[str] = None

    def to_string(self) -> str:
        """Convert instructions to string."""
        return self.content

    def to_dict(self) -> dict:
        """Convert instructions to dictionary."""
        return {
            "content": self.content,
            "source": self.source,
        }

    def __repr__(self) -> str:
        return f"Instructions(source={self.source})"


