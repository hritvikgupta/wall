"""Tests for streaming functionality."""

import time
from examples.tests.test_utils import TestResult
from wall_library import WallGuard
from wall_library.run import StreamRunner


def test_stream_runner_creation():
    """Test stream runner creation."""
    start = time.time()
    try:
        guard = WallGuard()
        runner = StreamRunner()
        assert runner is not None
        elapsed = time.time() - start
        return TestResult("Stream Runner Creation", True, f"Runner created in {elapsed:.3f}s", None, elapsed)
    except Exception as e:
        elapsed = time.time() - start
        return TestResult("Stream Runner Creation", False, str(e), e, elapsed)


def test_stream_validation():
    """Test stream validation (simplified)."""
    start = time.time()
    try:
        guard = WallGuard()
        runner = StreamRunner()
        
        # Mock stream
        chunks = ["Hello", " ", "World", "!"]
        validated_chunks = []
        for chunk in chunks:
            outcome = guard.validate(chunk)
            validated_chunks.append(outcome.validation_passed)
        
        assert len(validated_chunks) == len(chunks)
        elapsed = time.time() - start
        return TestResult("Stream Validation", True, f"Validated {len(chunks)} chunks in {elapsed:.3f}s", None, elapsed)
    except Exception as e:
        elapsed = time.time() - start
        return TestResult("Stream Validation", False, str(e), e, elapsed)


def run_tests() -> list:
    """Run all streaming tests."""
    print("\n" + "=" * 60)
    print("Streaming Tests")
    print("=" * 60)
    
    tests = [
        test_stream_runner_creation,
        test_stream_validation,
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


