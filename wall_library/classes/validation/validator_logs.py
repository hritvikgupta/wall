"""Validator logs class."""

from dataclasses import dataclass, field
from typing import Dict, List, Any, Optional
from datetime import datetime


@dataclass
class ValidatorLogs:
    """Validator execution logs."""

    validator_id: str
    logs: List[Dict[str, Any]] = field(default_factory=list)
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None

    def add_log(self, level: str, message: str, metadata: Dict[str, Any] = None) -> None:
        """Add a log entry."""
        log_entry = {
            "timestamp": datetime.now().isoformat(),
            "level": level,
            "message": message,
            "metadata": metadata or {},
        }
        self.logs.append(log_entry)

    def __repr__(self) -> str:
        return f"ValidatorLogs(validator_id={self.validator_id}, logs={len(self.logs)})"

