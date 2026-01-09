"""Experimental decorator."""

from functools import wraps
from typing import Callable, Any
from wall_library.logger import logger


def experimental(func: Callable) -> Callable:
    """Mark function as experimental.

    Args:
        func: Function to mark as experimental

    Returns:
        Wrapped function
    """
    @wraps(func)
    def wrapper(*args: Any, **kwargs: Any) -> Any:
        logger.warning(f"Using experimental feature: {func.__name__}")
        return func(*args, **kwargs)

    return wrapper


