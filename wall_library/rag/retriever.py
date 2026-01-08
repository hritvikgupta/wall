"""RAG retriever for question-answer pair retrieval."""

from typing import List, Dict, Any, Optional
from wall_library.rag.chromadb_client import ChromaDBClient
from wall_library.rag.embedding_service import EmbeddingService
from wall_library.rag.qa_scorer import QAScorer


class RAGRetriever:
    """RAG retriever for question-answer pair retrieval."""

    def __init__(
        self,
        chromadb_client: Optional[ChromaDBClient] = None,
        embedding_service: Optional[EmbeddingService] = None,
        top_k: int = 5,
        logger: Optional[Any] = None,
    ):
        """Initialize RAG retriever.

        Args:
            chromadb_client: ChromaDB client instance
            embedding_service: Embedding service instance
            top_k: Number of results to retrieve
            logger: Optional WallLogger instance for logging
        """
        self.chromadb_client = chromadb_client or ChromaDBClient()
        self.embedding_service = embedding_service or EmbeddingService()
        self.top_k = top_k
        self.qa_scorer = QAScorer()
        self.logger = logger

    def retrieve(
        self, query: str, top_k: Optional[int] = None
    ) -> List[Dict[str, Any]]:
        """Retrieve relevant question-answer pairs.

        Args:
            query: Query string
            top_k: Number of results to return

        Returns:
            List of retrieved QA pairs with scores
        """
        top_k = top_k or self.top_k

        # Query ChromaDB
        results = self.chromadb_client.query(query, n_results=top_k * 2)

        # Score and rank results
        retrieved = []
        documents = results.get("documents", [[]])[0]
        metadatas = results.get("metadatas", [[]])[0]
        distances = results.get("distances", [[]])[0]

        for doc, metadata, distance in zip(documents, metadatas, distances):
            score = self.qa_scorer.score_relevance(query, doc, distance)
            retrieved.append({
                "document": doc,
                "metadata": metadata,
                "score": score,
                "distance": distance,
            })

        # Sort by score and return top_k
        retrieved.sort(key=lambda x: x["score"], reverse=True)
        final_results = retrieved[:top_k]
        
        # Log RAG retrieval if logger is set
        if self.logger:
            self.logger.log_rag_retrieval(
                query=query,
                retrieved_docs=final_results,
                metadata={"top_k": top_k},
            )
        
        return final_results
    
    def set_logger(self, logger: Any):
        """Set logger for this retriever.
        
        Args:
            logger: WallLogger instance
        """
        self.logger = logger
        return self

    def hybrid_search(
        self, query: str, top_k: Optional[int] = None
    ) -> List[Dict[str, Any]]:
        """Hybrid search combining semantic and keyword search.

        Args:
            query: Query string
            top_k: Number of results to return

        Returns:
            List of retrieved QA pairs
        """
        # Semantic search
        semantic_results = self.retrieve(query, top_k=top_k)

        # Keyword search (simplified)
        keyword_results = self._keyword_search(query, top_k=top_k)

        # Combine and re-rank
        combined = self._combine_results(semantic_results, keyword_results)
        return combined[:top_k or self.top_k]

    def _keyword_search(self, query: str, top_k: int) -> List[Dict[str, Any]]:
        """Keyword-based search (simplified)."""
        # Implementation would search by keywords
        return []

    def _combine_results(
        self, semantic: List[Dict[str, Any]], keyword: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """Combine and re-rank results."""
        # Simple combination - would use more sophisticated re-ranking
        combined = {r["document"]: r for r in semantic}
        for r in keyword:
            doc = r["document"]
            if doc not in combined:
                combined[doc] = r
            else:
                # Merge scores
                combined[doc]["score"] = (combined[doc]["score"] + r["score"]) / 2

        return sorted(combined.values(), key=lambda x: x["score"], reverse=True)

