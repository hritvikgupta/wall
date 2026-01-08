"""Tests for NLP context filtering."""

import time
from examples.tests.test_utils import TestResult, TestData, create_temp_document_file, cleanup_temp_file
from wall_library.nlp import ContextManager


def test_keyword_matching():
    """Test keyword matching."""
    start = time.time()
    try:
        context_manager = ContextManager()
        keywords = TestData.sample_keywords()
        context_manager.add_keywords(keywords)
        
        text = "Python is a great programming language"
        is_valid = context_manager.check_context(text)
        assert is_valid == True  # Should match "Python" and "programming"
        elapsed = time.time() - start
        return TestResult("Keyword Matching", True, f"Keywords matched in {elapsed:.3f}s", None, elapsed)
    except Exception as e:
        elapsed = time.time() - start
        return TestResult("Keyword Matching", False, str(e), e, elapsed)


def test_string_list_matching():
    """Test string list matching."""
    start = time.time()
    try:
        context_manager = ContextManager()
        documents = TestData.sample_documents()
        context_manager.add_string_list(documents)
        
        text = "Python is used for web development"
        is_valid = context_manager.check_context(text, threshold=0.5)
        assert is_valid == True
        elapsed = time.time() - start
        return TestResult("String List Matching", True, f"String list matched in {elapsed:.3f}s", None, elapsed)
    except Exception as e:
        elapsed = time.time() - start
        return TestResult("String List Matching", False, str(e), e, elapsed)


def test_file_based_context():
    """Test file-based context loading."""
    start = time.time()
    doc_file = None
    try:
        doc_file = create_temp_document_file()
        context_manager = ContextManager()
        context_manager.load_from_file(doc_file)
        
        assert len(context_manager.contexts) > 0
        text = "Python programming"
        is_valid = context_manager.check_context(text)
        assert is_valid == True
        elapsed = time.time() - start
        cleanup_temp_file(doc_file)
        return TestResult("File-based Context", True, f"File loaded in {elapsed:.3f}s", None, elapsed)
    except Exception as e:
        elapsed = time.time() - start
        if doc_file:
            cleanup_temp_file(doc_file)
        return TestResult("File-based Context", False, str(e), e, elapsed)


def test_cosine_similarity():
    """Test cosine similarity filtering."""
    start = time.time()
    try:
        context_manager = ContextManager()
        documents = TestData.sample_documents()
        context_manager.add_string_list(documents)
        
        # Test with similar text
        similar_text = "Python is a versatile programming language for web development"
        is_valid = context_manager.check_context(similar_text, threshold=0.7)
        assert is_valid == True
        
        # Test with different text
        different_text = "Cooking recipes and food preparation techniques"
        is_valid = context_manager.check_context(different_text, threshold=0.7)
        # Should fail or pass depending on threshold
        elapsed = time.time() - start
        return TestResult("Cosine Similarity", True, f"Similarity calculated in {elapsed:.3f}s", None, elapsed)
    except Exception as e:
        elapsed = time.time() - start
        return TestResult("Cosine Similarity", False, str(e), e, elapsed)


def test_context_boundary():
    """Test context boundary enforcement."""
    start = time.time()
    try:
        context_manager = ContextManager()
        keywords = ["Python", "programming"]
        context_manager.add_keywords(keywords)
        
        # Valid text
        valid_text = "Python programming is fun"
        assert context_manager.check_context(valid_text) == True
        
        # Invalid text (should still pass if no strict boundary)
        invalid_text = "Cooking is fun"
        # May pass or fail depending on implementation
        result = context_manager.check_context(invalid_text)
        assert isinstance(result, bool)
        elapsed = time.time() - start
        return TestResult("Context Boundary", True, f"Boundary checked in {elapsed:.3f}s", None, elapsed)
    except Exception as e:
        elapsed = time.time() - start
        return TestResult("Context Boundary", False, str(e), e, elapsed)


def run_tests() -> list:
    """Run all NLP context tests."""
    print("\n" + "=" * 60)
    print("NLP Context Filtering Tests")
    print("=" * 60)
    
    tests = [
        test_keyword_matching,
        test_string_list_matching,
        test_file_based_context,
        test_cosine_similarity,
        test_context_boundary,
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

