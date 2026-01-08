"""LLM provider base classes."""

from abc import ABC, abstractmethod
from typing import Any, AsyncIterator, Iterator, Optional, Dict
from enum import Enum


class LLMAPIEnum(str, Enum):
    """LLM API enum."""

    OPENAI = "openai"
    ANTHROPIC = "anthropic"
    CUSTOM = "custom"


class PromptCallableBase(ABC):
    """Base class for LLM providers."""

    @abstractmethod
    def __call__(self, *args: Any, **kwargs: Any) -> str:
        """Call LLM API and return response."""
        pass

    @abstractmethod
    def stream(self, *args: Any, **kwargs: Any) -> Iterator[str]:
        """Stream LLM API response."""
        pass


class AsyncPromptCallableBase(ABC):
    """Base class for async LLM providers."""

    @abstractmethod
    async def __call__(self, *args: Any, **kwargs: Any) -> str:
        """Async call LLM API and return response."""
        pass

    @abstractmethod
    async def stream(self, *args: Any, **kwargs: Any) -> AsyncIterator[str]:
        """Async stream LLM API response."""
        pass


def get_llm_api_enum(provider: str) -> LLMAPIEnum:
    """Get LLM API enum from provider string."""
    try:
        return LLMAPIEnum[provider.upper()]
    except KeyError:
        return LLMAPIEnum.CUSTOM


def get_llm_ask(provider: str) -> PromptCallableBase:
    """Get LLM ask function for provider."""
    # This would be implemented to return appropriate provider
    raise NotImplementedError("Provider-specific implementation needed")


def model_is_supported_server_side(model: str) -> bool:
    """Check if model is supported server-side."""
    # Default implementation
    return False

