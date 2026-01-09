"""Runtime configuration class."""

from dataclasses import dataclass, field
from typing import Optional


@dataclass
class RC:
    """Runtime configuration for wall_library."""

    api_key: Optional[str] = None
    enable_metrics: bool = True
    hub_url: Optional[str] = None
    use_remote_inference: bool = False

    def __post_init__(self):
        """Validate configuration."""
        if not self.hub_url:
            self.hub_url = "https://hub.guardrailsai.com"


