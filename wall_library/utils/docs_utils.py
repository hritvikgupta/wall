"""Documentation utilities."""

from typing import Any, Dict


def generate_docs(module_or_class: Any) -> str:
    """Generate documentation for module or class.

    Args:
        module_or_class: Module or class to document

    Returns:
        Documentation string
    """
    # Simplified implementation
    if hasattr(module_or_class, "__doc__"):
        return module_or_class.__doc__ or ""
    return ""


