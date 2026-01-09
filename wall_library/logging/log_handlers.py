"""Log handlers for different output destinations."""

import logging
from logging.handlers import RotatingFileHandler
from pathlib import Path
from typing import Optional


class ConsoleHandler(logging.StreamHandler):
    """Console handler for logging."""
    
    def __init__(self, level: int = logging.INFO):
        """Initialize console handler.
        
        Args:
            level: Log level
        """
        super().__init__()
        self.setLevel(level)


class FileHandler(RotatingFileHandler):
    """File handler with rotation support."""
    
    def __init__(
        self,
        log_file: str,
        level: int = logging.INFO,
        max_bytes: int = 10 * 1024 * 1024,  # 10MB
        backup_count: int = 5,
    ):
        """Initialize file handler with rotation.
        
        Args:
            log_file: Path to log file
            level: Log level
            max_bytes: Maximum file size before rotation
            backup_count: Number of backup files to keep
        """
        # Ensure directory exists
        log_path = Path(log_file)
        log_path.parent.mkdir(parents=True, exist_ok=True)
        
        super().__init__(
            filename=log_file,
            maxBytes=max_bytes,
            backupCount=backup_count,
        )
        self.setLevel(level)


def create_console_handler(level: int = logging.INFO) -> ConsoleHandler:
    """Create a console handler.
    
    Args:
        level: Log level
        
    Returns:
        Console handler
    """
    return ConsoleHandler(level=level)


def create_file_handler(
    log_file: str,
    level: int = logging.INFO,
    max_bytes: int = 10 * 1024 * 1024,
    backup_count: int = 5,
) -> Optional[FileHandler]:
    """Create a file handler with rotation.
    
    Args:
        log_file: Path to log file
        level: Log level
        max_bytes: Maximum file size before rotation
        backup_count: Number of backup files to keep
        
    Returns:
        File handler or None if file cannot be created
    """
    try:
        return FileHandler(
            log_file=log_file,
            level=level,
            max_bytes=max_bytes,
            backup_count=backup_count,
        )
    except Exception:
        return None


