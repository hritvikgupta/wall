"""Call tracing utilities."""

from typing import Any, Dict, Optional


def trace_call(call_name: str, **kwargs) -> Dict[str, Any]:
    """Trace a function call (simplified).

    Args:
        call_name: Name of the call
        **kwargs: Call parameters

    Returns:
        Trace data
    """
    return {
        "call_name": call_name,
        "parameters": kwargs,
    }


