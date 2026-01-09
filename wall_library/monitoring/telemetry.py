"""Telemetry utilities."""

from typing import Any, Dict, Optional

try:
    from opentelemetry import trace
    from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporter
    from opentelemetry.sdk.trace import TracerProvider
    from opentelemetry.sdk.trace.export import BatchSpanProcessor
    OPENTELEMETRY_AVAILABLE = True
except ImportError:
    OPENTELEMETRY_AVAILABLE = False
    trace = None  # type: ignore

from wall_library.logger import logger


def setup_telemetry(
    service_name: str = "wall_library",
    endpoint: Optional[str] = None,
):
    """Setup OpenTelemetry telemetry.

    Args:
        service_name: Name of the service
        endpoint: OTLP endpoint URL
    """
    if not OPENTELEMETRY_AVAILABLE:
        logger.warning("OpenTelemetry not available")
        return

    try:
        provider = TracerProvider()
        if endpoint:
            exporter = OTLPSpanExporter(endpoint=endpoint)
            provider.add_span_processor(BatchSpanProcessor(exporter))
        trace.set_tracer_provider(provider)
        logger.info("Telemetry setup complete")
    except Exception as e:
        logger.warning(f"Failed to setup telemetry: {e}")


def trace_guard_execution(guard_name: str, operation: str):
    """Trace guard execution (simplified).

    Args:
        guard_name: Name of the guard
        operation: Operation name
    """
    if OPENTELEMETRY_AVAILABLE and trace:
        tracer = trace.get_tracer(__name__)
        with tracer.start_as_current_span(f"{guard_name}.{operation}") as span:
            span.set_attribute("guard_name", guard_name)
            span.set_attribute("operation", operation)
            return span
    return None


