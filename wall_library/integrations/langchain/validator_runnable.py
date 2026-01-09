"""Validator Runnable for LangChain integration."""

from typing import Any, Dict, Optional

try:
    from langchain_core.runnables import Runnable
    LANGCHAIN_AVAILABLE = True
except ImportError:
    LANGCHAIN_AVAILABLE = False
    Runnable = None  # type: ignore

from wall_library.validator_base import Validator
from wall_library.logger import logger


class ValidatorRunnable(Runnable):
    """Validator as LangChain Runnable."""

    def __init__(self, validator: Validator):
        """Initialize validator runnable.

        Args:
            validator: Validator instance
        """
        if not LANGCHAIN_AVAILABLE:
            raise ImportError("LangChain is required. Install with: pip install wall-library[langchain]")

        self.validator = validator

    def invoke(self, input: Dict[str, Any], config: Optional[Dict] = None) -> Dict[str, Any]:
        """Invoke the validator.

        Args:
            input: Input dictionary with 'value' key
            config: Optional configuration

        Returns:
            Validation result dictionary
        """
        value = input.get("value", "")
        metadata = input.get("metadata", {})
        result = self.validator.validate(value, metadata=metadata)

        return {
            "value": value,
            "validated": result.is_pass,
            "result": result,
        }

    async def ainvoke(self, input: Dict[str, Any], config: Optional[Dict] = None) -> Dict[str, Any]:
        """Async invoke the validator.

        Args:
            input: Input dictionary
            config: Optional configuration

        Returns:
            Validation result dictionary
        """
        value = input.get("value", "")
        metadata = input.get("metadata", {})
        result = await self.validator.async_validate(value, metadata=metadata)

        return {
            "value": value,
            "validated": result.is_pass,
            "result": result,
        }


