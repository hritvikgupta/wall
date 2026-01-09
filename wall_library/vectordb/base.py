"""Base vector database class."""

from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional


class VectorDBBase(ABC):
    """Base class for vector databases."""

    @abstractmethod
    def add(self, vectors: List[List[float]], texts: List[str], metadata: Optional[List[Dict[str, Any]]] = None):
        """Add vectors to database.

        Args:
            vectors: List of vectors
            texts: List of texts
            metadata: Optional metadata
        """
        pass

    @abstractmethod
    def query(self, vector: List[float], top_k: int = 5) -> List[Dict[str, Any]]:
        """Query database for similar vectors.

        Args:
            vector: Query vector
            top_k: Number of results

        Returns:
            List of results with scores
        """
        pass


