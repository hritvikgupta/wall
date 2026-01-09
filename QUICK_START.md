# Quick Start Guide

## Installation

### Local Development Installation

Since the library isn't published to PyPI yet, install it locally:

```bash
# Navigate to the library directory
cd wall-library

# Install in editable mode
pip3 install -e .
```

Or if you encounter issues, use PYTHONPATH:

```bash
export PYTHONPATH=/path/to/wall-library:$PYTHONPATH
```

### After Publishing to PyPI

Once published, users can install with:

```bash
# Basic installation (includes all core features)
pip install wall-library

# With all optional features
pip install wall-library[all]
```

## Quick Usage Examples

### 1. Basic Validation

```python
from wall_library import WallGuard, OnFailAction
from wall_library.validator_base import Validator, register_validator
from wall_library.classes.validation.validation_result import PassResult, FailResult

# Create a custom validator
@register_validator("min_length")
class MinLengthValidator(Validator):
    def __init__(self, min_length: int = 10, **kwargs):
        super().__init__(require_rc=False, **kwargs)
        self.min_length = min_length
    
    def _validate(self, value, metadata):
        if len(value) < self.min_length:
            return FailResult(error_message=f"Too short: {len(value)} < {self.min_length}", metadata=metadata)
        return PassResult(metadata=metadata)

# Use the guard
guard = WallGuard().use(
    (MinLengthValidator, {"min_length": 10, "require_rc": False}, OnFailAction.EXCEPTION)
)

result = guard.validate("Hello World!")  # ✅ Passes
print(result.validation_passed)  # True
```

### 2. NLP Context Filtering

```python
from wall_library.nlp import ContextManager

context_manager = ContextManager()
context_manager.add_keywords(["Python", "programming", "AI"])

text = "Python is a great programming language"
is_valid = context_manager.check_context(text)
print(f"Within context: {is_valid}")  # True
```

### 3. RAG with ChromaDB

```python
from wall_library.rag import ChromaDBClient, RAGRetriever

# Create ChromaDB client
client = ChromaDBClient(collection_name="my_collection")

# Add QA pairs
client.add_qa_pairs(
    questions=["What is machine learning?"],
    answers=["Machine learning is a subset of AI"],
)

# Create RAG retriever
retriever = RAGRetriever(chromadb_client=client, top_k=5)

# Retrieve relevant information
results = retriever.retrieve("What is AI?", top_k=3)
print(f"Retrieved {len(results)} results")
```

### 4. Scoring LLM Responses

```python
from wall_library.scoring import ResponseScorer

scorer = ResponseScorer(threshold=0.7)
response = "The cat sat on the mat"
expected = "A cat was sitting on a mat"

scores = scorer.score(response, expected)
aggregated = scorer.aggregate_score(scores)

print(f"Scores: {scores}")
print(f"Aggregated: {aggregated}")
```

### 5. Monitoring

```python
from wall_library.monitoring import LLMMonitor

monitor = LLMMonitor()
monitor.track_call(
    input_data="What is Python?",
    output="Python is a programming language",
    metadata={"model": "gpt-3.5-turbo"},
    latency=0.5,
)

stats = monitor.get_stats()
print(f"Total interactions: {stats['total_interactions']}")
```

### 6. Structured Output with Pydantic

```python
from wall_library import WallGuard
from pydantic import BaseModel, Field

class Person(BaseModel):
    name: str = Field(description="Person's name")
    age: int = Field(description="Person's age", ge=0, le=150)

# Create guard from Pydantic model
guard = WallGuard()
from wall_library.schema.pydantic_schema import pydantic_model_to_schema
from wall_library.classes.schema.processed_schema import ProcessedSchema

schema = pydantic_model_to_schema(Person)
guard.processed_schema = ProcessedSchema(schema=schema)

# Validate structured output
json_output = '{"name": "John", "age": 30}'
result = guard.validate(json_output)
print(result.validation_passed)  # True
```

### 7. Running Tests

```bash
# Run comprehensive test suite
python3 examples/comprehensive_test.py

# Run individual test modules
python3 examples/tests/test_core_guard.py
python3 examples/tests/test_rag.py
```

## Environment Variables

Create a `.env` file in your project root:

```env
OPENAI_API_KEY=your_openai_api_key_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here
WALL_ENABLE_METRICS=true
```

The library automatically loads these using python-dotenv.

## Next Steps

- See [README.md](README.md) for full feature list
- See [INSTALLATION.md](INSTALLATION.md) for detailed installation instructions
- Check `examples/` directory for more usage examples
- Run `python3 examples/comprehensive_test.py` to verify everything works


