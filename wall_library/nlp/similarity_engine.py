"""Similarity engine for context filtering."""

from typing import Optional, List
import numpy as np

try:
    from sklearn.metrics.pairwise import cosine_similarity
    SKLEARN_AVAILABLE = True
except ImportError:
    SKLEARN_AVAILABLE = False
    cosine_similarity = None  # type: ignore

# Lazy import to avoid breaking if sentence-transformers has dependency issues
SENTENCE_TRANSFORMERS_AVAILABLE = False
SentenceTransformer = None  # type: ignore


def _check_numpy_version() -> bool:
    """Check if NumPy version is compatible with sentence-transformers.
    
    Returns:
        True if NumPy version is compatible (< 2.0), False otherwise
    """
    try:
        numpy_version = np.__version__
        # Parse version string (e.g., "1.26.4" or "2.2.6")
        major_version = int(numpy_version.split('.')[0])
        if major_version >= 2:
            return False
        return True
    except Exception:
        # If we can't check version, assume it's okay
        return True


def _try_import_sentence_transformers():
    """Try to import sentence_transformers, handling any errors gracefully.
    
    This function catches all exceptions including NumPy/TensorFlow compatibility
    issues that occur when NumPy 2.x is installed.
    """
    global SENTENCE_TRANSFORMERS_AVAILABLE, SentenceTransformer
    if SENTENCE_TRANSFORMERS_AVAILABLE:
        return True
    
    # Check NumPy version first
    if not _check_numpy_version():
        # NumPy 2.x detected - sentence-transformers won't work
        SENTENCE_TRANSFORMERS_AVAILABLE = False
        SentenceTransformer = None
        return False
    
    try:
        from sentence_transformers import SentenceTransformer as ST
        SentenceTransformer = ST
        SENTENCE_TRANSFORMERS_AVAILABLE = True
        return True
    except (ImportError, ModuleNotFoundError) as e:
        # Standard import errors
        SENTENCE_TRANSFORMERS_AVAILABLE = False
        SentenceTransformer = None
        return False
    except Exception as e:
        # Catch all other errors including NumPy/TensorFlow compatibility issues
        # This includes errors like:
        # - ImportError from NumPy 2.x incompatibility
        # - TensorFlow initialization errors
        # - Any other unexpected errors during import
        SENTENCE_TRANSFORMERS_AVAILABLE = False
        SentenceTransformer = None
        return False

from wall_library.logger import logger


class SimilarityEngine:
    """Similarity engine using cosine similarity and semantic similarity."""

    def __init__(
        self,
        model_name: Optional[str] = None,
        use_semantic: bool = True,
    ):
        """Initialize similarity engine.

        Args:
            model_name: Name of sentence transformer model
            use_semantic: Whether to use semantic similarity
        """
        self.model: Optional[SentenceTransformer] = None
        
        # Try to import sentence-transformers first, then check if we can use semantic similarity
        if use_semantic:
            if _try_import_sentence_transformers() and SentenceTransformer:
                try:
                    model_name = model_name or "all-MiniLM-L6-v2"
                    self.model = SentenceTransformer(model_name)
                    self.use_semantic = True
                except Exception as e:
                    logger.warning(f"Failed to load sentence transformer: {e}")
                    self.use_semantic = False
            else:
                self.use_semantic = False
        else:
            self.use_semantic = False

    def cosine_similarity(self, text1: str, text2: str) -> float:
        """Calculate cosine similarity between two texts.

        Args:
            text1: First text
            text2: Second text

        Returns:
            Similarity score between 0 and 1
        """
        if self.use_semantic and self.model:
            return self._semantic_similarity(text1, text2)
        else:
            return self._simple_cosine_similarity(text1, text2)

    def _semantic_similarity(self, text1: str, text2: str) -> float:
        """Calculate semantic similarity using sentence transformers."""
        if self.model is None:
            return 0.0

        embeddings = self.model.encode([text1, text2])
        if SKLEARN_AVAILABLE and cosine_similarity:
            similarity_matrix = cosine_similarity([embeddings[0]], [embeddings[1]])
            return float(similarity_matrix[0][0])
        else:
            # Fallback to manual cosine similarity
            vec1 = embeddings[0]
            vec2 = embeddings[1]
            dot_product = np.dot(vec1, vec2)
            norm1 = np.linalg.norm(vec1)
            norm2 = np.linalg.norm(vec2)
            if norm1 == 0 or norm2 == 0:
                return 0.0
            return float(dot_product / (norm1 * norm2))

    def _simple_cosine_similarity(self, text1: str, text2: str) -> float:
        """Calculate simple cosine similarity using word vectors.
        
        Uses Jaccard similarity (intersection over union) which is better
        for semantic matching than exact word overlap.
        Also includes partial word matching for better domain term matching.
        """
        # Extract words using regex to handle punctuation better
        import re
        words1 = set(re.findall(r'\b[a-zA-Z]+\b', text1.lower()))
        words2 = set(re.findall(r'\b[a-zA-Z]+\b', text2.lower()))
        
        # Remove very short words (1-2 chars) as they're usually not meaningful
        words1 = {w for w in words1 if len(w) > 2}
        words2 = {w for w in words2 if len(w) > 2}

        # Filter common stop words to prevent false positives
        # Expanded list for strict accuracy
        stop_words = {
            'the', 'and', 'for', 'was', 'are', 'with', 'that', 'this', 'from', 'which', 'who', 'what', 'where', 'when', 'why', 'how',
            'a', 'an', 'in', 'on', 'at', 'to', 'of', 'is', 'it', 'or', 'be', 'as', 'by'
        }
        words1 = words1 - stop_words
        words2 = words2 - stop_words
        
        if not words1 or not words2:
            return 0.0
        
        # Calculate Strict Jaccard similarity
        intersection = words1.intersection(words2)
        union = words1.union(words2)
        
        if not union:
            return 0.0
        
        similarity = len(intersection) / len(union)
        
        # DEBUG: Print matches to understand score
        if similarity > 0.0:
           print(f"DEBUG: Match found: {intersection} -> Score: {similarity:.2f}")

        return similarity

