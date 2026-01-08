"""Base runnable class for LangChain integration."""

from typing import Any, Dict, Optional

try:
    from langchain_core.runnables import Runnable
    LANGCHAIN_AVAILABLE = True
except ImportError:
    LANGCHAIN_AVAILABLE = False
    Runnable = None  # type: ignore

from wall_library.logger import logger


class BaseRunnable(Runnable):
    """Base runnable class for LangChain integration."""

    def __init__(self):
        """Initialize base runnable."""
        if not LANGCHAIN_AVAILABLE:
            raise ImportError("LangChain is required. Install with: pip install wall-library[langchain]")

        super().__init__()

    def invoke(self, input: Dict[str, Any], config: Optional[Dict] = None) -> Dict[str, Any]:
        """Invoke the runnable (to be overridden).

        Args:
            input: Input dictionary
            config: Optional configuration

        Returns:
            Output dictionary
        """
        raise NotImplementedError("invoke method must be implemented")

    async def ainvoke(self, input: Dict[str, Any], config: Optional[Dict] = None) -> Dict[str, Any]:
        """Async invoke the runnable (to be overridden).

        Args:
            input: Input dictionary
            config: Optional configuration

        Returns:
            Output dictionary
        """
        raise NotImplementedError("ainvoke method must be implemented")

