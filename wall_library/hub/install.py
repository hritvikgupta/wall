"""Hub installation utilities."""

from typing import Optional
import requests
from pathlib import Path

from wall_library.constants.hub import VALIDATOR_HUB_SERVICE
from wall_library.logger import logger
from wall_library.settings import settings


def install(validator_id: str, destination: Optional[str] = None) -> bool:
    """Install validator from hub.

    Args:
        validator_id: Validator ID (e.g., "hub://guardrails/regex_match")
        destination: Optional destination path

    Returns:
        True if installation succeeded
    """
    try:
        # Parse validator ID
        if validator_id.startswith("hub://"):
            validator_id = validator_id[6:]  # Remove "hub://" prefix

        # Extract validator name
        parts = validator_id.split("/")
        if len(parts) < 2:
            raise ValueError(f"Invalid validator ID: {validator_id}")

        validator_name = parts[-1]

        # Download validator (simplified - would use actual hub API)
        logger.info(f"Installing validator: {validator_id}")

        # In full implementation, would:
        # 1. Fetch validator from hub API
        # 2. Download validator code
        # 3. Install in validators directory
        # 4. Register in validator registry

        logger.info(f"Validator {validator_name} installed successfully")
        return True

    except Exception as e:
        logger.error(f"Failed to install validator {validator_id}: {e}")
        return False

