"""Prompt callable class."""

from typing import Any, Callable, Dict, Optional


class PromptCallable:
    """Prompt callable wrapper."""

    def __init__(self, callable_func: Callable):
        """Initialize prompt callable."""
        self.callable_func = callable_func

    def __call__(self, *args: Any, **kwargs: Any) -> Any:
        """Call the wrapped function."""
        return self.callable_func(*args, **kwargs)

    def __repr__(self) -> str:
        return f"PromptCallable(func={self.callable_func.__name__})"


