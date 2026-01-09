"""Context filtering example."""

from wall_library import WallGuard
from wall_library.nlp import ContextManager


def main():
    """Context filtering example."""
    # Create context manager
    context_manager = ContextManager()
    context_manager.add_keywords(["Python", "programming", "coding"])
    
    # Check if text is within context
    text = "Python is a programming language"
    is_valid = context_manager.check_context(text)
    print(f"Text is within context: {is_valid}")


if __name__ == "__main__":
    main()


