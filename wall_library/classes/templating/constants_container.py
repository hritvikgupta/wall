"""Constants container for templates."""

from typing import Dict, Any


class ConstantsContainer:
    """Constants container for templates."""

    def __init__(self):
        """Initialize constants container."""
        self.constants: Dict[str, Any] = {
            "complete_json_suffix_v2": "\n```json\n",
        }

    def get(self, name: str, default: Any = None) -> Any:
        """Get constant by name.

        Args:
            name: Constant name
            default: Default value

        Returns:
            Constant value
        """
        return self.constants.get(name, default)

    def add(self, name: str, value: Any):
        """Add constant.

        Args:
            name: Constant name
            value: Constant value
        """
        self.constants[name] = value


