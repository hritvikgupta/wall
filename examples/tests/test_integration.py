"""Integration tests for full workflows."""

import time
import json
from examples.tests.test_utils import TestResult, TestData, check_optional_dependency
from wall_library import WallGuard
from wall_library.nlp import ContextManager
from wall_library.scoring import ResponseScorer


def test_guard_nlp_combined():
    """Test Guard + NLP context filtering combined."""
    start = time.time()
    try:
        guard = WallGuard()
        context_manager = ContextManager()
        context_manager.add_keywords(["Python", "programming"])
        
        # Test that both work together
        text = "Python is a programming language"
        is_valid = context_manager.check_context(text)
        assert is_valid == True
        
        outcome = guard.validate(text)
        assert outcome is not None
        elapsed = time.time() - start
        return TestResult("Guard + NLP Combined", True, f"Combined workflow in {elapsed:.3f}s", None, elapsed)
    except Exception as e:
        elapsed = time.time() - start
        return TestResult("Guard + NLP Combined", False, str(e), e, elapsed)


def test_guard_scoring_combined():
    """Test Guard + Scoring combined."""
    start = time.time()
    try:
        guard = WallGuard()
        scorer = ResponseScorer()
        
        response = "This is a test response"
        expected = "This is a test response"
        scores = scorer.score(response, expected)
        
        outcome = guard.validate(response)
        assert outcome is not None
        assert scores is not None
        elapsed = time.time() - start
        return TestResult("Guard + Scoring Combined", True, f"Combined workflow in {elapsed:.3f}s", None, elapsed)
    except Exception as e:
        elapsed = time.time() - start
        return TestResult("Guard + Scoring Combined", False, str(e), e, elapsed)


def test_guard_monitoring_combined():
    """Test Guard + Monitoring combined."""
    start = time.time()
    try:
        from wall_library.monitoring import LLMMonitor
        guard = WallGuard()
        monitor = LLMMonitor()
        
        response = "Test response"
        outcome = guard.validate(response)
        
        monitor.track_call(
            input_data="test input",
            output=response,
            metadata={"model": "test"},
            latency=0.1,
        )
        
        stats = monitor.get_stats()
        assert stats["total_interactions"] == 1
        elapsed = time.time() - start
        return TestResult("Guard + Monitoring Combined", True, f"Combined workflow in {elapsed:.3f}s", None, elapsed)
    except Exception as e:
        elapsed = time.time() - start
        return TestResult("Guard + Monitoring Combined", False, str(e), e, elapsed)


def test_full_pipeline():
    """Test full pipeline: Guard + NLP + RAG + Scoring + Monitoring."""
    start = time.time()
    try:
        guard = WallGuard()
        context_manager = ContextManager()
        context_manager.add_keywords(["Python"])
        scorer = ResponseScorer()
        from wall_library.monitoring import LLMMonitor
        monitor = LLMMonitor()
        
        # Test text
        text = "Python is a programming language"
        
        # Check context
        is_valid = context_manager.check_context(text)
        assert is_valid == True
        
        # Validate with guard
        outcome = guard.validate(text)
        assert outcome.validation_passed == True
        
        # Score response
        scores = scorer.score(text, "Python programming")
        assert scores is not None
        
        # Monitor
        monitor.track_call("test", text, latency=0.1)
        
        elapsed = time.time() - start
        return TestResult("Full Pipeline", True, f"Full pipeline in {elapsed:.3f}s", None, elapsed)
    except Exception as e:
        elapsed = time.time() - start
        return TestResult("Full Pipeline", False, str(e), e, elapsed)


def run_tests() -> list:
    """Run all integration tests."""
    print("\n" + "=" * 60)
    print("Integration Tests")
    print("=" * 60)
    
    tests = [
        test_guard_nlp_combined,
        test_guard_scoring_combined,
        test_guard_monitoring_combined,
        test_full_pipeline,
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

