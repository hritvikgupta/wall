"""FAISS vector database implementation."""

from typing import List, Dict, Any, Optional

try:
    import faiss
    import numpy as np
    FAISS_AVAILABLE = True
except ImportError:
    FAISS_AVAILABLE = False
    faiss = None  # type: ignore
    np = None  # type: ignore

from wall_library.vectordb.base import VectorDBBase
from wall_library.logger import logger


class FAISSVectorDB(VectorDBBase):
    """FAISS vector database implementation."""

    def __init__(self, dimension: int = 384):
        """Initialize FAISS database.

        Args:
            dimension: Vector dimension
        """
        if not FAISS_AVAILABLE:
            raise ImportError("FAISS is required. Install with: pip install wall-library[vectordb]")

        self.dimension = dimension
        self.index = faiss.IndexFlatL2(dimension)
        self.texts: List[str] = []
        self.metadata: List[Dict[str, Any]] = []

    def add(self, vectors: List[List[float]], texts: List[str], metadata: Optional[List[Dict[str, Any]]] = None):
        """Add vectors to FAISS index.

        Args:
            vectors: List of vectors
            texts: List of texts
            metadata: Optional metadata
        """
        if len(vectors) != len(texts):
            raise ValueError("Vectors and texts must have the same length")

        vectors_array = np.array(vectors, dtype=np.float32)
        self.index.add(vectors_array)
        self.texts.extend(texts)
        self.metadata.extend(metadata or [{}] * len(texts))

    def query(self, vector: List[float], top_k: int = 5) -> List[Dict[str, Any]]:
        """Query FAISS index for similar vectors.

        Args:
            vector: Query vector
            top_k: Number of results

        Returns:
            List of results with scores
        """
        vector_array = np.array([vector], dtype=np.float32)
        distances, indices = self.index.search(vector_array, top_k)

        results = []
        for i, idx in enumerate(indices[0]):
            if idx < len(self.texts):
                results.append({
                    "text": self.texts[idx],
                    "metadata": self.metadata[idx] if idx < len(self.metadata) else {},
                    "distance": float(distances[0][i]),
                })

        return results


