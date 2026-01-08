"""Guardrails chat engine for LlamaIndex integration."""

from typing import Any, Optional, List

try:
    from llama_index.core.chat_engine import BaseChatEngine
    LLAMA_INDEX_AVAILABLE = True
except ImportError:
    LLAMA_INDEX_AVAILABLE = False
    BaseChatEngine = None  # type: ignore

from wall_library.guard import WallGuard
from wall_library.logger import logger


class GuardrailsChatEngine:
    """Guardrails chat engine wrapper for LlamaIndex."""

    def __init__(self, chat_engine: Any, guard: WallGuard):
        """Initialize guardrails chat engine.

        Args:
            chat_engine: Base LlamaIndex chat engine
            guard: WallGuard instance for validation
        """
        if not LLAMA_INDEX_AVAILABLE:
            raise ImportError(
                "LlamaIndex is required. Install with: pip install wall-library[llama_index]"
            )

        self.chat_engine = chat_engine
        self.guard = guard

    def chat(self, message: str, **kwargs) -> Any:
        """Chat with validation.

        Args:
            message: Chat message
            **kwargs: Additional arguments

        Returns:
            Chat response with validation
        """
        # Execute chat
        response = self.chat_engine.chat(message, **kwargs)

        # Validate response
        if hasattr(response, "response"):
            validated = self.guard.validate(str(response.response))
            if not validated.validation_passed:
                logger.warning(f"Chat response validation failed: {validated.error_spans}")

        return response

    def stream_chat(self, message: str, **kwargs):
        """Stream chat with validation.

        Args:
            message: Chat message
            **kwargs: Additional arguments

        Yields:
            Streamed chat responses
        """
        # Stream chat
        for response in self.chat_engine.stream_chat(message, **kwargs):
            # Validate each chunk (simplified)
            if hasattr(response, "response"):
                yield response
            else:
                yield response

