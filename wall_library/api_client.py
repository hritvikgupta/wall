"""API client for remote guard execution."""

from typing import Any, Dict, Optional
import requests

from wall_library.classes.validation_outcome import ValidationOutcome
from wall_library.logger import logger


class GuardrailsApiClient:
    """API client for remote guard execution."""

    def __init__(self, base_url: str = "http://localhost:8000"):
        """Initialize API client.

        Args:
            base_url: Base URL for API server
        """
        self.base_url = base_url

    def validate(self, guard_name: str, text: str) -> ValidationOutcome:
        """Validate text using remote guard.

        Args:
            guard_name: Name of the guard
            text: Text to validate

        Returns:
            ValidationOutcome
        """
        url = f"{self.base_url}/guards/{guard_name}/validate"
        payload = {"text": text}

        try:
            response = requests.post(url, json=payload)
            response.raise_for_status()
            data = response.json()

            return ValidationOutcome(
                validated_output=data.get("validated_output"),
                raw_output=data.get("raw_output"),
                validation_passed=data.get("validation_passed", False),
                metadata=data.get("metadata", {}),
            )
        except Exception as e:
            logger.error(f"API call failed: {e}")
            raise


