"""Guardrails query engine for LlamaIndex integration."""

from typing import Any, Optional, List

try:
    from llama_index.core.query_engine import BaseQueryEngine
    LLAMA_INDEX_AVAILABLE = True
except ImportError:
    LLAMA_INDEX_AVAILABLE = False
    BaseQueryEngine = None  # type: ignore

from wall_library.guard import WallGuard
from wall_library.logger import logger


class GuardrailsQueryEngine:
    """Guardrails query engine wrapper for LlamaIndex."""

    def __init__(self, query_engine: Any, guard: WallGuard):
        """Initialize guardrails query engine.

        Args:
            query_engine: Base LlamaIndex query engine
            guard: WallGuard instance for validation
        """
        if not LLAMA_INDEX_AVAILABLE:
            raise ImportError(
                "LlamaIndex is required. Install with: pip install wall-library[llama_index]"
            )

        self.query_engine = query_engine
        self.guard = guard

    def query(self, query_str: str, **kwargs) -> Any:
        """Query with validation.

        Args:
            query_str: Query string
            **kwargs: Additional arguments

        Returns:
            Query response with validation
        """
        # Execute query
        response = self.query_engine.query(query_str, **kwargs)

        # Validate response
        if hasattr(response, "response"):
            validated = self.guard.validate(str(response.response))
            if not validated.validation_passed:
                logger.warning(f"Query response validation failed: {validated.error_spans}")

        return response

