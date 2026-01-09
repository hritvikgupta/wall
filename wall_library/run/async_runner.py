"""Async runner for async LLM execution."""

from typing import Any, Callable, Dict, Optional

from wall_library.run.runner import Runner
from wall_library.llm_providers import AsyncPromptCallableBase, PromptCallableBase


class AsyncRunner(Runner):
    """Async runner for async LLM execution with validation."""

    def __init__(self, *args, api: Optional[PromptCallableBase] = None, **kwargs):
        """Initialize async runner."""
        super().__init__(*args, api=api, **kwargs)
        self.async_api = api

    async def run(self, prompt: str, **kwargs) -> str:
        """Async run LLM with prompt and return output.

        Args:
            prompt: Prompt to use
            **kwargs: Additional arguments

        Returns:
            LLM output string
        """
        if self.async_api is None:
            raise ValueError("LLM API not provided")

        # Call async LLM API
        if isinstance(self.async_api, AsyncPromptCallableBase):
            output = await self.async_api(prompt, **kwargs)
        else:
            # Fallback to sync call
            output = self.async_api(prompt, **kwargs)

        if isinstance(output, str):
            return output
        if hasattr(output, "content"):
            return str(output.content)
        return str(output)


