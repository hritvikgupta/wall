"""Prompt class."""

from dataclasses import dataclass, field
from typing import Any, Dict, Optional
from string import Template

from wall_library.prompt.base_prompt import BasePrompt


@dataclass
class Prompt(BasePrompt):
    """Main prompt class with variable substitution."""

    template: str
    variables: Dict[str, Any] = field(default_factory=dict)
    source: Optional[str] = None

    def to_string(self) -> str:
        """Convert prompt to string with variable substitution."""
        try:
            template = Template(self.template)
            return template.safe_substitute(**self.variables)
        except Exception:
            # Fallback if template substitution fails
            return self.template

    def to_dict(self) -> Dict[str, Any]:
        """Convert prompt to dictionary."""
        return {
            "template": self.template,
            "variables": self.variables,
            "source": self.source,
        }

    def __repr__(self) -> str:
        return f"Prompt(source={self.source})"


