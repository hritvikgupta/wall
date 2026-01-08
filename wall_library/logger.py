"""Logger configuration for wall_library."""

import logging
from typing import Optional

# Create logger
logger = logging.getLogger("wall_library")
logger.setLevel(logging.INFO)

# Create console handler if not exists
if not logger.handlers:
    handler = logging.StreamHandler()
    handler.setLevel(logging.INFO)
    formatter = logging.Formatter(
        "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    )
    handler.setFormatter(formatter)
    logger.addHandler(handler)


def set_scope(scope: str) -> None:
    """Set logging scope."""
    logger.name = f"wall_library.{scope}"


def configure_logging(level: int = logging.INFO) -> None:
    """Configure logging level."""
    logger.setLevel(level)
    for handler in logger.handlers:
        handler.setLevel(level)

