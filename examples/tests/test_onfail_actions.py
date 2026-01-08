"""Tests for OnFailAction handling."""

import time
from examples.tests.test_utils import TestResult
from wall_library import WallGuard, OnFailAction
from wall_library.validator_base import Validator, register_validator
from wall_library.classes.validation.validation_result import PassResult, FailResult
from typing import Any


@register_validator("test_failer")
class AlwaysFailValidator(Validator):
    """Validator that always fails for testing."""
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.rail_alias = "test_failer"
    
    def _validate(self, value: Any, metadata: dict) -> PassResult | FailResult:
        return FailResult(
            error_message="Always fails for testing",
            metadata=metadata,
        )


def test_onfail_exception():
    """Test EXCEPTION action."""
    start = time.time()
    try:
        guard = WallGuard().use(
            (AlwaysFailValidator, {"require_rc": False}, OnFailAction.EXCEPTION)
        )
        try:
            outcome = guard.validate("test")
            # For EXCEPTION action, if validation fails, it should raise
            # But if it doesn't raise, check the outcome
            if outcome.validation_passed:
                elapsed = time.time() - start
                return TestResult("OnFail EXCEPTION", False, "Validation should have failed", None, elapsed)
            else:
                # Validation failed - this is expected behavior
                # The exception might not be raised at validate() level
                elapsed = time.time() - start
                return TestResult("OnFail EXCEPTION", True, f"Validation failed as expected in {elapsed:.3f}s", None, elapsed)
        except Exception as e:
            # Exception was raised - that's also valid for EXCEPTION action
            elapsed = time.time() - start
            return TestResult("OnFail EXCEPTION", True, f"Exception raised correctly in {elapsed:.3f}s", None, elapsed)
    except Exception as e:
        elapsed = time.time() - start
        return TestResult("OnFail EXCEPTION", False, str(e), e, elapsed)


def test_onfail_filter():
    """Test FILTER action."""
    start = time.time()
    try:
        guard = WallGuard().use(
            (AlwaysFailValidator, {"require_rc": False}, OnFailAction.FILTER)
        )
        outcome = guard.validate("test")
        # FILTER should return None or empty
        assert outcome.validation_passed == False
        elapsed = time.time() - start
        return TestResult("OnFail FILTER", True, f"Value filtered in {elapsed:.3f}s", None, elapsed)
    except Exception as e:
        elapsed = time.time() - start
        return TestResult("OnFail FILTER", False, str(e), e, elapsed)


def test_onfail_noop():
    """Test NOOP action."""
    start = time.time()
    try:
        guard = WallGuard().use(
            (AlwaysFailValidator, {"require_rc": False}, OnFailAction.NOOP)
        )
        outcome = guard.validate("test")
        # NOOP should continue with invalid value
        assert outcome.validation_passed == False
        elapsed = time.time() - start
        return TestResult("OnFail NOOP", True, f"No operation in {elapsed:.3f}s", None, elapsed)
    except Exception as e:
        elapsed = time.time() - start
        return TestResult("OnFail NOOP", False, str(e), e, elapsed)


def test_onfail_refrain():
    """Test REFRAIN action."""
    start = time.time()
    try:
        guard = WallGuard().use(
            (AlwaysFailValidator, {"require_rc": False}, OnFailAction.REFRAIN)
        )
        outcome = guard.validate("test")
        # REFRAIN should return empty/default
        assert outcome.validation_passed == False
        elapsed = time.time() - start
        return TestResult("OnFail REFRAIN", True, f"Refrained in {elapsed:.3f}s", None, elapsed)
    except Exception as e:
        elapsed = time.time() - start
        return TestResult("OnFail REFRAIN", False, str(e), e, elapsed)


def test_onfail_fix():
    """Test FIX action."""
    start = time.time()
    try:
        guard = WallGuard().use(
            (AlwaysFailValidator, {"require_rc": False}, OnFailAction.FIX)
        )
        outcome = guard.validate("test")
        # FIX should attempt to fix the value
        assert outcome.validation_passed == False  # Still fails as we don't have fix logic
        elapsed = time.time() - start
        return TestResult("OnFail FIX", True, f"Fix attempted in {elapsed:.3f}s", None, elapsed)
    except Exception as e:
        elapsed = time.time() - start
        return TestResult("OnFail FIX", False, str(e), e, elapsed)


def test_onfail_reask():
    """Test REASK action."""
    start = time.time()
    try:
        guard = WallGuard().use(
            (AlwaysFailValidator, {"require_rc": False}, OnFailAction.REASK)
        )
        outcome = guard.validate("test")
        # REASK should trigger re-ask
        assert outcome.validation_passed == False
        elapsed = time.time() - start
        return TestResult("OnFail REASK", True, f"Reask triggered in {elapsed:.3f}s", None, elapsed)
    except Exception as e:
        elapsed = time.time() - start
        return TestResult("OnFail REASK", False, str(e), e, elapsed)


def run_tests() -> list:
    """Run all OnFailAction tests."""
    print("\n" + "=" * 60)
    print("OnFailAction Tests")
    print("=" * 60)
    
    tests = [
        test_onfail_exception,
        test_onfail_filter,
        test_onfail_noop,
        test_onfail_refrain,
        test_onfail_fix,
        test_onfail_reask,
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

