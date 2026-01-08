"""Configure command."""

import typer
import json
from pathlib import Path
from typing import Optional

from wall_library.logger import logger

app = typer.Typer()


@app.command()
def configure(
    api_key: Optional[str] = typer.Option(None, "--api-key", help="API key"),
    hub_url: Optional[str] = typer.Option(None, "--hub-url", help="Hub URL"),
):
    """Configure wall_library settings."""
    rc_path = Path.home() / ".wallrc"

    # Load existing config or create new
    config = {}
    if rc_path.exists():
        try:
            with open(rc_path, "r") as f:
                config = json.load(f)
        except Exception as e:
            logger.warning(f"Failed to load config: {e}")

    # Update config
    if api_key:
        config["api_key"] = api_key
    if hub_url:
        config["hub_url"] = hub_url

    # Save config
    try:
        with open(rc_path, "w") as f:
            json.dump(config, f, indent=2)
        logger.info(f"Configuration saved to {rc_path}")
    except Exception as e:
        logger.error(f"Failed to save config: {e}")
        raise typer.Exit(1)

