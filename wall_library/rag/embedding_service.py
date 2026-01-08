"""Embedding service for generating embeddings."""

from typing import List, Optional, Union
import numpy as np

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

try:
    from openai import OpenAI
    OPENAI_AVAILABLE = True
except ImportError:
    OPENAI_AVAILABLE = False
    OpenAI = None  # type: ignore

from wall_library.logger import logger


class EmbeddingService:
    """Service for generating embeddings."""

    def __init__(
        self,
        model_name: Optional[str] = None,
        provider: str = "sentence-transformers",
    ):
        """Initialize embedding service.

        Args:
            model_name: Name of embedding model
            provider: Provider to use (sentence-transformers, openai)
        """
        self.provider = provider
        self.model = None
        self.openai_client = None

        if provider == "sentence-transformers":
            if _try_import_sentence_transformers() and SentenceTransformer:
                model_name = model_name or "all-MiniLM-L6-v2"
                try:
                    self.model = SentenceTransformer(model_name)
                except Exception as e:
                    logger.warning(f"Failed to load sentence transformer: {e}")
                    self.model = None
            else:
                self.model = None
        elif provider == "openai" and OPENAI_AVAILABLE:
            import os
            api_key = os.getenv("OPENAI_API_KEY")
            if api_key:
                self.openai_client = OpenAI(api_key=api_key)
            else:
                self.openai_client = OpenAI()  # Will use default from environment

    def generate_embeddings(self, texts: Union[str, List[str]]) -> np.ndarray:
        """Generate embeddings for texts.

        Args:
            texts: Text or list of texts

        Returns:
            Embeddings array
        """
        if isinstance(texts, str):
            texts = [texts]

        if self.provider == "sentence-transformers" and self.model:
            return self.model.encode(texts)
        elif self.provider == "openai" and self.openai_client:
            embeddings = []
            for text in texts:
                response = self.openai_client.embeddings.create(
                    input=text,
                    model="text-embedding-ada-002"
                )
                embeddings.append(response.data[0].embedding)
            return np.array(embeddings)
        else:
            raise ValueError(f"Embedding provider not available: {self.provider}")

