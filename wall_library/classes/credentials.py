"""Credentials management."""

from dataclasses import dataclass
from typing import Optional


@dataclass
class Credentials:
    """Credential management class."""

    api_key: Optional[str] = None
    hub_token: Optional[str] = None

    def __repr__(self) -> str:
        return f"Credentials(api_key={'***' if self.api_key else None})"

