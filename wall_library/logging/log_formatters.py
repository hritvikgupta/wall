"""Log formatters for different output formats."""

import json
from datetime import datetime
from typing import Any, Dict, Optional


class JSONFormatter:
    """JSON formatter for structured logging."""
    
    @staticmethod
    def format(
        level: str,
        scope: str,
        message: str,
        metadata: Optional[Dict[str, Any]] = None,
    ) -> str:
        """Format log entry as JSON.
        
        Args:
            level: Log level (DEBUG, INFO, WARNING, ERROR)
            scope: Logging scope
            message: Log message
            metadata: Optional metadata
            
        Returns:
            JSON formatted log entry
        """
        log_entry = {
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "level": level.upper(),
            "scope": scope,
            "message": message,
            "metadata": metadata or {},
        }
        return json.dumps(log_entry, default=str)


class HumanFormatter:
    """Human-readable formatter for console output."""
    
    @staticmethod
    def format(
        level: str,
        scope: str,
        message: str,
        metadata: Optional[Dict[str, Any]] = None,
    ) -> str:
        """Format log entry as human-readable text.
        
        Args:
            level: Log level (DEBUG, INFO, WARNING, ERROR)
            scope: Logging scope
            message: Log message
            metadata: Optional metadata
            
        Returns:
            Human-readable formatted log entry
        """
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        level_str = level.upper().ljust(8)
        scope_str = f"[{scope}]" if scope else ""
        
        lines = [f"{timestamp} - {level_str} - {scope_str} {message}"]
        
        if metadata:
            for key, value in metadata.items():
                if isinstance(value, (dict, list)):
                    value_str = json.dumps(value, indent=2, default=str)
                    lines.append(f"  {key}:")
                    for line in value_str.split("\n"):
                        lines.append(f"    {line}")
                else:
                    lines.append(f"  {key}: {value}")
        
        return "\n".join(lines)

