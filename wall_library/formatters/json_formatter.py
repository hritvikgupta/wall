"""JSON formatter."""

import json
from typing import Any

from wall_library.formatters.base_formatter import BaseFormatter


class JSONFormatter(BaseFormatter):
    """JSON output formatter."""

    def format(self, data: Any) -> str:
        """Format data to JSON string.

        Args:
            data: Data to format

        Returns:
            JSON string
        """
        return json.dumps(data, indent=2)

    def parse(self, text: str) -> Any:
        """Parse JSON string to data.

        Args:
            text: JSON string

        Returns:
            Parsed data
        """
        return json.loads(text)

