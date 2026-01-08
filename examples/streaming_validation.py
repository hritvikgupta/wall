"""Streaming validation example."""

from wall_library import WallGuard
from wall_library.run import StreamRunner


def main():
    """Streaming validation example."""
    guard = WallGuard()
    runner = StreamRunner()

    # In real usage, you would stream from an LLM API
    # for chunk in runner.stream(prompt="Tell me a story"):
    #     validated = guard.validate(chunk)
    #     print(f"Chunk validated: {validated.validation_passed}")

    print("Streaming validation setup complete")


if __name__ == "__main__":
    main()

