"""Tests for structured output generation."""

import time
import json
from examples.tests.test_utils import TestResult, TestData, get_openai_api_key, check_optional_dependency
from wall_library import WallGuard
from wall_library.schema.pydantic_schema import pydantic_model_to_schema
from wall_library.classes.schema.processed_schema import ProcessedSchema


def test_pydantic_model_validation():
    """Test Pydantic model validation."""
    start = time.time()
    try:
        Person = TestData.sample_pydantic_model()
        guard = WallGuard()
        schema = pydantic_model_to_schema(Person)
        guard.processed_schema = ProcessedSchema(schema=schema)
        
        # Test with valid data
        valid_data = {"name": "John", "age": 30}
        outcome = guard.validate(json.dumps(valid_data))
        assert outcome is not None
        elapsed = time.time() - start
        return TestResult("Pydantic Model Validation", True, f"Validation passed in {elapsed:.3f}s", None, elapsed)
    except Exception as e:
        elapsed = time.time() - start
        return TestResult("Pydantic Model Validation", False, str(e), e, elapsed)


def test_rail_structured_output():
    """Test RAIL-based structured output."""
    start = time.time()
    try:
        rail_string = TestData.sample_rail_string()
        guard = WallGuard.for_rail_string(rail_string)
        assert guard.processed_schema is not None
        elapsed = time.time() - start
        return TestResult("RAIL Structured Output", True, f"RAIL guard created in {elapsed:.3f}s", None, elapsed)
    except Exception as e:
        elapsed = time.time() - start
        return TestResult("RAIL Structured Output", False, str(e), e, elapsed)


def test_openai_structured_output():
    """Test OpenAI integration with structured output."""
    start = time.time()
    api_key = get_openai_api_key()
    if not api_key or not check_optional_dependency("openai"):
        elapsed = time.time() - start
        return TestResult("OpenAI Structured Output", None, "Skipped - OpenAI not available", None, elapsed)
    
    try:
        from openai import OpenAI
        from pydantic import BaseModel, Field
        
        class Pet(BaseModel):
            pet_type: str = Field(description="Species of pet")
            name: str = Field(description="a unique pet name")
        
        client = OpenAI(api_key=api_key)
        guard = WallGuard()
        schema = pydantic_model_to_schema(Pet)
        guard.processed_schema = ProcessedSchema(schema=schema)
        
        # Test with mock LLM response
        mock_response = '{"pet_type": "dog", "name": "Buddy"}'
        outcome = guard.validate(mock_response)
        assert outcome is not None
        elapsed = time.time() - start
        return TestResult("OpenAI Structured Output", True, f"Structured output validated in {elapsed:.3f}s", None, elapsed)
    except Exception as e:
        elapsed = time.time() - start
        return TestResult("OpenAI Structured Output", False, str(e), e, elapsed)


def run_tests() -> list:
    """Run all structured output tests."""
    print("\n" + "=" * 60)
    print("Structured Output Tests")
    print("=" * 60)
    
    tests = [
        test_pydantic_model_validation,
        test_rail_structured_output,
        test_openai_structured_output,
    ]
    
    results = []
    for test in tests:
        result = test()
        results.append(result)
        if result.passed is None:
            status = "⊘"
            print(f"{status} {result.name}: {result.message}")
        else:
            status = "✓" if result.passed else "✗"
            print(f"{status} {result.name}: {result.message}")
    
    passed = sum(1 for r in results if r.passed == True)
    total = sum(1 for r in results if r.passed is not None)
    skipped = sum(1 for r in results if r.passed is None)
    print(f"\nResults: {passed}/{total} passed, {skipped} skipped")
    
    return results


if __name__ == "__main__":
    run_tests()


