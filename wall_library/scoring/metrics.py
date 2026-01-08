"""Scoring metrics implementations."""

from abc import ABC, abstractmethod
from typing import List, Callable, Optional

try:
    from rouge_score import rouge_scorer
    ROUGE_AVAILABLE = True
except ImportError:
    ROUGE_AVAILABLE = False
    rouge_scorer = None  # type: ignore

try:
    from nltk.translate.bleu_score import sentence_bleu, SmoothingFunction
    BLEU_AVAILABLE = True
except ImportError:
    BLEU_AVAILABLE = False
    sentence_bleu = None  # type: ignore
    SmoothingFunction = None  # type: ignore

from wall_library.nlp.similarity_engine import SimilarityEngine


class BaseMetric(ABC):
    """Base class for scoring metrics."""

    @abstractmethod
    def compute(self, response: str, expected: str) -> float:
        """Compute metric score.

        Args:
            response: LLM response
            expected: Expected output

        Returns:
            Score between 0 and 1
        """
        pass


class CosineSimilarityMetric(BaseMetric):
    """Cosine similarity metric."""

    def __init__(self):
        """Initialize cosine similarity metric."""
        self.similarity_engine = SimilarityEngine(use_semantic=False)

    def compute(self, response: str, expected: str) -> float:
        """Compute cosine similarity score."""
        return self.similarity_engine.cosine_similarity(response, expected)


class SemanticSimilarityMetric(BaseMetric):
    """Semantic similarity metric using sentence transformers."""

    def __init__(self):
        """Initialize semantic similarity metric."""
        self.similarity_engine = SimilarityEngine(use_semantic=True)

    def compute(self, response: str, expected: str) -> float:
        """Compute semantic similarity score."""
        return self.similarity_engine.cosine_similarity(response, expected)


class ROUGEMetric(BaseMetric):
    """ROUGE metric for summarization evaluation."""

    def __init__(self, rouge_types: Optional[List[str]] = None):
        """Initialize ROUGE metric."""
        if not ROUGE_AVAILABLE:
            raise ImportError("ROUGE is required. Install with: pip install rouge-score")

        rouge_types = rouge_types or ["rouge1", "rouge2", "rougeL"]
        self.rouge_types = rouge_types
        self.scorer = rouge_scorer.RougeScorer(rouge_types, use_stemmer=True)

    def compute(self, response: str, expected: str) -> float:
        """Compute ROUGE score."""
        scores = self.scorer.score(expected, response)
        # Average across rouge types
        avg_score = sum(scores[rouge_type].fmeasure for rouge_type in self.rouge_types) / len(
            self.rouge_types
        )
        return avg_score


class BLEUMetric(BaseMetric):
    """BLEU metric for translation evaluation."""

    def __init__(self):
        """Initialize BLEU metric."""
        if not BLEU_AVAILABLE:
            raise ImportError("NLTK is required. Install with: pip install nltk")

        self.smoothing = SmoothingFunction().method1

    def compute(self, response: str, expected: str) -> float:
        """Compute BLEU score."""
        reference = [expected.split()]
        candidate = response.split()
        score = sentence_bleu(reference, candidate, smoothing_function=self.smoothing)
        return min(score, 1.0)  # Normalize to [0, 1]


class CustomMetric(BaseMetric):
    """Custom metric using user-defined function."""

    def __init__(self, metric_func: Callable[[str, str], float]):
        """Initialize custom metric.

        Args:
            metric_func: Function that takes (response, expected) and returns score
        """
        self.metric_func = metric_func

    def compute(self, response: str, expected: str) -> float:
        """Compute custom metric score."""
        score = self.metric_func(response, expected)
        # Normalize to [0, 1]
        return min(max(score, 0.0), 1.0)

