"""Flask application setup."""

from typing import Optional
from pathlib import Path

try:
    from flask import Flask, request, jsonify
    FLASK_AVAILABLE = True
except ImportError:
    FLASK_AVAILABLE = False
    Flask = None  # type: ignore
    request = None  # type: ignore
    jsonify = None  # type: ignore

from wall_library.logger import logger
from wall_library.server.routes import register_routes


def create_app(config_path: Optional[str] = None) -> Flask:
    """Create Flask application.

    Args:
        config_path: Optional path to configuration file

    Returns:
        Flask application
    """
    if not FLASK_AVAILABLE:
        raise ImportError("Flask is required. Install with: pip install wall-library[server]")

    app = Flask(__name__)

    # Register routes
    register_routes(app)

    return app


