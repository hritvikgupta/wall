"""Server CLI commands."""

import typer
from wall_library.cli.server.start import start

server_app = typer.Typer(name="server")
server_app.command(name="start")(start)

