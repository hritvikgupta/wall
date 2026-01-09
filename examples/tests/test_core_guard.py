"""Tests for core Guard functionality."""

import time
from examples.tests.test_utils import TestResult, TestData
from wall_library import WallGuard, OnFailAction
from wall_library.validator_base import Validator, register_validator
from wall_library.classes.validation.validation_result import PassResult, FailResult
from typing import Any


@register_validator("test_length")
class LengthValidator(Validator):
    """Test length validator."""
    
    def __init__(self, min_length: int = 0, max_length: int = 100, **kwargs):
        super().__init__(**kwargs)
        self.min_length = min_length
        self.max_length = max_length
        self.rail_alias = "test_length"
    
    def _validate(self, value: Any, metadata: dict) -> PassResult | FailResult:
        if not isinstance(value, str):
            return FailResult(
                error_message=f"Value must be a string, got {type(value).__name__}",
                metadata=metadata,
            )
        length = len(value)
        if length < self.min_length:
            return FailResult(
                error_message=f"Value too short. Minimum length: {self.min_length}, got: {length}",
                metadata=metadata,
            )
        if length > self.max_length:
            return FailResult(
                error_message=f"Value too long. Maximum length: {self.max_length}, got: {length}",
                metadata=metadata,
            )
        return PassResult(metadata=metadata)


def test_guard_creation():
    """Test guard creation."""
    start = time.time()
    try:
        guard = WallGuard()
        assert guard is not None
        assert guard.validators == []
        assert guard.validator_map == {}
        elapsed = time.time() - start
        return TestResult("Guard Creation", True, f"Guard created in {elapsed:.3f}s", None, elapsed)
    except Exception as e:
        elapsed = time.time() - start
        return TestResult("Guard Creation", False, str(e), e, elapsed)


def test_guard_with_validator():
    """Test guard with validator."""
    start = time.time()
    try:
        guard = WallGuard().use(
            (LengthValidator, {"min_length": 5, "max_length": 20, "require_rc": False}, OnFailAction.EXCEPTION)
        )
        assert len(guard.validators) == 1
        assert "output" in guard.validator_map
        elapsed = time.time() - start
        return TestResult("Guard with Validator", True, f"Guard configured with validator in {elapsed:.3f}s", None, elapsed)
    except Exception as e:
        elapsed = time.time() - start
        return TestResult("Guard with Validator", False, str(e), e, elapsed)


def test_guard_validation():
    """Test guard validation."""
    start = time.time()
    try:
        guard = WallGuard().use(
            (LengthValidator, {"min_length": 5, "max_length": 20, "require_rc": False}, OnFailAction.EXCEPTION)
        )
        outcome = guard.validate("Hello World")
        assert outcome.validation_passed == True
        assert outcome.validated_output == "Hello World"
        elapsed = time.time() - start
        return TestResult("Guard Validation", True, f"Validation passed in {elapsed:.3f}s", None, elapsed)
    except Exception as e:
        elapsed = time.time() - start
        return TestResult("Guard Validation", False, str(e), e, elapsed)


def test_multiple_validators():
    """Test multiple validators."""
    start = time.time()
    try:
        guard = WallGuard().use(
            (LengthValidator, {"min_length": 5, "max_length": 20, "require_rc": False}, OnFailAction.EXCEPTION)
        ).use(
            (LengthValidator, {"min_length": 10, "max_length": 15, "require_rc": False}, OnFailAction.FILTER)
        )
        assert len(guard.validators) == 2
        elapsed = time.time() - start
        return TestResult("Multiple Validators", True, f"Guard with multiple validators in {elapsed:.3f}s", None, elapsed)
    except Exception as e:
        elapsed = time.time() - start
        return TestResult("Multiple Validators", False, str(e), e, elapsed)


def test_guard_configure():
    """Test guard configuration."""
    start = time.time()
    try:
        guard = WallGuard()
        guard.configure(num_reasks=3)
        assert guard.num_reasks == 3
        assert guard.exec_options.num_reasks == 3
        elapsed = time.time() - start
        return TestResult("Guard Configuration", True, f"Guard configured in {elapsed:.3f}s", None, elapsed)
    except Exception as e:
        elapsed = time.time() - start
        return TestResult("Guard Configuration", False, str(e), e, elapsed)


def run_tests() -> list:
    """Run all core guard tests."""
    print("\n" + "=" * 60)
    print("Core Guard Tests")
    print("=" * 60)
    
    tests = [
        test_guard_creation,
        test_guard_with_validator,
        test_guard_validation,
        test_multiple_validators,
        test_guard_configure,
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


