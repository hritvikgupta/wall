"""Settings management for wall_library."""

import os
import json
from pathlib import Path
from typing import Optional
from dataclasses import dataclass, field

from wall_library.classes.rc import RC


@dataclass
class Settings:
    """Global settings for wall_library."""

    rc: Optional[RC] = None
    enable_metrics: bool = True

    def __post_init__(self):
        """Load configuration after initialization."""
        self._load_rc()

    def _load_rc(self) -> None:
        """Load .wallrc configuration file."""
        rc_path = Path.home() / ".wallrc"
        if rc_path.exists():
            try:
                with open(rc_path, "r") as f:
                    rc_data = json.load(f)
                    self.rc = RC(**rc_data)
            except Exception:
                self.rc = None


# Global settings instance
settings = Settings()

# Load from environment variables
settings.enable_metrics = os.getenv("WALL_ENABLE_METRICS", "true").lower() == "true"

