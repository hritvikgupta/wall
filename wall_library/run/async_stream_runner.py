"""Async stream runner for async streaming LLM execution."""

from typing import Any, AsyncIterator, Callable, Dict, Optional

from wall_library.run.async_runner import AsyncRunner
from wall_library.llm_providers import AsyncPromptCallableBase


class AsyncStreamRunner(AsyncRunner):
    """Async stream runner for async streaming LLM execution."""

    async def stream(self, prompt: str, **kwargs) -> AsyncIterator[str]:
        """Async stream LLM response with prompt.

        Args:
            prompt: Prompt to use
            **kwargs: Additional arguments

        Yields:
            Chunks of LLM output
        """
        if self.async_api is None:
            raise ValueError("LLM API not provided")

        if isinstance(self.async_api, AsyncPromptCallableBase):
            async for chunk in self.async_api.stream(prompt, **kwargs):
                yield chunk
        else:
            raise ValueError("Async API required for streaming")


