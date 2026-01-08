"""Hub token management."""

from typing import Optional
import jwt

from wall_library.constants.hub import VALIDATOR_HUB_SERVICE
from wall_library.settings import settings
from wall_library.classes.rc import RC
from wall_library.logger import logger


def get_jwt_token(rc: Optional[RC] = None) -> Optional[str]:
    """Get JWT token for hub authentication.

    Args:
        rc: Runtime configuration

    Returns:
        JWT token or None
    """
    rc = rc or settings.rc
    if not rc or not rc.api_key:
        return None

    try:
        # In full implementation, would generate or retrieve JWT token
        # from hub service using API key
        return rc.api_key  # Simplified
    except Exception as e:
        logger.warning(f"Failed to get JWT token: {e}")
        return None

