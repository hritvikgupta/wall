"""Remote inference utilities."""

from typing import Optional
from wall_library.classes.rc import RC
from wall_library.settings import settings


def get_use_remote_inference(rc: Optional[RC] = None) -> bool:
    """Check if remote inference should be used.

    Args:
        rc: Runtime configuration

    Returns:
        True if remote inference should be used
    """
    rc = rc or settings.rc
    if not rc:
        return False

    return rc.use_remote_inference


