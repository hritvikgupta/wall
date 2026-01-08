"""Tests for validator functionality."""

import time
from examples.tests.test_utils import TestResult
from wall_library.validator_base import Validator, register_validator
from wall_library.classes.validation.validation_result import PassResult, FailResult
from wall_library.types.on_fail import OnFailAction
from typing import Any


@register_validator("test_range")
class RangeValidator(Validator):
    """Test range validator for numbers."""
    
    def __init__(self, min_val: float = 0, max_val: float = 100, **kwargs):
        super().__init__(**kwargs)
        self.min_val = min_val
        self.max_val = max_val
        self.rail_alias = "test_range"
    
    def _validate(self, value: Any, metadata: dict) -> PassResult | FailResult:
        try:
            num = float(value)
            if num < self.min_val:
                return FailResult(
                    error_message=f"Value {num} is below minimum {self.min_val}",
                    metadata=metadata,
                )
            if num > self.max_val:
                return FailResult(
                    error_message=f"Value {num} is above maximum {self.max_val}",
                    metadata=metadata,
                )
            return PassResult(metadata=metadata)
        except (ValueError, TypeError):
            return FailResult(
                error_message=f"Value {value} is not a number",
                metadata=metadata,
            )


def test_validator_creation():
    """Test validator creation."""
    start = time.time()
    try:
        validator = RangeValidator(min_val=0, max_val=100, require_rc=False)
        assert validator is not None
        assert validator.min_val == 0
        assert validator.max_val == 100
        elapsed = time.time() - start
        return TestResult("Validator Creation", True, f"Validator created in {elapsed:.3f}s", None, elapsed)
    except Exception as e:
        elapsed = time.time() - start
        return TestResult("Validator Creation", False, str(e), e, elapsed)


def test_validator_pass():
    """Test validator with passing value."""
    start = time.time()
    try:
        validator = RangeValidator(min_val=0, max_val=100, require_rc=False)
        result = validator.validate(50, metadata={})
        assert result.is_pass == True
        assert isinstance(result, PassResult)
        elapsed = time.time() - start
        return TestResult("Validator Pass", True, f"Validation passed in {elapsed:.3f}s", None, elapsed)
    except Exception as e:
        elapsed = time.time() - start
        return TestResult("Validator Pass", False, str(e), e, elapsed)


def test_validator_fail():
    """Test validator with failing value."""
    start = time.time()
    try:
        validator = RangeValidator(min_val=0, max_val=100, require_rc=False)
        result = validator.validate(150, metadata={})
        assert result.is_fail == True
        assert isinstance(result, FailResult)
        elapsed = time.time() - start
        return TestResult("Validator Fail", True, f"Validation correctly failed in {elapsed:.3f}s", None, elapsed)
    except Exception as e:
        elapsed = time.time() - start
        return TestResult("Validator Fail", False, str(e), e, elapsed)


def test_validator_metadata():
    """Test validator with metadata."""
    start = time.time()
    try:
        validator = RangeValidator(min_val=0, max_val=100, require_rc=False)
        metadata = {"test_key": "test_value"}
        result = validator.validate(50, metadata=metadata)
        assert result.metadata == metadata
        elapsed = time.time() - start
        return TestResult("Validator Metadata", True, f"Metadata passed through in {elapsed:.3f}s", None, elapsed)
    except Exception as e:
        elapsed = time.time() - start
        return TestResult("Validator Metadata", False, str(e), e, elapsed)


def test_validator_on_fail():
    """Test validator on_fail action."""
    start = time.time()
    try:
        validator = RangeValidator(min_val=0, max_val=100, on_fail=OnFailAction.EXCEPTION, require_rc=False)
        assert validator.on_fail_descriptor == OnFailAction.EXCEPTION
        elapsed = time.time() - start
        return TestResult("Validator OnFail", True, f"OnFail action set in {elapsed:.3f}s", None, elapsed)
    except Exception as e:
        elapsed = time.time() - start
        return TestResult("Validator OnFail", False, str(e), e, elapsed)


def run_tests() -> list:
    """Run all validator tests."""
    print("\n" + "=" * 60)
    print("Validator Tests")
    print("=" * 60)
    
    tests = [
        test_validator_creation,
        test_validator_pass,
        test_validator_fail,
        test_validator_metadata,
        test_validator_on_fail,
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

