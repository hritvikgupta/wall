"""MLflow instrumentor for Databricks integration."""

from typing import Any, Dict, Optional

try:
    import mlflow
    MLFLOW_AVAILABLE = True
except ImportError:
    MLFLOW_AVAILABLE = False
    mlflow = None  # type: ignore

from wall_library.guard import WallGuard
from wall_library.logger import logger
from wall_library.monitoring.llm_monitor import LLMMonitor


class MLFlowInstrumentor:
    """MLflow instrumentor for tracking guard executions."""

    def __init__(self, guard: Optional[WallGuard] = None, run_name: Optional[str] = None):
        """Initialize MLflow instrumentor.

        Args:
            guard: Optional guard to instrument
            run_name: Optional MLflow run name
        """
        if not MLFLOW_AVAILABLE:
            raise ImportError(
                "MLflow is required. Install with: pip install wall-library[databricks]"
            )

        self.guard = guard
        self.run_name = run_name
        self.monitor = LLMMonitor()

    def start_run(self):
        """Start MLflow run."""
        if MLFLOW_AVAILABLE:
            mlflow.start_run(run_name=self.run_name)

    def end_run(self):
        """End MLflow run."""
        if MLFLOW_AVAILABLE:
            mlflow.end_run()

    def log_validation(
        self,
        input_data: str,
        output: str,
        validation_passed: bool,
        metadata: Optional[Dict[str, Any]] = None,
    ):
        """Log validation to MLflow.

        Args:
            input_data: Input data
            output: Output data
            validation_passed: Whether validation passed
            metadata: Optional metadata
        """
        if not MLFLOW_AVAILABLE:
            return

        try:
            # Log metrics
            mlflow.log_metric("validation_passed", 1 if validation_passed else 0)
            mlflow.log_metric("output_length", len(output))

            # Log parameters
            if metadata:
                for key, value in metadata.items():
                    if isinstance(value, (str, int, float, bool)):
                        mlflow.log_param(key, value)

            # Log tags
            mlflow.set_tag("validation_status", "passed" if validation_passed else "failed")

        except Exception as e:
            logger.warning(f"Failed to log to MLflow: {e}")

