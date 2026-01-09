"""XML utilities."""

from typing import Optional
from lxml.etree import _Element


def xml_to_string(element: Optional[_Element]) -> Optional[str]:
    """Convert XML element to string.

    Args:
        element: XML element

    Returns:
        String representation or None
    """
    if element is None:
        return None
    if hasattr(element, "text"):
        return element.text
    if hasattr(element, "tag"):
        return str(element.tag)
    return str(element)


