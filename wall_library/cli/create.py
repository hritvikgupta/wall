"""Create command."""

import typer
from typing import Optional
from pathlib import Path

from wall_library.logger import logger


def create(
    guard_name: str = typer.Argument(..., help="Guard name"),
    validators: Optional[str] = typer.Option(None, "--validators", help="Validators to use"),
    output: Optional[str] = typer.Option(None, "--output", help="Output file path"),
):
    """Create guard configuration."""
    config = {
        "guard_name": guard_name,
        "validators": validators.split(",") if validators else [],
    }

    output_path = Path(output or f"{guard_name}.json")
    import json

    try:
        with open(output_path, "w") as f:
            json.dump(config, f, indent=2)
        typer.echo(f"Guard configuration created: {output_path}")
    except Exception as e:
        logger.error(f"Failed to create config: {e}")
        raise typer.Exit(1)

