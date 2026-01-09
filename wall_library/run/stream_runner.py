"""Stream runner for streaming LLM execution."""

from typing import Any, Callable, Dict, Iterator, Optional

from wall_library.run.runner import Runner
from wall_library.llm_providers import PromptCallableBase


class StreamRunner(Runner):
    """Stream runner for streaming LLM execution with validation."""

    def stream(self, prompt: str, **kwargs) -> Iterator[str]:
        """Stream LLM response with prompt.

        Args:
            prompt: Prompt to use
            **kwargs: Additional arguments

        Yields:
            Chunks of LLM output
        """
        if self.api is None:
            raise ValueError("LLM API not provided")

        # Stream from LLM API
        for chunk in self.api.stream(prompt, **kwargs):
            yield chunk


