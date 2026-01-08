"""Messages class for chat messages."""

from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional

from wall_library.prompt.base_prompt import BasePrompt


@dataclass
class Messages(BasePrompt):
    """Chat messages class."""

    messages: List[Dict[str, Any]] = field(default_factory=list)
    source: Optional[str] = None

    def add_message(self, role: str, content: str, **kwargs):
        """Add a message to the conversation.

        Args:
            role: Message role (system, user, assistant)
            content: Message content
            **kwargs: Additional message fields
        """
        message = {"role": role, "content": content, **kwargs}
        self.messages.append(message)

    def to_string(self) -> str:
        """Convert messages to string representation."""
        lines = []
        for msg in self.messages:
            role = msg.get("role", "unknown")
            content = msg.get("content", "")
            lines.append(f"{role}: {content}")
        return "\n".join(lines)

    def to_dict(self) -> dict:
        """Convert messages to dictionary."""
        return {
            "messages": self.messages,
            "source": self.source,
        }

    def __repr__(self) -> str:
        return f"Messages(count={len(self.messages)})"

