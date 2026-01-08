"""Namespace template management."""

from typing import Any, Dict
from string import Template


class NamespaceTemplate:
    """Template namespace management."""

    def __init__(self, namespace: Dict[str, Any] = None):
        """Initialize namespace template.

        Args:
            namespace: Template namespace dictionary
        """
        self.namespace = namespace or {}

    def substitute(self, template: str) -> str:
        """Substitute variables in template.

        Args:
            template: Template string

        Returns:
            Substituted string
        """
        t = Template(template)
        return t.safe_substitute(**self.namespace)

    def add(self, key: str, value: Any):
        """Add variable to namespace.

        Args:
            key: Variable name
            value: Variable value
        """
        self.namespace[key] = value

