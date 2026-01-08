"""Tests for async functionality."""

import time
import asyncio
from examples.tests.test_utils import TestResult
from wall_library.async_guard import AsyncGuard


def test_async_guard_creation():
    """Test async guard creation."""
    start = time.time()
    try:
        guard = AsyncGuard()
        assert guard is not None
        elapsed = time.time() - start
        return TestResult("Async Guard Creation", True, f"Guard created in {elapsed:.3f}s", None, elapsed)
    except Exception as e:
        elapsed = time.time() - start
        return TestResult("Async Guard Creation", False, str(e), e, elapsed)


async def async_test_validation():
    """Test async validation."""
    start = time.time()
    try:
        guard = AsyncGuard()
        # Use async_validate instead of validate
        outcome = await guard.async_validate("test")
        assert outcome is not None
        elapsed = time.time() - start
        return TestResult("Async Validation", True, f"Validation completed in {elapsed:.3f}s", None, elapsed)
    except Exception as e:
        elapsed = time.time() - start
        return TestResult("Async Validation", False, str(e), e, elapsed)


def test_async_validation():
    """Wrapper for async validation test."""
    return asyncio.run(async_test_validation())


def run_tests() -> list:
    """Run all async tests."""
    print("\n" + "=" * 60)
    print("Async Tests")
    print("=" * 60)
    
    tests = [
        test_async_guard_creation,
        test_async_validation,
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

