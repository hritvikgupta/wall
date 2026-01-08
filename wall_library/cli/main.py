"""Main CLI entry point."""

import typer
from typing import Optional

from wall_library.cli.configure import configure
from wall_library.cli.hub import hub_app
from wall_library.cli.create import create
from wall_library.cli.server import server_app

app = typer.Typer(name="wall", help="Wall Library CLI")

app.command(name="configure")(configure)
app.add_typer(hub_app, name="hub")
app.command(name="create")(create)
if server_app:
    app.add_typer(server_app, name="server")


def cli():
    """CLI entry point."""
    app()


if __name__ == "__main__":
    cli()

