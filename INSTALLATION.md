# Installation Guide

## Basic Installation

Install the core library with all essential features:

```bash
pip install wall-library
```

This automatically installs:
- ✅ Core Guard features
- ✅ Validators and OnFailActions
- ✅ Schema systems (Pydantic, RAIL, JSON)
- ✅ NLP context filtering (scikit-learn, sentence-transformers)
- ✅ RAG with ChromaDB (chromadb, rouge-score, nltk)
- ✅ Scoring metrics (ROUGE, BLEU, cosine similarity)
- ✅ Monitoring (OpenTelemetry)
- ✅ Streaming and Async support
- ✅ CLI tools
- ✅ Server (Flask)
- ✅ Environment variable support (python-dotenv)

## Optional Dependencies

For additional features, install specific extras:

```bash
# OpenAI integration
pip install wall-library[openai]

# Anthropic/Claude integration
pip install wall-library[anthropic]

# LangChain integration
pip install wall-library[langchain]

# LangGraph integration
pip install wall-library[langgraph]

# FAISS vector database (alternative to ChromaDB)
pip install wall-library[vectordb]

# Hugging Face transformers
pip install wall-library[huggingface]

# LlamaIndex integration
pip install wall-library[llama-index]

# Databricks MLflow integration
pip install wall-library[databricks]
```

## Install Everything

To install the library with all optional dependencies:

```bash
pip install wall-library[all]
```

This includes:
- All LLM providers (OpenAI, Anthropic)
- All framework integrations (LangChain, LangGraph, LlamaIndex)
- All vector databases (FAISS)
- All ML integrations (MLflow, Hugging Face)

## Development Installation

For development with all testing tools:

```bash
pip install wall-library[dev]
```

## Verification

After installation, verify everything works:

```bash
python3 examples/comprehensive_test.py
```

Expected output: ✅ ALL TESTS PASSED!

## Troubleshooting

### Missing Dependencies

If you see import errors, ensure all dependencies are installed:

```bash
pip install -r requirements.txt  # If provided
# Or reinstall with all extras
pip install --upgrade wall-library[all]
```

### NLTK Data

NLTK requires additional data downloads. The library handles this automatically, but if you encounter issues:

```python
import nltk
nltk.download('punkt')
nltk.download('wordnet')
```

### ChromaDB

ChromaDB is included by default. If you have issues:

```bash
pip install --upgrade chromadb
```

### Sentence Transformers

If embeddings fail, ensure sentence-transformers is properly installed:

```bash
pip install --upgrade sentence-transformers
```

## Docker Installation

Create a `Dockerfile`:

```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies if needed
RUN apt-get update && apt-get install -y \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Install wall-library with all features
RUN pip install --no-cache-dir wall-library[all]

# Copy your application
COPY . .

CMD ["python", "your_app.py"]
```

## Environment Variables

Create a `.env` file in your project root:

```env
OPENAI_API_KEY=your_openai_api_key_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here
WALL_ENABLE_METRICS=true
```

The library automatically loads these using python-dotenv.


