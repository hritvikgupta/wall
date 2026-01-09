"""Stack data structure."""

from typing import Generic, TypeVar, List, Optional

T = TypeVar("T")


class Stack(Generic[T]):
    """Stack data structure."""

    def __init__(self):
        """Initialize stack."""
        self._items: List[T] = []

    def push(self, item: T) -> None:
        """Push item onto stack."""
        self._items.append(item)

    def pop(self) -> Optional[T]:
        """Pop item from stack."""
        if self.is_empty():
            return None
        return self._items.pop()

    def peek(self) -> Optional[T]:
        """Peek at top item without removing."""
        if self.is_empty():
            return None
        return self._items[-1]

    def is_empty(self) -> bool:
        """Check if stack is empty."""
        return len(self._items) == 0

    def size(self) -> int:
        """Get stack size."""
        return len(self._items)

    def __repr__(self) -> str:
        return f"Stack({self._items})"


