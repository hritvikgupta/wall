"""LangChain wrapper for wall_library."""

from typing import Any, Dict, Optional

try:
    from langchain_core.runnables import Runnable
    LANGCHAIN_AVAILABLE = True
except ImportError:
    LANGCHAIN_AVAILABLE = False
    Runnable = None  # type: ignore

from wall_library.guard import WallGuard
from wall_library.logger import logger


class LangChainWrapper:
    """Wrapper for integrating wall_library with LangChain."""

    def __init__(self, guard: WallGuard):
        """Initialize LangChain wrapper.

        Args:
            guard: WallGuard instance
        """
        if not LANGCHAIN_AVAILABLE:
            raise ImportError("LangChain is required. Install with: pip install wall-library[langchain]")

        self.guard = guard

    def to_runnable(self) -> Runnable:
        """Convert guard to LangChain Runnable.

        Returns:
            LangChain Runnable
        """
        if not LANGCHAIN_AVAILABLE:
            raise ImportError("LangChain is required")

        class GuardRunnable(Runnable):
            """Runnable wrapper for guard."""

            def __init__(self, guard: WallGuard):
                self.guard = guard

            def invoke(self, input: Dict[str, Any], config: Optional[Dict] = None) -> Any:
                """Invoke the runnable."""
                prompt = input.get("prompt", input.get("messages", ""))
                llm_api = input.get("llm_api")
                result = self.guard(llm_api=llm_api, prompt=prompt, **input)
                return {"output": result[1]}  # Return validated output

            async def ainvoke(self, input: Dict[str, Any], config: Optional[Dict] = None) -> Any:
                """Async invoke the runnable."""
                from wall_library.async_guard import AsyncGuard

                if isinstance(self.guard, AsyncGuard):
                    prompt = input.get("prompt", input.get("messages", ""))
                    llm_api = input.get("llm_api")
                    result = await self.guard(llm_api=llm_api, prompt=prompt, **input)
                    return {"output": result[1]}
                else:
                    return self.invoke(input, config)

        return GuardRunnable(self.guard)


