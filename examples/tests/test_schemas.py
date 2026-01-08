"""Tests for schema functionality."""

import time
from examples.tests.test_utils import TestResult, TestData, create_temp_rail_file, cleanup_temp_file
from wall_library.schema.pydantic_schema import pydantic_model_to_schema
from wall_library.schema.rail_schema import rail_string_to_schema, rail_file_to_schema
from wall_library.schema.generator import generate_json_schema


def test_pydantic_to_schema():
    """Test Pydantic model to schema conversion."""
    start = time.time()
    try:
        Person = TestData.sample_pydantic_model()
        schema = pydantic_model_to_schema(Person)
        assert schema is not None
        assert "properties" in schema or "type" in schema
        elapsed = time.time() - start
        return TestResult("Pydantic to Schema", True, f"Schema generated in {elapsed:.3f}s", None, elapsed)
    except Exception as e:
        elapsed = time.time() - start
        return TestResult("Pydantic to Schema", False, str(e), e, elapsed)


def test_rail_string_parsing():
    """Test RAIL string parsing."""
    start = time.time()
    try:
        rail_string = TestData.sample_rail_string()
        schema = rail_string_to_schema(rail_string)
        assert schema is not None
        assert schema.schema is not None
        elapsed = time.time() - start
        return TestResult("RAIL String Parsing", True, f"RAIL parsed in {elapsed:.3f}s", None, elapsed)
    except Exception as e:
        elapsed = time.time() - start
        return TestResult("RAIL String Parsing", False, str(e), e, elapsed)


def test_rail_file_parsing():
    """Test RAIL file parsing."""
    start = time.time()
    rail_file = None
    try:
        rail_file = create_temp_rail_file()
        schema = rail_file_to_schema(rail_file)
        assert schema is not None
        assert schema.schema is not None
        elapsed = time.time() - start
        cleanup_temp_file(rail_file)
        return TestResult("RAIL File Parsing", True, f"RAIL file parsed in {elapsed:.3f}s", None, elapsed)
    except Exception as e:
        elapsed = time.time() - start
        if rail_file:
            cleanup_temp_file(rail_file)
        return TestResult("RAIL File Parsing", False, str(e), e, elapsed)


def test_json_schema_generation():
    """Test JSON schema generation."""
    start = time.time()
    try:
        rail_string = TestData.sample_rail_string()
        processed_schema = rail_string_to_schema(rail_string)
        json_schema = generate_json_schema(processed_schema)
        assert json_schema is not None
        elapsed = time.time() - start
        return TestResult("JSON Schema Generation", True, f"JSON schema generated in {elapsed:.3f}s", None, elapsed)
    except Exception as e:
        elapsed = time.time() - start
        return TestResult("JSON Schema Generation", False, str(e), e, elapsed)


def run_tests() -> list:
    """Run all schema tests."""
    print("\n" + "=" * 60)
    print("Schema Tests")
    print("=" * 60)
    
    tests = [
        test_pydantic_to_schema,
        test_rail_string_parsing,
        test_rail_file_parsing,
        test_json_schema_generation,
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

