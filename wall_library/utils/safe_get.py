"""Safe dictionary access utilities."""

from typing import Any, Dict, Optional, Union


def safe_get(data: Union[Dict, list, Any], *keys, default=None) -> Any:
    """Safely get nested dictionary values.

    Args:
        data: Dictionary, list, or other data structure
        *keys: Keys to traverse
        default: Default value if key not found

    Returns:
        Value at the nested key path, or default if not found
    """
    try:
        result = data
        for key in keys:
            if isinstance(result, dict):
                result = result.get(key)
            elif isinstance(result, list):
                if isinstance(key, int) and 0 <= key < len(result):
                    result = result[key]
                else:
                    return default
            else:
                return default
            if result is None:
                return default
        return result
    except (KeyError, IndexError, TypeError, AttributeError):
        return default


