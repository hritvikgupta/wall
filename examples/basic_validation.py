"""Basic validation example."""

from wall_library import WallGuard, OnFailAction


def main():
    """Basic validation example."""
    # Create a guard with validators
    guard = WallGuard()

    # Use guard to validate
    outcome = guard.validate("Some text to validate")
    print(f"Validation passed: {outcome.validation_passed}")
    print(f"Validated output: {outcome.validated_output}")


if __name__ == "__main__":
    main()

