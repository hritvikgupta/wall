"""ChromaDB client wrapper."""

from typing import List, Dict, Any, Optional
from wall_library.logger import logger

try:
    import chromadb
    from chromadb.config import Settings
    CHROMADB_AVAILABLE = True
except ImportError:
    CHROMADB_AVAILABLE = False
    chromadb = None  # type: ignore


class ChromaDBClient:
    """ChromaDB client wrapper for vector storage and retrieval."""

    def __init__(
        self,
        collection_name: str = "wall_library",
        persist_directory: Optional[str] = None,
    ):
        """Initialize ChromaDB client.

        Args:
            collection_name: Name of the collection
            persist_directory: Directory to persist database
        """
        if not CHROMADB_AVAILABLE:
            raise ImportError(
                "ChromaDB is required. Install with: pip install wall-library[rag]"
            )

        self.collection_name = collection_name
        self.persist_directory = persist_directory
        self.client = None
        self.collection = None

        self._initialize_client()

    def _initialize_client(self):
        """Initialize ChromaDB client and collection."""
        if self.persist_directory:
            self.client = chromadb.PersistentClient(path=self.persist_directory)
        else:
            self.client = chromadb.Client()

        try:
            self.collection = self.client.get_collection(name=self.collection_name)
        except Exception:
            self.collection = self.client.create_collection(name=self.collection_name)

    def add_qa_pairs(
        self,
        questions: List[str],
        answers: List[str],
        metadata: Optional[List[Dict[str, Any]]] = None,
    ):
        """Add question-answer pairs to the collection.

        Args:
            questions: List of questions
            answers: List of answers
            metadata: Optional metadata for each pair
        """
        if len(questions) != len(answers):
            raise ValueError("Questions and answers must have the same length")

        if metadata is None:
            # Provide default metadata to avoid ChromaDB error
            metadata = [{"type": "qa_pair", "index": i} for i in range(len(questions))]

        # Combine question and answer for embedding
        texts = [f"{q} {a}" for q, a in zip(questions, answers)]

        ids = [f"qa_{i}" for i in range(len(texts))]
        self.collection.add(
            documents=texts,
            ids=ids,
            metadatas=metadata,
        )

    def query(
        self, query_text: str, n_results: int = 5
    ) -> Dict[str, Any]:
        """Query the collection.

        Args:
            query_text: Query text
            n_results: Number of results to return

        Returns:
            Query results
        """
        results = self.collection.query(
            query_texts=[query_text],
            n_results=n_results,
        )

        return results

