"""Tests for server functionality."""

import time
from examples.tests.test_utils import TestResult, check_optional_dependency


def test_server_import():
    """Test server import."""
    start = time.time()
    if not check_optional_dependency("flask"):
        elapsed = time.time() - start
        return TestResult("Server Import", None, "Skipped - Flask not available", None, elapsed)
    
    try:
        from wall_library.server import app
        assert app is not None
        elapsed = time.time() - start
        return TestResult("Server Import", True, f"Server imported in {elapsed:.3f}s", None, elapsed)
    except Exception as e:
        elapsed = time.time() - start
        return TestResult("Server Import", False, str(e), e, elapsed)


def test_server_creation():
    """Test Flask app creation."""
    start = time.time()
    if not check_optional_dependency("flask"):
        elapsed = time.time() - start
        return TestResult("Server Creation", None, "Skipped - Flask not available", None, elapsed)
    
    try:
        from wall_library.server.app import create_app
        app = create_app()
        assert app is not None
        assert app.config is not None
        elapsed = time.time() - start
        return TestResult("Server Creation", True, f"Server created in {elapsed:.3f}s", None, elapsed)
    except Exception as e:
        elapsed = time.time() - start
        return TestResult("Server Creation", False, str(e), e, elapsed)


def test_server_routes():
    """Test server routes registration."""
    start = time.time()
    if not check_optional_dependency("flask"):
        elapsed = time.time() - start
        return TestResult("Server Routes", None, "Skipped - Flask not available", None, elapsed)
    
    try:
        from wall_library.server.app import create_app
        app = create_app()
        # Check that routes are registered
        assert app.url_map is not None
        elapsed = time.time() - start
        return TestResult("Server Routes", True, f"Routes registered in {elapsed:.3f}s", None, elapsed)
    except Exception as e:
        elapsed = time.time() - start
        return TestResult("Server Routes", False, str(e), e, elapsed)


def run_tests() -> list:
    """Run all server tests."""
    print("\n" + "=" * 60)
    print("Server Tests")
    print("=" * 60)
    
    tests = [
        test_server_import,
        test_server_creation,
        test_server_routes,
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

