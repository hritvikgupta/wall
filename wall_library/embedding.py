"""Embedding utilities."""

from typing import List, Union
import numpy as np

try:
    from sentence_transformers import SentenceTransformer
    SENTENCE_TRANSFORMERS_AVAILABLE = True
except ImportError:
    SENTENCE_TRANSFORMERS_AVAILABLE = False
    SentenceTransformer = None  # type: ignore

from wall_library.logger import logger


def generate_embeddings(
    texts: Union[str, List[str]],
    model_name: str = "all-MiniLM-L6-v2",
) -> np.ndarray:
    """Generate embeddings for texts.

    Args:
        texts: Text or list of texts
        model_name: Name of embedding model

    Returns:
        Embeddings array
    """
    if not SENTENCE_TRANSFORMERS_AVAILABLE:
        raise ImportError("sentence-transformers is required for embeddings")

    if isinstance(texts, str):
        texts = [texts]

    try:
        model = SentenceTransformer(model_name)
        embeddings = model.encode(texts)
        return embeddings
    except Exception as e:
        logger.error(f"Failed to generate embeddings: {e}")
        raise


