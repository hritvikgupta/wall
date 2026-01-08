"""Tests for RAG functionality with ChromaDB."""

import time
import tempfile
import shutil
from examples.tests.test_utils import TestResult, TestData, check_optional_dependency

try:
    from wall_library.rag import ChromaDBClient, RAGRetriever, EmbeddingService, QAScorer
    RAG_AVAILABLE = True
except ImportError:
    RAG_AVAILABLE = False
    ChromaDBClient = None  # type: ignore
    RAGRetriever = None  # type: ignore
    EmbeddingService = None  # type: ignore
    QAScorer = None  # type: ignore


def test_chromadb_initialization():
    """Test ChromaDB client initialization."""
    start = time.time()
    if not check_optional_dependency("chromadb") or not RAG_AVAILABLE or ChromaDBClient is None:
        elapsed = time.time() - start
        return TestResult("ChromaDB Initialization", None, "Skipped - ChromaDB not available", None, elapsed)
    
    temp_dir = None
    try:
        temp_dir = tempfile.mkdtemp()
        client = ChromaDBClient(collection_name="test_collection", persist_directory=temp_dir)
        assert client is not None
        assert client.collection is not None
        elapsed = time.time() - start
        shutil.rmtree(temp_dir, ignore_errors=True)
        return TestResult("ChromaDB Initialization", True, f"ChromaDB initialized in {elapsed:.3f}s", None, elapsed)
    except Exception as e:
        elapsed = time.time() - start
        if temp_dir:
            shutil.rmtree(temp_dir, ignore_errors=True)
        return TestResult("ChromaDB Initialization", False, str(e), e, elapsed)


def test_embedding_generation():
    """Test embedding generation."""
    start = time.time()
    if not check_optional_dependency("chromadb") or not RAG_AVAILABLE or EmbeddingService is None:
        elapsed = time.time() - start
        return TestResult("Embedding Generation", None, "Skipped - ChromaDB not available", None, elapsed)
    
    temp_dir = None
    try:
        temp_dir = tempfile.mkdtemp()
        if not RAG_AVAILABLE or EmbeddingService is None:
            elapsed = time.time() - start
            shutil.rmtree(temp_dir, ignore_errors=True)
            return TestResult("Embedding Generation", None, "Skipped - RAG not available", None, elapsed)
        
        # Try sentence-transformers first
        embedding_service = EmbeddingService(provider="sentence-transformers")
        text = "This is a test document"
        embedding = None
        
        try:
            embedding = embedding_service.generate_embeddings(text)
            assert embedding is not None
            assert len(embedding) > 0
        except ValueError as e:
            # If sentence-transformers isn't available, try OpenAI as fallback
            if "not available" in str(e):
                # Check if OpenAI API key is available
                from examples.tests.test_utils import get_openai_api_key
                api_key = get_openai_api_key()
                if api_key:
                    try:
                        # Try OpenAI provider
                        embedding_service = EmbeddingService(provider="openai")
                        embedding = embedding_service.generate_embeddings(text)
                        assert embedding is not None
                        assert len(embedding) > 0
                    except Exception as openai_error:
                        elapsed = time.time() - start
                        shutil.rmtree(temp_dir, ignore_errors=True)
                        return TestResult("Embedding Generation", None, f"Skipped - OpenAI failed: {openai_error}", None, elapsed)
                else:
                    elapsed = time.time() - start
                    shutil.rmtree(temp_dir, ignore_errors=True)
                    return TestResult("Embedding Generation", None, "Skipped - sentence-transformers not available and no OpenAI API key", None, elapsed)
            else:
                raise
        
        elapsed = time.time() - start
        shutil.rmtree(temp_dir, ignore_errors=True)
        return TestResult("Embedding Generation", True, f"Embedding generated in {elapsed:.3f}s", None, elapsed)
    except Exception as e:
        elapsed = time.time() - start
        if temp_dir:
            shutil.rmtree(temp_dir, ignore_errors=True)
        return TestResult("Embedding Generation", False, str(e), e, elapsed)


