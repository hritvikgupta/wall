"""Metrics collector for aggregating metrics."""

from dataclasses import dataclass, field
from typing import List, Dict, Any
import statistics


@dataclass
class MetricsCollector:
    """Collector for aggregating metrics."""

    latencies: List[float] = field(default_factory=list)
    errors: List[str] = field(default_factory=list)
    successes: int = 0
    failures: int = 0

    def record_latency(self, latency: float):
        """Record a latency measurement.

        Args:
            latency: Latency in seconds
        """
        self.latencies.append(latency)

    def record_success(self):
        """Record a successful interaction."""
        self.successes += 1

    def record_failure(self, error: str = ""):
        """Record a failed interaction.

        Args:
            error: Error message
        """
        self.failures += 1
        if error:
            self.errors.append(error)

    def get_stats(self) -> Dict[str, Any]:
        """Get aggregated statistics.

        Returns:
            Statistics dictionary
        """
        stats = {
            "total_calls": self.successes + self.failures,
            "successes": self.successes,
            "failures": self.failures,
            "success_rate": self.successes / (self.successes + self.failures)
            if (self.successes + self.failures) > 0
            else 0.0,
        }

        if self.latencies:
            stats["latency"] = {
                "mean": statistics.mean(self.latencies),
                "median": statistics.median(self.latencies),
                "min": min(self.latencies),
                "max": max(self.latencies),
                "std_dev": statistics.stdev(self.latencies) if len(self.latencies) > 1 else 0.0,
            }

        if self.errors:
            stats["error_count"] = len(self.errors)

        return stats

