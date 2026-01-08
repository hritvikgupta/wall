"""Guard Runnable for LangChain integration."""

from typing import Any, Dict, Optional

try:
    from langchain_core.runnables import Runnable
    LANGCHAIN_AVAILABLE = True
except ImportError:
    LANGCHAIN_AVAILABLE = False
    Runnable = None  # type: ignore

from wall_library.guard import WallGuard
from wall_library.logger import logger


class GuardRunnable(Runnable):
    """Guard as LangChain Runnable."""

    def __init__(self, guard: WallGuard):
        """Initialize guard runnable.

        Args:
            guard: WallGuard instance
        """
        if not LANGCHAIN_AVAILABLE:
            raise ImportError("LangChain is required. Install with: pip install wall-library[langchain]")

        self.guard = guard

    def invoke(self, input: Dict[str, Any], config: Optional[Dict] = None) -> Dict[str, Any]:
        """Invoke the runnable with input validation.

        Args:
            input: Input dictionary
            config: Optional configuration

        Returns:
            Output dictionary with validated result
        """
        prompt = input.get("prompt", input.get("messages", ""))
        llm_api = input.get("llm_api")
        result = self.guard(llm_api=llm_api, prompt=prompt, **input)
        return {"output": result[1], "validated_output": result[1], "raw_output": result[0]}

    async def ainvoke(self, input: Dict[str, Any], config: Optional[Dict] = None) -> Dict[str, Any]:
        """Async invoke the runnable.

        Args:
            input: Input dictionary
            config: Optional configuration

        Returns:
            Output dictionary
        """
        from wall_library.async_guard import AsyncGuard

        if isinstance(self.guard, AsyncGuard):
            prompt = input.get("prompt", input.get("messages", ""))
            llm_api = input.get("llm_api")
            result = await self.guard(llm_api=llm_api, prompt=prompt, **input)
            return {"output": result[1], "validated_output": result[1], "raw_output": result[0]}
        else:
            return self.invoke(input, config)

