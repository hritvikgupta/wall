"""QA scorer for scoring retrieved question-answer pairs."""

from typing import Dict, Any
from wall_library.nlp.similarity_engine import SimilarityEngine


class QAScorer:
    """Scorer for question-answer pairs."""

    def __init__(self):
        """Initialize QA scorer."""
        self.similarity_engine = SimilarityEngine()

    def score_relevance(
        self, query: str, document: str, distance: float = 0.0
    ) -> float:
        """Score relevance of document to query.

        Args:
            query: Query string
            document: Document string
            distance: Vector distance (lower is better)

        Returns:
            Relevance score between 0 and 1
        """
        # Convert distance to similarity (assuming cosine distance)
        similarity_from_distance = 1.0 - min(distance, 1.0)

        # Semantic similarity
        semantic_similarity = self.similarity_engine.cosine_similarity(query, document)

        # Combine scores (weighted average)
        final_score = 0.6 * similarity_from_distance + 0.4 * semantic_similarity

        return min(max(final_score, 0.0), 1.0)

    def score_contextual_alignment(
        self, query: str, answer: str, context: str
    ) -> float:
        """Score contextual alignment of answer given query and context.

        Args:
            query: Query string
            answer: Answer string
            context: Context string

        Returns:
            Alignment score between 0 and 1
        """
        # Check if answer is relevant to query
        query_answer_sim = self.similarity_engine.cosine_similarity(query, answer)

        # Check if answer is grounded in context
        answer_context_sim = self.similarity_engine.cosine_similarity(answer, context)

        # Combined score
        return (query_answer_sim + answer_context_sim) / 2.0


