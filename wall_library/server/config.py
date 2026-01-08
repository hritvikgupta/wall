"""Server configuration."""

from dataclasses import dataclass
from typing import Optional


@dataclass
class ServerConfig:
    """Server configuration."""

    host: str = "127.0.0.1"
    port: int = 8000
    debug: bool = False
    workers: int = 4
    timeout: int = 120

