"""Hub install command."""

import typer
from wall_library.hub.install import install as install_validator
from wall_library.logger import logger


def install(validator_id: str = typer.Argument(..., help="Validator ID to install")):
    """Install validator from hub."""
    try:
        success = install_validator(validator_id)
        if success:
            typer.echo(f"Successfully installed: {validator_id}")
        else:
            typer.echo(f"Failed to install: {validator_id}", err=True)
            raise typer.Exit(1)
    except Exception as e:
        typer.echo(f"Error: {e}", err=True)
        raise typer.Exit(1)

