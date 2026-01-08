"""LangGraph wrapper for wall_library."""

from typing import Any, Dict, Optional

try:
    from langgraph.graph import StateGraph
    LANGGRAPH_AVAILABLE = True
except ImportError:
    LANGGRAPH_AVAILABLE = False
    StateGraph = None  # type: ignore

from wall_library.guard import WallGuard
from wall_library.logger import logger


class LangGraphWrapper:
    """Wrapper for integrating wall_library with LangGraph."""

    def __init__(self, guard: WallGuard):
        """Initialize LangGraph wrapper.

        Args:
            guard: WallGuard instance
        """
        if not LANGGRAPH_AVAILABLE:
            raise ImportError(
                "LangGraph is required. Install with: pip install wall-library[langgraph]"
            )

        self.guard = guard

    def create_node(self, node_name: str) -> callable:
        """Create a LangGraph node with guard validation.

        Args:
            node_name: Name of the node

        Returns:
            Node function
        """
        def node(state: Dict[str, Any]) -> Dict[str, Any]:
            """Node function with guard validation."""
            input_data = state.get("input", state)
            prompt = input_data.get("prompt", str(input_data))

            # Validate input
            input_outcome = self.guard.validate(prompt)

            if not input_outcome.validation_passed:
                state["error"] = "Input validation failed"
                return state

            # Process with LLM (if provided)
            llm_api = state.get("llm_api")
            if llm_api:
                result = self.guard(llm_api=llm_api, prompt=prompt, **input_data)
                state["output"] = result[1]  # Validated output
            else:
                state["output"] = input_outcome.validated_output

            return state

        return node

