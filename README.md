# Wall Library

<div align="center">

**Professional LLM Validation & Context Management**

[![Python 3.10+](https://img.shields.io/badge/python-3.10+-blue.svg)](https://www.python.org/downloads/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Code Style: Black](https://img.shields.io/badge/code%20style-black-000000.svg)](https://github.com/psf/black)

</div>

**Wall Library** is an enterprise-grade framework designed to act as a "firewall" for your Large Language Model (LLM) applications. It sits between your users and your LLM, ensuring safety, quality, and context compliance through advanced validation, NLP filtering, and RAG-based grounding.

---

## 🏗️ Architecture

The library operates as a multi-layered middleware, validating inputs and outputs at every stage of the LLM interaction lifecycle.

![Wall Library Architecture](docs/images/architecture.png)

1.  **Wall Guard (Input)**: Validates user queries for safety and policy compliance.
2.  **Context Manager**: Filters requests based on approved topics and domains using NLP.
3.  **RAG Retriever**: Grounds the LLM with verified knowledge from your vector database (ChromaDB).
4.  **LLM Execution**: The model generates a response based on the sanitized input and context.
5.  **Wall Guard (Output)**: Validates the generated response for structure, safety, and quality.
6.  **Scoring & Monitoring**: Tracks performance metrics (ROUGE, BLEU, Latency) and logs interactions.

---

## 🚀 Features

- **🛡️ Wall Guard**: A flexible validation engine supporting sequential validators for safety, length, and format.
- **🧠 Context Management**: Advanced NLP-based filtering to ensure responses stay within your defined domain boundaries.
- **📚 RAG Integration**: Built-in Knowledge Retrieval using ChromaDB to reduce hallucinations and ground answers.
- **✅ Structured Output**: Enforce strict output schemas (Pydantic, JSON Schema, RAIL).
- **📊 Response Scoring**: Evaluate response quality with metrics like Cosine Similarity, ROUGE, and BLEU.
- **📈 Comprehensive Monitoring**: Automatic tracking of every interaction, including latency, success rates, and validation failures.
- **👀 Visual Analytics**: Generate 3D embeddings, word clouds, and interactive dashboards to visualize your LLM's performance.
- **🔌 Framework Ready**: Seamless integration with **LangChain** and **LangGraph**.

---

## 📦 Installation

Since the library is currently in development/private, install it directly from the source or wheel.

### Basic Installation

```bash
pip install wall-library
```

### With Optional Dependencies

For specific features, install valid extras:

```bash
# For LangChain integration
pip install wall-library[langchain]

# For LangGraph integration
pip install wall-library[langgraph]

# For all optional features (recommended for dev)
pip install wall-library[all]
```

---

## ⚡ Quick Start

### 1. Basic Validation with Wall Guard

Directly validate string outputs using the `WallGuard`.

```python
from wall_library import WallGuard, OnFailAction
from wall_library.validator_base import Validator, register_validator
from wall_library.classes.validation.validation_result import PassResult, FailResult

# Define a custom validator
@register_validator("min_length")
class MinLengthValidator(Validator):
    def __init__(self, min_length: int = 10, **kwargs):
        super().__init__(require_rc=False, **kwargs)
        self.min_length = min_length
    
    def _validate(self, value, metadata):
        if len(value) < self.min_length:
            return FailResult(error_message=f"Too short: {len(value)} < {self.min_length}", metadata=metadata)
        return PassResult(metadata=metadata)

# Initialize Guard
guard = WallGuard().use(
    (MinLengthValidator, {"min_length": 10}, OnFailAction.EXCEPTION)
)

# Validate
try:
    result = guard.validate("Hello World!") # Passes
    print("Validation Passed:", result.validation_passed)
except Exception as e:
    print("Validation Failed:", e)
```

### 2. Context Filtering

Ensure your LLM stays on topic.

```python
from wall_library.nlp import ContextManager

context_manager = ContextManager()
context_manager.add_keywords(["Python", "programming", "AI"])
context_manager.add_string_list(["Machine Learning", "Data Science"])

text = "Python is a great programming language."
is_valid = context_manager.check_context(text, threshold=0.7)

print(f"Is within context: {is_valid}")
```

### 3. RAG Retrieval (ChromaDB)

Retrieve knowledge to ground your LLM responses.

```python
from wall_library.rag import ChromaDBClient, RAGRetriever

# Setup ChromaDB
client = ChromaDBClient(collection_name="knowledge_base")
client.add_qa_pairs(
    questions=["What is Wall Library?"],
    answers=["Wall Library is a professional LLM validation framework."]
)

# Retrieve
retriever = RAGRetriever(chromadb_client=client)
results = retriever.retrieve("Tell me about Wall Library", top_k=1)

print("Retrieved Context:", results[0]['document'])
```

---

## 📖 Detailed Documentation

### Wall Guard & Validators
The core of the library. You can chain multiple validators.
- **OnFailAction**: Control what happens on failure: `EXCEPTION`, `FILTER`, `REFRAIN`, `REASK`, `FIX`.
- **Validators**: Implement your own or use built-ins.

### Monitoring & Visualizations
Track your application's health.

```python
from wall_library.monitoring import LLMMonitor
from wall_library.visualization import WallVisualizer

monitor = LLMMonitor()
monitor.track_call(input_data="Query", output="Response", latency=0.2)

# Generate visualizations
viz = WallVisualizer(output_dir="visualizations")
viz.visualize_monitoring_dashboard(monitor.get_stats())
```

See the `examples/` directory for complex use-cases involving LangChain agents and full application flows.

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request
