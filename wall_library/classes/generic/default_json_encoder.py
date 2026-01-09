"""Default JSON encoder."""

import json
from typing import Any
from datetime import datetime


class DefaultJSONEncoder(json.JSONEncoder):
    """Default JSON encoder with extended support."""

    def default(self, obj: Any) -> Any:
        """Encode object to JSON-serializable format."""
        if isinstance(obj, datetime):
            return obj.isoformat()
        elif hasattr(obj, "__dict__"):
            return obj.__dict__
        elif hasattr(obj, "to_dict"):
            return obj.to_dict()
        else:
            return super().default(obj)


