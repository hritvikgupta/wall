"""Context storage utilities."""

from contextvars import ContextVar
from typing import Any, Dict, Optional

# Context variables
_call_kwargs: ContextVar[Dict[str, Any]] = ContextVar("_call_kwargs", default={})
_guard_name: ContextVar[Optional[str]] = ContextVar("_guard_name", default=None)
_tracer: ContextVar[Optional["Tracer"]] = ContextVar("_tracer", default=None)
_tracer_context: ContextVar[Optional[Dict[str, Any]]] = ContextVar(
    "_tracer_context", default=None
)


class Tracer:
    """Tracing context class."""

    def __init__(self, name: str = "wall_library"):
        """Initialize tracer."""
        self.name = name
        self.events: list = []

    def trace(self, event: str, **kwargs):
        """Trace an event."""
        self.events.append({"event": event, **kwargs})


class Context:
    """Context storage class."""

    def __init__(self):
        """Initialize context."""
        self._data: Dict[str, Any] = {}

    def set(self, key: str, value: Any):
        """Set a context value."""
        self._data[key] = value

    def get(self, key: str, default: Any = None):
        """Get a context value."""
        return self._data.get(key, default)


def set_call_kwargs(kwargs: Dict[str, Any]):
    """Set call kwargs in context."""
    _call_kwargs.set(kwargs)


def get_call_kwarg(key: str, default: Any = None) -> Any:
    """Get call kwarg from context."""
    return _call_kwargs.get({}).get(key, default)


def set_guard_name(name: str):
    """Set guard name in context."""
    _guard_name.set(name)


def get_guard_name() -> Optional[str]:
    """Get guard name from context."""
    return _guard_name.get()


def set_tracer(tracer: Optional[Tracer]):
    """Set tracer in context."""
    _tracer.set(tracer)


def get_tracer() -> Optional[Tracer]:
    """Get tracer from context."""
    return _tracer.get()


def get_tracer_context() -> Optional[Dict[str, Any]]:
    """Get tracer context."""
    return _tracer_context.get()


def set_tracer_context(context: Optional[Dict[str, Any]]):
    """Set tracer context."""
    _tracer_context.set(context)


