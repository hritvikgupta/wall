"""Tests for monitoring functionality."""

import time
from examples.tests.test_utils import TestResult
from wall_library.monitoring import LLMMonitor, MetricsCollector


def test_llm_monitor_creation():
    """Test LLM monitor creation."""
    start = time.time()
    try:
        monitor = LLMMonitor()
        assert monitor is not None
        assert monitor.metrics_collector is not None
        elapsed = time.time() - start
        return TestResult("LLM Monitor Creation", True, f"Monitor created in {elapsed:.3f}s", None, elapsed)
    except Exception as e:
        elapsed = time.time() - start
        return TestResult("LLM Monitor Creation", False, str(e), e, elapsed)


def test_track_call():
    """Test tracking LLM calls."""
    start = time.time()
    try:
        monitor = LLMMonitor()
        monitor.track_call(
            input_data="What is Python?",
            output="Python is a programming language",
            metadata={"model": "gpt-3.5-turbo"},
            latency=0.5,
        )
        assert len(monitor.interactions) == 1
        elapsed = time.time() - start
        return TestResult("Track Call", True, f"Call tracked in {elapsed:.3f}s", None, elapsed)
    except Exception as e:
        elapsed = time.time() - start
        return TestResult("Track Call", False, str(e), e, elapsed)


def test_metrics_collector():
    """Test metrics collector."""
    start = time.time()
    try:
        collector = MetricsCollector()
        collector.record_latency(0.5)
        collector.record_latency(0.6)
        collector.record_success()
        collector.record_success()
        collector.record_failure("Test error")
        
        stats = collector.get_stats()
        assert stats["successes"] == 2
        assert stats["failures"] == 1
        assert "latency" in stats
        elapsed = time.time() - start
        return TestResult("Metrics Collector", True, f"Metrics collected in {elapsed:.3f}s", None, elapsed)
    except Exception as e:
        elapsed = time.time() - start
        return TestResult("Metrics Collector", False, str(e), e, elapsed)


def test_get_stats():
    """Test getting monitoring statistics."""
    start = time.time()
    try:
        monitor = LLMMonitor()
        monitor.track_call("input1", "output1", latency=0.5)
        monitor.track_call("input2", "output2", latency=0.6)
        
        stats = monitor.get_stats()
        assert stats["total_interactions"] == 2
        assert "metrics" in stats
        elapsed = time.time() - start
        return TestResult("Get Stats", True, f"Stats retrieved in {elapsed:.3f}s", None, elapsed)
    except Exception as e:
        elapsed = time.time() - start
        return TestResult("Get Stats", False, str(e), e, elapsed)


def test_latency_tracking():
    """Test latency tracking."""
    start = time.time()
    try:
        monitor = LLMMonitor()
        monitor.track_call("test", "response", latency=0.5)
        monitor.track_call("test", "response", latency=0.6)
        monitor.track_call("test", "response", latency=0.4)
        
        stats = monitor.get_stats()
        latency_stats = stats["metrics"]["latency"]
        assert latency_stats["mean"] > 0
        assert latency_stats["min"] == 0.4
        assert latency_stats["max"] == 0.6
        elapsed = time.time() - start
        return TestResult("Latency Tracking", True, f"Latency tracked in {elapsed:.3f}s", None, elapsed)
    except Exception as e:
        elapsed = time.time() - start
        return TestResult("Latency Tracking", False, str(e), e, elapsed)


def run_tests() -> list:
    """Run all monitoring tests."""
    print("\n" + "=" * 60)
    print("Monitoring Tests")
    print("=" * 60)
    
    tests = [
        test_llm_monitor_creation,
        test_track_call,
        test_metrics_collector,
        test_get_stats,
        test_latency_tracking,
    ]
    
    results = []
    for test in tests:
        result = test()
        results.append(result)
        status = "✓" if result.passed else "✗"
        print(f"{status} {result.name}: {result.message}")
    
    passed = sum(1 for r in results if r.passed)
    total = len(results)
    print(f"\nResults: {passed}/{total} passed")
    
    return results


if __name__ == "__main__":
    run_tests()


