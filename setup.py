"""Setup script for wall_library."""

from setuptools import setup, find_packages

# Read long description from README
try:
    with open("README.md", "r", encoding="utf-8") as f:
        long_description = f.read()
except FileNotFoundError:
    long_description = ""

setup(
    name="wall-library",
    version="0.1.1",
    description="Professional LLM Validation & Context Management Library",
    long_description=long_description,
    long_description_content_type="text/markdown",
    author="Wall Library Contributors",
    author_email="",
    url="https://github.com/yourusername/wall-library",
    packages=find_packages(),
    python_requires=">=3.10,<4.0",
    install_requires=[
        "pydantic>=2.0.0,<3.0",
        "lxml>=4.9.3,<7.0.0",
        "rich>=13.6.0,<15.0.0",
        "typer>=0.9.0,<0.20",
        "click<=8.2.0",
        "tenacity>=8.1.0,<10.0.0",
        "tiktoken>=0.5.1,<1.0.0",
        "litellm>=1.37.14,<2.0.0",
        "langchain-core>=1.0.0,<2.0",
        "requests>=2.31.0,<3.0.0",
        "faker>=25.2.0,<38.0.0",
        "jsonref>=1.1.0,<2.0.0",
        "jsonschema[format-nongpl]>=4.22.0,<5.0.0",
        "opentelemetry-sdk>=1.24.0,<2.0.0",
        "opentelemetry-exporter-otlp-proto-grpc>=1.24.0,<2.0.0",
        "opentelemetry-exporter-otlp-proto-http>=1.24.0,<2.0.0",
        "pyjwt>=2.8.0,<3.0.0",
        "diff-match-patch>=20230430,<20241101",
        "semver>=3.0.2,<4.0.0",
        "sentence-transformers>=2.2.0",
        "numpy>=1.25,<2.0",
        "scikit-learn>=1.3.0",
        "python-dotenv>=1.0.0",
        "chromadb>=0.4.0",
        "rouge-score>=0.1.2",
        "nltk>=3.8.0",
    ],
    extras_require={
        "openai": ["openai>=1.30.1,<2.0.0"],
        "anthropic": ["anthropic>=0.7.2,<1.0.0"],
        "langchain": ["langchain>=0.0.300"],
        "langgraph": ["langgraph>=0.0.20"],
        "vectordb": ["faiss-cpu>=1.7.4,<2.0.0"],
        "server": ["flask>=2.0.0", "gunicorn"],
        "huggingface": ["transformers>=4.38.0,<5.0.0"],
        "llama-index": ["llama-index>=0.9.0"],
        "databricks": ["mlflow>=2.8.0"],
        "all": [
            "openai>=1.30.1,<2.0.0",
            "anthropic>=0.7.2,<1.0.0",
            "langchain>=0.0.300",
            "langgraph>=0.0.20",
            "faiss-cpu>=1.7.4,<2.0.0",
            "flask>=2.0.0",
            "gunicorn",
            "transformers>=4.38.0,<5.0.0",
            "llama-index>=0.9.0",
            "mlflow>=2.8.0",
        ],
        "dev": [
            "pytest>=7.4.3",
            "pytest-asyncio>=0.21.1",
            "pytest-cov>=2.10.1",
            "pytest-mock>=3.12.0",
            "black",
            "ruff>=0.4.1",
            "mypy",
            "pyright==1.1.334",
            "pre-commit>=2.9.3",
            "docformatter>=1.4",
            "twine>=4.0.2",
        ],
    },
    entry_points={
        "console_scripts": [
            "wall=wall_library.cli.main:cli",
        ],
    },
    classifiers=[
        "Development Status :: 3 - Alpha",
        "Intended Audience :: Developers",
        "License :: OSI Approved :: Apache Software License",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.10",
        "Programming Language :: Python :: 3.11",
        "Programming Language :: Python :: 3.12",
    ],
)

