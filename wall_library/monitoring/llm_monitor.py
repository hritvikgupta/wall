"""LLM monitor for tracking LLM interactions."""

from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional
from datetime import datetime
import time

from wall_library.monitoring.metrics_collector import MetricsCollector


@dataclass
class LLMMonitor:
    """Monitor for tracking LLM interactions."""

    metrics_collector: MetricsCollector = field(default_factory=MetricsCollector)
    interactions: List[Dict[str, Any]] = field(default_factory=list)
    enable_telemetry: bool = True
    logger: Optional[Any] = field(default=None)

    def track_call(
        self,
        input_data: Any,
        output: str,
        metadata: Optional[Dict[str, Any]] = None,
        latency: Optional[float] = None,
    ):
        """Track an LLM call.

        Args:
            input_data: Input to LLM
            output: Output from LLM
            metadata: Optional metadata
            latency: Optional latency in seconds
        """
        interaction = {
            "timestamp": datetime.now().isoformat(),
            "input": str(input_data),
            "output": output,
            "latency": latency,
            "metadata": metadata or {},
        }

        self.interactions.append(interaction)

        # Update metrics
        if latency is not None:
            self.metrics_collector.record_latency(latency)
            self.metrics_collector.record_success()

        # Export to OpenTelemetry if enabled
        if self.enable_telemetry:
            self._export_telemetry(interaction)
        
        # Log LLM call if logger is set
        if self.logger:
            self.logger.log_llm_call(
                input_data=input_data,
                output=output,
                metadata=metadata,
                latency=latency,
            )
    
    def set_logger(self, logger: Any):
        """Set logger for this monitor.
        
        Args:
            logger: WallLogger instance
        """
        self.logger = logger
        return self

    def _export_telemetry(self, interaction: Dict[str, Any]):
        """Export interaction to OpenTelemetry (simplified)."""
        # Implementation would integrate with OpenTelemetry
        pass

    def get_stats(self) -> Dict[str, Any]:
        """Get monitoring statistics.

        Returns:
            Statistics dictionary
        """
        return {
            "total_interactions": len(self.interactions),
            "metrics": self.metrics_collector.get_stats(),
        }

