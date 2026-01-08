"""Hub list command."""

import typer
try:
    from wall_library.validator_base import _VALIDATOR_REGISTRY
except ImportError:
    _VALIDATOR_REGISTRY = {}  # type: ignore
from wall_library.logger import logger


def list_validators():
    """List installed validators."""
    if not _VALIDATOR_REGISTRY:
        typer.echo("No validators installed.")
        return

    typer.echo("Installed validators:")
    for validator_id in sorted(_VALIDATOR_REGISTRY.keys()):
        typer.echo(f"  - {validator_id}")

