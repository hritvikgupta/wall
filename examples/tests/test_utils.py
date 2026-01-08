"""Test utilities for Wall Library tests."""

import os
import tempfile
import json
from pathlib import Path
from typing import Dict, Any, Optional, List
from dataclasses import dataclass
from dotenv import load_dotenv

# Load environment variables
load_dotenv()


@dataclass
class TestResult:
    """Result of a test execution."""
    name: str
    passed: bool
    message: str = ""
    error: Optional[Exception] = None
    execution_time: float = 0.0


class TestData:
    """Test data generators."""

    @staticmethod
    def sample_rail_string() -> str:
        """Generate sample RAIL specification."""
        return """
        <rail version="0.1">
        <output>
            <string name="name" description="Person's name"/>
            <integer name="age" description="Person's age"/>
        </output>
        </rail>
        """

    @staticmethod
    def sample_pydantic_model():
        """Generate sample Pydantic model."""
        from pydantic import BaseModel, Field
        class Person(BaseModel):
            name: str = Field(description="Person's name")
            age: int = Field(description="Person's age", ge=0, le=150)
        return Person

    @staticmethod
    def sample_qa_pairs() -> Dict[str, List[str]]:
        """Generate sample QA pairs for RAG."""
        return {
            "questions": [
                "What is machine learning?",
                "What is Python?",
                "What is artificial intelligence?",
                "How does neural networks work?",
                "What is deep learning?",
            ],
            "answers": [
                "Machine learning is a subset of AI that enables systems to learn from data.",
                "Python is a high-level programming language known for its simplicity.",
                "Artificial intelligence is the simulation of human intelligence by machines.",
                "Neural networks are computing systems inspired by biological neural networks.",
                "Deep learning is a subset of ML using neural networks with multiple layers.",
            ],
        }

    @staticmethod
    def sample_documents() -> List[str]:
        """Generate sample documents for context filtering."""
        return [
            "Python is a versatile programming language used for web development.",
            "Machine learning involves training models on data to make predictions.",
            "Artificial intelligence enables machines to perform intelligent tasks.",
            "Deep learning uses neural networks with multiple hidden layers.",
            "Natural language processing helps computers understand human language.",
        ]

    @staticmethod
    def sample_keywords() -> List[str]:
        """Generate sample keywords."""
        return ["Python", "machine learning", "AI", "programming", "neural networks"]

    @staticmethod
    def mock_llm_response(prompt: str) -> str:
        """Generate mock LLM response."""
        # Simple mock responses based on prompt content
        if "pet" in prompt.lower():
            return '{"pet_type": "dog", "name": "Buddy"}'
        elif "name" in prompt.lower() and "age" in prompt.lower():
            return '{"name": "John", "age": 30}'
        else:
            return "This is a mock response."

    @staticmethod
    def create_temp_file(content: str, suffix: str = ".txt") -> str:
        """Create a temporary file with content."""
        fd, path = tempfile.mkstemp(suffix=suffix)
        with os.fdopen(fd, "w") as f:
            f.write(content)
        return path

    @staticmethod
    def cleanup_temp_file(path: str):
        """Clean up temporary file."""
        try:
            os.unlink(path)
        except Exception:
            pass


def cleanup_temp_file(path: str):
    """Clean up temporary file (module-level function)."""
    TestData.cleanup_temp_file(path)


def get_openai_api_key() -> Optional[str]:
    """Get OpenAI API key from environment."""
    return os.getenv("OPENAI_API_KEY")


def check_optional_dependency(module_name: str) -> bool:
    """Check if optional dependency is available."""
    try:
        __import__(module_name)
        return True
    except ImportError:
        return False


def create_temp_rail_file() -> str:
    """Create temporary RAIL file."""
    return TestData.create_temp_file(TestData.sample_rail_string(), suffix=".rail")


def create_temp_document_file() -> str:
    """Create temporary document file."""
    content = "\n".join(TestData.sample_documents())
    return TestData.create_temp_file(content, suffix=".txt")


def cleanup_temp_file(path: str):
    """Clean up temporary file (module-level function)."""
    TestData.cleanup_temp_file(path)

