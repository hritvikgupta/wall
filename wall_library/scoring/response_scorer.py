"""Response scorer for LLM responses."""

from typing import Dict, Any, List, Optional, Callable
from dataclasses import dataclass, field

from wall_library.scoring.metrics import (
    CosineSimilarityMetric,
    SemanticSimilarityMetric,
    ROUGEMetric,
    BLEUMetric,
    CustomMetric,
)


@dataclass
class ResponseScorer:
    """Scorer for LLM responses with multiple metrics."""

    metrics: List[Any] = field(default_factory=list)
    weights: Dict[str, float] = field(default_factory=dict)
    threshold: float = 0.7
    logger: Optional[Any] = field(default=None)

    def __post_init__(self):
        """Initialize default metrics if none provided."""
        if not self.metrics:
            self.metrics = [
                CosineSimilarityMetric(),
                SemanticSimilarityMetric(),
            ]

    def score(
        self,
        response: str,
        expected: str,
        metric_names: Optional[List[str]] = None,
    ) -> Dict[str, float]:
        """Score response against expected output.

        Args:
            response: LLM response
            expected: Expected output
            metric_names: Optional list of metric names to use

        Returns:
            Dictionary of metric scores
        """
        scores = {}

        for metric in self.metrics:
            metric_name = metric.__class__.__name__
            if metric_names is None or metric_name in metric_names:
                try:
                    score = metric.compute(response, expected)
                    scores[metric_name] = score
                except Exception as e:
                    scores[metric_name] = 0.0
        
        # Log scoring if logger is set
        if self.logger and scores:
            self.logger.log_scoring(
                response=response,
                scores=scores,
                metadata={"num_metrics": len(scores)},
            )

        return scores
    
    def set_logger(self, logger: Any):
        """Set logger for this scorer.
        
        Args:
            logger: WallLogger instance
        """
        self.logger = logger
        return self

    def aggregate_score(
        self,
        scores: Dict[str, float],
        aggregation: str = "weighted_average",
    ) -> float:
        """Aggregate multiple metric scores.

        Args:
            scores: Dictionary of metric scores
            aggregation: Aggregation method (weighted_average, average, min, max)

        Returns:
            Aggregated score
        """
        if not scores:
            return 0.0

        if aggregation == "weighted_average":
            total_weight = 0.0
            weighted_sum = 0.0

            for metric_name, score in scores.items():
                weight = self.weights.get(metric_name, 1.0)
                weighted_sum += score * weight
                total_weight += weight

            return weighted_sum / total_weight if total_weight > 0 else 0.0

        elif aggregation == "average":
            return sum(scores.values()) / len(scores)

        elif aggregation == "min":
            return min(scores.values())

        elif aggregation == "max":
            return max(scores.values())

        else:
            raise ValueError(f"Unknown aggregation method: {aggregation}")

    def evaluate(
        self,
        response: str,
        expected: str,
        threshold: Optional[float] = None,
    ) -> Dict[str, Any]:
        """Evaluate response with threshold.

        Args:
            response: LLM response
            expected: Expected output
            threshold: Threshold for evaluation (uses instance threshold if None)

        Returns:
            Evaluation results
        """
        threshold = threshold or self.threshold
        scores = self.score(response, expected)
        aggregated = self.aggregate_score(scores)

        return {
            "scores": scores,
            "aggregated_score": aggregated,
            "passed": aggregated >= threshold,
            "threshold": threshold,
        }

