"""Tests for CLI functionality."""

import time
from examples.tests.test_utils import TestResult
from wall_library.cli import cli


def test_cli_import():
    """Test CLI import."""
    start = time.time()
    try:
        from wall_library.cli import cli
        assert cli is not None
        assert callable(cli)
        elapsed = time.time() - start
        return TestResult("CLI Import", True, f"CLI imported in {elapsed:.3f}s", None, elapsed)
    except Exception as e:
        elapsed = time.time() - start
        return TestResult("CLI Import", False, str(e), e, elapsed)


def test_cli_commands():
    """Test CLI commands exist."""
    start = time.time()
    try:
        from wall_library.cli.main import app
        # Check that Typer app exists
        assert app is not None
        elapsed = time.time() - start
        return TestResult("CLI Commands", True, f"CLI commands available in {elapsed:.3f}s", None, elapsed)
    except Exception as e:
        elapsed = time.time() - start
        return TestResult("CLI Commands", False, str(e), e, elapsed)


def run_tests() -> list:
    """Run all CLI tests."""
    print("\n" + "=" * 60)
    print("CLI Tests")
    print("=" * 60)
    
    tests = [
        test_cli_import,
        test_cli_commands,
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

