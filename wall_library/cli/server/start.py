"""Server start command."""

import typer
from typing import Optional
from pathlib import Path

try:
    from flask import Flask
    FLASK_AVAILABLE = True
except ImportError:
    FLASK_AVAILABLE = False
    Flask = None  # type: ignore

from wall_library.logger import logger
from wall_library.server.app import create_app


def start(
    host: str = typer.Option("127.0.0.1", "--host", help="Host to bind"),
    port: int = typer.Option(8000, "--port", help="Port to bind"),
    config: Optional[str] = typer.Option(None, "--config", help="Config file path"),
    debug: bool = typer.Option(False, "--debug", help="Enable debug mode"),
):
    """Start Flask server."""
    if not FLASK_AVAILABLE:
        typer.echo("Flask is required. Install with: pip install wall-library[server]", err=True)
        raise typer.Exit(1)

    app = create_app(config_path=config)
    typer.echo(f"Starting server on {host}:{port}")
    app.run(host=host, port=port, debug=debug)