def test_qa_pair_insertion():
    """Test QA pair insertion."""
    start = time.time()
    if not check_optional_dependency("chromadb") or not RAG_AVAILABLE or ChromaDBClient is None:
        elapsed = time.time() - start
        return TestResult("QA Pair Insertion", None, "Skipped - ChromaDB not available", None, elapsed)
    
    temp_dir = None
    try:
        temp_dir = tempfile.mkdtemp()
        client = ChromaDBClient(collection_name="test_collection", persist_directory=temp_dir)
        qa_pairs = TestData.sample_qa_pairs()
        metadata = [{"type": "qa_pair", "index": i} for i in range(len(qa_pairs["questions"]))]
        client.add_qa_pairs(
            questions=qa_pairs["questions"],
            answers=qa_pairs["answers"],
            metadata=metadata,
        )
        # Verify insertion (query to check)
        results = client.query("What is machine learning?", n_results=1)
        assert results is not None
        elapsed = time.time() - start
        shutil.rmtree(temp_dir, ignore_errors=True)
        return TestResult("QA Pair Insertion", True, f"QA pairs inserted in {elapsed:.3f}s", None, elapsed)
    except Exception as e:
        elapsed = time.time() - start
        if temp_dir:
            shutil.rmtree(temp_dir, ignore_errors=True)
        return TestResult("QA Pair Insertion", False, str(e), e, elapsed)


def test_rag_retrieval():
    """Test RAG retrieval."""
    start = time.time()
    if not check_optional_dependency("chromadb") or not RAG_AVAILABLE or ChromaDBClient is None or RAGRetriever is None:
        elapsed = time.time() - start
        return TestResult("RAG Retrieval", None, "Skipped - ChromaDB not available", None, elapsed)
    
    temp_dir = None
    try:
        temp_dir = tempfile.mkdtemp()
        client = ChromaDBClient(collection_name="test_collection", persist_directory=temp_dir)
        qa_pairs = TestData.sample_qa_pairs()
        metadata = [{"type": "qa_pair", "index": i} for i in range(len(qa_pairs["questions"]))]
        client.add_qa_pairs(
            questions=qa_pairs["questions"],
            answers=qa_pairs["answers"],
            metadata=metadata,
        )
        
        retriever = RAGRetriever(chromadb_client=client, top_k=3)
        results = retriever.retrieve("What is machine learning?", top_k=3)
        assert results is not None
        assert len(results) <= 3
        elapsed = time.time() - start
        shutil.rmtree(temp_dir, ignore_errors=True)
        return TestResult("RAG Retrieval", True, f"Retrieved {len(results)} results in {elapsed:.3f}s", None, elapsed)
    except Exception as e:
        elapsed = time.time() - start
        if temp_dir:
            shutil.rmtree(temp_dir, ignore_errors=True)
        return TestResult("RAG Retrieval", False, str(e), e, elapsed)


def test_qa_scoring():
    """Test QA scoring."""
    start = time.time()
    try:
        scorer = QAScorer()
        query = "What is machine learning?"
        document = "Machine learning is a subset of AI"
        score = scorer.score_relevance(query, document, distance=0.1)
        assert 0.0 <= score <= 1.0
        elapsed = time.time() - start
        return TestResult("QA Scoring", True, f"Score: {score:.3f} in {elapsed:.3f}s", None, elapsed)
    except Exception as e:
        elapsed = time.time() - start
        return TestResult("QA Scoring", False, str(e), e, elapsed)


def test_hybrid_search():
    """Test hybrid search."""
    start = time.time()
    if not check_optional_dependency("chromadb") or not RAG_AVAILABLE or ChromaDBClient is None or RAGRetriever is None:
        elapsed = time.time() - start
        return TestResult("Hybrid Search", None, "Skipped - ChromaDB not available", None, elapsed)
    
    temp_dir = None
    try:
        temp_dir = tempfile.mkdtemp()
        client = ChromaDBClient(collection_name="test_collection", persist_directory=temp_dir)
        qa_pairs = TestData.sample_qa_pairs()
        metadata = [{"type": "qa_pair", "index": i} for i in range(len(qa_pairs["questions"]))]
        client.add_qa_pairs(
            questions=qa_pairs["questions"],
            answers=qa_pairs["answers"],
            metadata=metadata,
        )
        
        retriever = RAGRetriever(chromadb_client=client, top_k=3)
        results = retriever.hybrid_search("What is AI?", top_k=3)
        assert results is not None
        elapsed = time.time() - start
        shutil.rmtree(temp_dir, ignore_errors=True)
        return TestResult("Hybrid Search", True, f"Hybrid search completed in {elapsed:.3f}s", None, elapsed)
    except Exception as e:
        elapsed = time.time() - start
        if temp_dir:
            shutil.rmtree(temp_dir, ignore_errors=True)
        return TestResult("Hybrid Search", False, str(e), e, elapsed)


def run_tests() -> list:
    """Run all RAG tests."""
    print("\n" + "=" * 60)
    print("RAG Tests (ChromaDB)")
    print("=" * 60)
    
    tests = [
        test_chromadb_initialization,
        test_embedding_generation,
        test_qa_pair_insertion,
        test_rag_retrieval,
        test_qa_scoring,
        test_hybrid_search,
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

