"""Comprehensive test suite for Wall Library.

This test suite validates all features of the Wall Library including:
- Core Guard features
- Validators and OnFailActions
- Schema systems (Pydantic, RAIL, JSON)
- NLP context filtering
- RAG with ChromaDB
- Scoring metrics
- Monitoring
- Streaming and Async
- Framework wrappers
- CLI and Server
- Integration workflows
"""

import sys
import time
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from examples.tests.test_utils import TestResult


def run_comprehensive_tests():
    """Run all comprehensive tests."""
    print("=" * 80)
    print("WALL LIBRARY - COMPREHENSIVE TEST SUITE")
    print("=" * 80)
    print("\nThis test suite validates all features of the Wall Library.\n")
    
    total_start = time.time()
    all_results = []
    
    # Import and run all test modules
    test_modules = [
        ("Core Guard", "examples.tests.test_core_guard", "run_tests"),
        ("Validators", "examples.tests.test_validators", "run_tests"),
        ("OnFailActions", "examples.tests.test_onfail_actions", "run_tests"),
        ("Schemas", "examples.tests.test_schemas", "run_tests"),
        ("Structured Output", "examples.tests.test_structured_output", "run_tests"),
        ("NLP Context Filtering", "examples.tests.test_nlp_context", "run_tests"),
        ("RAG (ChromaDB)", "examples.tests.test_rag", "run_tests"),
        ("Scoring Metrics", "examples.tests.test_scoring", "run_tests"),
        ("Monitoring", "examples.tests.test_monitoring", "run_tests"),
        ("Streaming", "examples.tests.test_streaming", "run_tests"),
        ("Async", "examples.tests.test_async", "run_tests"),
        ("Framework Wrappers", "examples.tests.test_frameworks", "run_tests"),
        ("CLI", "examples.tests.test_cli", "run_tests"),
        ("Server", "examples.tests.test_server", "run_tests"),
        ("Integration", "examples.tests.test_integration", "run_tests"),
    ]
    
    module_results = {}
    
    for module_name, module_path, function_name in test_modules:
        try:
            module = __import__(module_path, fromlist=[function_name])
            test_function = getattr(module, function_name)
            
            print(f"\n{'='*80}")
            print(f"Running {module_name} Tests...")
            print(f"{'='*80}")
            
            results = test_function()
            all_results.extend(results)
            module_results[module_name] = results
            
        except ImportError as e:
            print(f"\n⚠️  Skipped {module_name}: {e}")
            module_results[module_name] = []
        except Exception as e:
            print(f"\n❌ Error running {module_name}: {e}")
            module_results[module_name] = []
    
    # Generate final report
    total_elapsed = time.time() - total_start
    
    print("\n" + "=" * 80)
    print("FINAL TEST REPORT")
    print("=" * 80)
    
    # Count results
    total_passed = sum(1 for r in all_results if r.passed == True)
    total_failed = sum(1 for r in all_results if r.passed == False)
    total_skipped = sum(1 for r in all_results if r.passed is None)
    total_tests = len(all_results)
    
    # Module summary
    print("\nModule Summary:")
    print("-" * 80)
    for module_name, results in module_results.items():
        if not results:
            status = "⊘ SKIPPED"
        else:
            passed = sum(1 for r in results if r.passed == True)
            failed = sum(1 for r in results if r.passed == False)
            skipped = sum(1 for r in results if r.passed is None)
            total = passed + failed
            
            if failed == 0 and skipped == 0:
                status = f"✓ {passed}/{total} PASSED"
            elif failed > 0:
                status = f"✗ {passed}/{total} PASSED, {failed} FAILED"
            else:
                status = f"⊘ {passed}/{total} PASSED, {skipped} SKIPPED"
        
        print(f"  {module_name:.<30} {status}")
    
    # Overall summary
    print("\n" + "-" * 80)
    print("Overall Summary:")
    print(f"  Total Tests:     {total_tests}")
    print(f"  Passed:          {total_passed} ✓")
    print(f"  Failed:          {total_failed} ✗")
    print(f"  Skipped:         {total_skipped} ⊘")
    print(f"  Success Rate:    {(total_passed/total_tests*100) if total_tests > 0 else 0:.1f}%")
    print(f"  Execution Time:  {total_elapsed:.2f}s")
    print("-" * 80)
    
    # Failed tests details
    if total_failed > 0:
        print("\nFailed Tests:")
        print("-" * 80)
        for result in all_results:
            if result.passed == False:
                print(f"  ✗ {result.name}")
                print(f"    Error: {result.message}")
                if result.error:
                    print(f"    Exception: {type(result.error).__name__}")
        print("-" * 80)
    
    # Final status
    print("\n" + "=" * 80)
    if total_failed == 0:
        print("✅ ALL TESTS PASSED!")
        print("=" * 80)
        return 0
    else:
        print(f"⚠️  {total_failed} TEST(S) FAILED")
        print("=" * 80)
        return 1


if __name__ == "__main__":
    exit_code = run_comprehensive_tests()
    sys.exit(exit_code)


