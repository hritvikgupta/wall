"""Tests for framework wrappers."""

import time
from examples.tests.test_utils import TestResult, check_optional_dependency
from wall_library import WallGuard
from wall_library.wrappers import LangChainWrapper, LangGraphWrapper


def test_langchain_wrapper():
    """Test LangChain wrapper."""
    start = time.time()
    if not check_optional_dependency("langchain_core"):
        elapsed = time.time() - start
        return TestResult("LangChain Wrapper", None, "Skipped - LangChain not available", None, elapsed)
    
    try:
        guard = WallGuard()
        wrapper = LangChainWrapper(guard)
        runnable = wrapper.to_runnable()
        assert runnable is not None
        elapsed = time.time() - start
        return TestResult("LangChain Wrapper", True, f"Runnable created in {elapsed:.3f}s", None, elapsed)
    except Exception as e:
        elapsed = time.time() - start
        return TestResult("LangChain Wrapper", False, str(e), e, elapsed)


def test_langgraph_wrapper():
    """Test LangGraph wrapper."""
    start = time.time()
    if not check_optional_dependency("langgraph"):
        elapsed = time.time() - start
        return TestResult("LangGraph Wrapper", None, "Skipped - LangGraph not available", None, elapsed)
    
    try:
        guard = WallGuard()
        wrapper = LangGraphWrapper(guard)
        node = wrapper.create_node("test_node")
        assert node is not None
        assert callable(node)
        elapsed = time.time() - start
        return TestResult("LangGraph Wrapper", True, f"Node created in {elapsed:.3f}s", None, elapsed)
    except Exception as e:
        elapsed = time.time() - start
        return TestResult("LangGraph Wrapper", False, str(e), e, elapsed)


def test_llamaindex_integration():
    """Test LlamaIndex integration."""
    start = time.time()
    if not check_optional_dependency("llama_index"):
        elapsed = time.time() - start
        return TestResult("LlamaIndex Integration", None, "Skipped - LlamaIndex not available", None, elapsed)
    
    try:
        from wall_library.integrations.llama_index import GuardrailsQueryEngine, GuardrailsChatEngine
        guard = WallGuard()
        # Just test that classes exist and can be imported
        assert GuardrailsQueryEngine is not None
        assert GuardrailsChatEngine is not None
        elapsed = time.time() - start
        return TestResult("LlamaIndex Integration", True, f"Classes imported in {elapsed:.3f}s", None, elapsed)
    except Exception as e:
        elapsed = time.time() - start
        return TestResult("LlamaIndex Integration", False, str(e), e, elapsed)


def test_databricks_integration():
    """Test Databricks MLflow integration."""
    start = time.time()
    if not check_optional_dependency("mlflow"):
        elapsed = time.time() - start
        return TestResult("Databricks Integration", None, "Skipped - MLflow not available", None, elapsed)
    
    try:
        from wall_library.integrations.databricks import MLFlowInstrumentor
        guard = WallGuard()
        instrumentor = MLFlowInstrumentor(guard=guard)
        assert instrumentor is not None
        elapsed = time.time() - start
        return TestResult("Databricks Integration", True, f"Instrumentor created in {elapsed:.3f}s", None, elapsed)
    except Exception as e:
        elapsed = time.time() - start
        return TestResult("Databricks Integration", False, str(e), e, elapsed)


def run_tests() -> list:
    """Run all framework wrapper tests."""
    print("\n" + "=" * 60)
    print("Framework Wrapper Tests")
    print("=" * 60)
    
    tests = [
        test_langchain_wrapper,
        test_langgraph_wrapper,
        test_llamaindex_integration,
        test_databricks_integration,
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


