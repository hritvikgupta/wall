"""Hub CLI commands."""

import typer

hub_app = typer.Typer(name="hub")

# Import commands (avoid circular imports)
try:
    from wall_library.cli.hub.install import install
    from wall_library.cli.hub.list_validators import list_validators
    
    hub_app.command(name="install")(install)
    hub_app.command(name="list")(list_validators)
except ImportError:
    pass

__all__ = ["hub_app"]
