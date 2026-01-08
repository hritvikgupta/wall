"""Tests for scoring metrics."""

import time
from examples.tests.test_utils import TestResult, check_optional_dependency
from wall_library.scoring import ResponseScorer
from wall_library.scoring.metrics import (
    CosineSimilarityMetric,
    SemanticSimilarityMetric,
    ROUGEMetric,
    BLEUMetric,
)


def test_cosine_similarity():
    """Test cosine similarity metric."""
    start = time.time()
    try:
        metric = CosineSimilarityMetric()
        response = "This is a test response"
        expected = "This is a test response"
        score = metric.compute(response, expected)
        assert 0.0 <= score <= 1.0
        assert score > 0.9  # Should be high for identical strings
        elapsed = time.time() - start
        return TestResult("Cosine Similarity", True, f"Score: {score:.3f} in {elapsed:.3f}s", None, elapsed)
    except Exception as e:
        elapsed = time.time() - start
        return TestResult("Cosine Similarity", False, str(e), e, elapsed)


def test_semantic_similarity():
    """Test semantic similarity metric."""
    start = time.time()
    try:
        metric = SemanticSimilarityMetric()
        response = "The cat sat on the mat"
        expected = "A cat was sitting on a mat"
        score = metric.compute(response, expected)
        assert 0.0 <= score <= 1.0
        elapsed = time.time() - start
        return TestResult("Semantic Similarity", True, f"Score: {score:.3f} in {elapsed:.3f}s", None, elapsed)
    except Exception as e:
        elapsed = time.time() - start
        return TestResult("Semantic Similarity", False, str(e), e, elapsed)


def test_rouge_score():
    """Test ROUGE score metric."""
    start = time.time()
    if not check_optional_dependency("rouge_score"):
        elapsed = time.time() - start
        return TestResult("ROUGE Score", None, "Skipped - rouge_score not available", None, elapsed)
    
    try:
        metric = ROUGEMetric()
        response = "The cat sat on the mat"
        expected = "A cat was sitting on a mat"
        score = metric.compute(response, expected)
        assert 0.0 <= score <= 1.0
        elapsed = time.time() - start
        return TestResult("ROUGE Score", True, f"Score: {score:.3f} in {elapsed:.3f}s", None, elapsed)
    except Exception as e:
        elapsed = time.time() - start
        return TestResult("ROUGE Score", False, str(e), e, elapsed)


def test_bleu_score():
    """Test BLEU score metric."""
    start = time.time()
    if not check_optional_dependency("nltk"):
        elapsed = time.time() - start
        return TestResult("BLEU Score", None, "Skipped - nltk not available", None, elapsed)
    
    try:
        metric = BLEUMetric()
        response = "The cat sat on the mat"
        expected = "A cat was sitting on a mat"
        score = metric.compute(response, expected)
        assert 0.0 <= score <= 1.0
        elapsed = time.time() - start
        return TestResult("BLEU Score", True, f"Score: {score:.3f} in {elapsed:.3f}s", None, elapsed)
    except Exception as e:
        elapsed = time.time() - start
        return TestResult("BLEU Score", False, str(e), e, elapsed)


def test_response_scorer():
    """Test response scorer aggregation."""
    start = time.time()
    try:
        scorer = ResponseScorer(threshold=0.7)
        response = "The cat sat on the mat"
        expected = "A cat was sitting on a mat"
        scores = scorer.score(response, expected)
        assert isinstance(scores, dict)
        assert len(scores) > 0
        
        # Test aggregation
        aggregated = scorer.aggregate_score(scores)
        assert 0.0 <= aggregated <= 1.0
        elapsed = time.time() - start
        return TestResult("Response Scorer", True, f"Aggregated score: {aggregated:.3f} in {elapsed:.3f}s", None, elapsed)
    except Exception as e:
        elapsed = time.time() - start
        return TestResult("Response Scorer", False, str(e), e, elapsed)


def run_tests() -> list:
    """Run all scoring tests."""
    print("\n" + "=" * 60)
    print("Scoring Tests")
    print("=" * 60)
    
    tests = [
        test_cosine_similarity,
        test_semantic_similarity,
        test_rouge_score,
        test_bleu_score,
        test_response_scorer,
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

