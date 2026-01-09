# Wall Library - Complete Feature List

This document provides a comprehensive list of ALL features available in Wall Library with detailed descriptions.

---

## 📋 Table of Contents

1. [Core Validation Features](#1-core-validation-features)
2. [NLP & Context Management](#2-nlp--context-management)
3. [RAG & Knowledge Retrieval](#3-rag--knowledge-retrieval)
4. [Scoring & Quality Metrics](#4-scoring--quality-metrics)
5. [Monitoring & Analytics](#5-monitoring--analytics)
6. [Logging System](#6-logging-system)
7. [Visualization](#7-visualization)
8. [Schema Systems](#8-schema-systems)
9. [Framework Integrations](#9-framework-integrations)
10. [Execution Modes](#10-execution-modes)
11. [Infrastructure & Tools](#11-infrastructure--tools)
12. [Advanced Features](#12-advanced-features)

---

## 1. Core Validation Features

### 1.1 Wall Guard
**Description**: Main validation engine that chains multiple validators together to validate LLM inputs and outputs.

**Features**:
- Sequential validator execution
- Input and output validation
- Integration with LLM APIs
- Re-asking mechanism
- Configurable execution options
- Logger integration
- Tracer support for telemetry

**Use Cases**: Primary validation layer for all LLM interactions

---

### 1.2 Async Guard
**Description**: Asynchronous version of Wall Guard for async/await workflows.

**Features**:
- Async validation methods
- Async LLM API integration
- Async runner support
- Non-blocking validation

**Use Cases**: Async web applications, concurrent processing

---

### 1.3 Validators
**Description**: Reusable validation rules that check LLM responses against specific criteria.

**Features**:
- Custom validator creation via `@register_validator`
- Validator registry system
- Metadata support
- Error message customization
- Pass/Fail result system

**Types of Validators**:
- Safety validators (block dangerous content)
- Quality validators (length, format, completeness)
- Schema validators (structure validation)
- Custom validators (your own logic)

**Use Cases**: Safety checks, quality assurance, format validation

---

### 1.4 OnFailActions
**Description**: Defines what happens when validation fails.

**Available Actions**:
- **EXCEPTION**: Raise error immediately (strictest)
- **FILTER**: Remove invalid content from response
- **REFRAIN**: Return empty/default response
- **REASK**: Re-ask LLM to generate new response (with retries)
- **FIX**: Attempt to programmatically fix invalid content
- **FIX_REASK**: Try to fix first, then reask if fix fails
- **NOOP**: Pass through invalid content (no validation)
- **CUSTOM**: Custom failure handling logic

**Use Cases**: Different failure handling strategies based on use case

---

### 1.5 Re-asking Mechanism
**Description**: Automatic retry system that re-asks LLM when validation fails.

**Features**:
- Configurable number of retries (`num_reasks`)
- Exponential backoff between retries
- Feedback injection to LLM
- Retry tracking and logging

**Use Cases**: Improving response quality through automatic retries

---

### 1.6 Validation Outcome
**Description**: Result object returned from validation operations.

**Contains**:
- `validated_output`: Validated response (None if failed)
- `raw_output`: Original unvalidated response
- `validation_passed`: Boolean pass/fail status
- `error_spans`: Locations of errors in text
- `metadata`: Additional validation information

**Use Cases**: Accessing validation results and error details

---

## 2. NLP & Context Management

### 2.1 Context Manager
**Description**: Ensures LLM responses stay within approved context boundaries using NLP.

**Features**:
- Keyword-based matching
- Semantic similarity checking (cosine similarity)
- Context boundary definition
- File-based context loading (txt, json, csv)
- Threshold-based filtering

**Components**:
- KeywordMatcher: Exact/fuzzy keyword matching
- SimilarityEngine: Embedding-based similarity

**Use Cases**: Domain restriction (healthcare, legal, finance), topic filtering

---

### 2.2 Keyword Matcher
**Description**: Matches keywords in text using exact or fuzzy matching.

**Features**:
- Exact keyword matching
- Case-insensitive matching
- Multiple keyword support
- Fast lookup

**Use Cases**: Quick context filtering, restricted term detection

---

### 2.3 Similarity Engine
**Description**: Computes semantic similarity between texts using embeddings.

**Features**:
- Cosine similarity calculation
- Embedding generation (sentence-transformers)
- Batch processing support
- Configurable similarity thresholds

**Use Cases**: Semantic context checking, topic similarity

---

## 3. RAG & Knowledge Retrieval

### 3.1 RAG Retriever
**Description**: Retrieves relevant knowledge from vector database to ground LLM responses.

**Features**:
- Vector similarity search
- Top-k retrieval
- Relevance scoring
- Metadata filtering
- Hybrid search (vector + keyword)

**Use Cases**: Knowledge-grounded responses, reducing hallucinations

---

### 3.2 ChromaDB Client
**Description**: Client for ChromaDB vector database operations.

**Features**:
- Collection management
- Document storage with embeddings
- Q&A pair storage
- Query interface
- Persistence support
- Metadata management

**Use Cases**: Vector database operations, knowledge base storage

---

### 3.3 Embedding Service
**Description**: Generates embeddings for text using various providers.

**Supported Providers**:
- sentence-transformers (local, free)
- OpenAI (requires API key, high quality)

**Features**:
- Multiple provider support
- Batch embedding generation
- Automatic provider fallback
- Embedding dimension management

**Use Cases**: Text embedding generation for RAG, similarity calculations

---

### 3.4 QA Scorer
**Description**: Scores relevance of retrieved Q&A pairs.

**Features**:
- Relevance scoring
- Distance-based scoring
- Contextual alignment scoring
- Query-answer similarity

**Use Cases**: Ranking retrieved contexts, quality assessment

---

### 3.5 FAISS Vector Database
**Description**: Alternative vector database to ChromaDB using FAISS.

**Features**:
- Fast similarity search
- In-memory or disk-based storage
- Configurable dimensions
- Batch operations

**Use Cases**: High-performance vector search, alternative to ChromaDB

---

### 3.6 Document Store
**Description**: Simple document storage and search system.

**Features**:
- Document storage with metadata
- Text search
- Metadata filtering
- Top-k retrieval

**Use Cases**: Simple knowledge base, document management

---

## 4. Scoring & Quality Metrics

### 4.1 Response Scorer
**Description**: Evaluates LLM responses against expected outputs using multiple metrics.

**Features**:
- Multiple metric support
- Aggregated scoring
- Weighted scoring
- Threshold-based pass/fail
- Custom metrics

**Use Cases**: Quality assessment, performance evaluation

---

### 4.2 Scoring Metrics

#### 4.2.1 Cosine Similarity Metric
**Description**: Measures vector cosine similarity between response and expected output.

**Use Cases**: Semantic similarity measurement

#### 4.2.2 Semantic Similarity Metric
**Description**: Measures semantic meaning similarity using embeddings.

**Use Cases**: Meaning-based quality assessment

#### 4.2.3 ROUGE Metric
**Description**: Recall-Oriented Understudy for Gisting Evaluation - measures n-gram overlap.

**Types**: ROUGE-1, ROUGE-2, ROUGE-L

**Use Cases**: Summarization quality, content overlap

#### 4.2.4 BLEU Metric
**Description**: Bilingual Evaluation Understudy - measures precision of n-grams.

**Use Cases**: Translation quality, precision measurement

#### 4.2.5 Custom Metric
**Description**: Define your own scoring function.

**Use Cases**: Domain-specific quality metrics

---

## 5. Monitoring & Analytics

### 5.1 LLM Monitor
**Description**: Tracks all LLM interactions for monitoring and analytics.

**Features**:
- Interaction tracking (input, output, latency)
- Success/failure tracking
- Latency monitoring
- Metadata collection
- Statistics API
- OpenTelemetry integration

**Use Cases**: Production monitoring, performance analysis, debugging

---

### 5.2 Metrics Collector
**Description**: Collects and aggregates performance metrics.

**Features**:
- Latency tracking
- Success rate calculation
- Error rate tracking
- Custom metrics
- Statistical aggregation

**Use Cases**: Performance monitoring, analytics

---

### 5.3 Telemetry
**Description**: OpenTelemetry integration for distributed tracing.

**Features**:
- Trace export
- Span creation
- Context propagation
- OTLP export (gRPC/HTTP)

**Use Cases**: Distributed system observability, tracing

---

## 6. Logging System

### 6.1 Wall Logger
**Description**: Comprehensive logging system for all Wall Library operations.

**Features**:
- Multiple log scopes (VALIDATION, RAG, SCORING, LLM_CALLS, MONITORING, ALL)
- Multiple outputs (file, console, both)
- Multiple formats (JSON, human-readable, both)
- Automatic logging of operations
- Configurable log levels

**Log Scopes**:
- `VALIDATION`: Log all validation operations
- `RAG`: Log RAG retrievals
- `SCORING`: Log scoring operations
- `LLM_CALLS`: Log LLM interactions
- `MONITORING`: Log monitoring events
- `ALL`: Log everything

**Use Cases**: Debugging, auditing, compliance, analytics

---

### 6.2 Log Formatters
**Description**: Format log messages in different styles.

**Formats**:
- JSON format (structured)
- Human-readable format
- Both formats

**Use Cases**: Log parsing, readability, integration with log aggregators

---

### 6.3 Log Handlers
**Description**: Handle log output destinations.

**Handlers**:
- File handler
- Console handler
- Both handlers

**Use Cases**: Log storage, real-time monitoring

---

## 7. Visualization

### 7.1 Wall Visualizer
**Description**: Comprehensive visualization tools for Wall Library operations.

**Features**:
- Score visualizations (bar charts)
- Context boundary analysis (pie charts, similarity distributions)
- Keyword analysis (frequency charts)
- Word clouds
- 3D embedding visualization (interactive Plotly)
- 3D score visualization (multi-metric 3D plots)
- Validation results timeline
- RAG retrieval analysis
- Monitoring dashboards

**Visualization Types**:
1. **Score Visualization**: Bar charts with color coding
2. **Context Boundaries**: Inside/outside wall analysis
3. **Keywords**: Frequency and distribution charts
4. **Word Clouds**: Text visualization
5. **3D Embeddings**: Interactive 3D scatter plots (IMPORTANT)
6. **3D Scores**: Multi-metric 3D visualization (IMPORTANT)
7. **Validation Results**: Timeline and performance charts
8. **RAG Retrieval**: Score and distance distributions
9. **Monitoring Dashboard**: Comprehensive analytics dashboard

**Use Cases**: Data analysis, presentation, debugging, reporting

---

## 8. Schema Systems

### 8.1 Pydantic Schema
**Description**: Structured output validation using Pydantic models.

**Features**:
- Automatic JSON schema generation
- Type validation
- Field validation
- Nested models
- Optional fields

**Use Cases**: Structured data extraction, API responses

---

### 8.2 RAIL Schema
**Description**: XML-based schema definition for structured outputs.

**Features**:
- RAIL string parsing
- Field definitions with validators
- On-fail actions per field
- Prompt integration

**Use Cases**: Complex structured outputs, XML-based schemas

---

### 8.3 JSON Schema
**Description**: Standard JSON schema validation.

**Features**:
- JSON Schema validation
- Type checking
- Format validation
- Required field validation

**Use Cases**: API validation, JSON structure validation

---

### 8.4 Schema Generator
**Description**: Generates schemas from various formats.

**Features**:
- Pydantic to JSON Schema
- RAIL to JSON Schema
- Schema transformation

**Use Cases**: Schema conversion, format transformation

---

## 9. Framework Integrations

### 9.1 LangChain Wrapper
**Description**: Integrates Wall Library guards with LangChain.

**Features**:
- Guard to Runnable conversion
- LangChain chain integration
- Agent integration
- Tool integration
- Sequential execution support

**Use Cases**: Using guards in LangChain workflows, chains, agents

---

### 9.2 LangGraph Wrapper
**Description**: Integrates Wall Library guards with LangGraph.

**Features**:
- Node creation with guard validation
- State management
- Graph integration

**Use Cases**: LangGraph workflows with validation

---

### 9.3 LlamaIndex Integration
**Description**: Integrates with LlamaIndex framework.

**Features**:
- Guardrails chat engine
- Guardrails query engine
- Index integration

**Use Cases**: LlamaIndex-based applications

---

### 9.4 Databricks MLflow Integration
**Description**: Integrates with Databricks MLflow.

**Features**:
- MLflow instrumentation
- Experiment tracking
- Model logging

**Use Cases**: MLflow-based ML workflows

---

## 10. Execution Modes

### 10.1 Runner (Synchronous)
**Description**: Synchronous LLM execution with validation.

**Features**:
- Blocking execution
- Validation integration
- Error handling

**Use Cases**: Synchronous applications, simple workflows

---

### 10.2 Async Runner
**Description**: Asynchronous LLM execution with validation.

**Features**:
- Non-blocking execution
- Async/await support
- Concurrent processing

**Use Cases**: Async web applications, concurrent requests

---

### 10.3 Stream Runner
**Description**: Streaming LLM execution with chunk-by-chunk validation.

**Features**:
- Streaming response handling
- Chunk validation
- Real-time processing

**Use Cases**: Streaming applications, real-time responses

---

### 10.4 Async Stream Runner
**Description**: Asynchronous streaming LLM execution.

**Features**:
- Async streaming
- Non-blocking chunks
- Concurrent streaming

**Use Cases**: Async streaming applications

---

## 11. Infrastructure & Tools

### 11.1 CLI Tools
**Description**: Command-line interface for Wall Library operations.

**Commands**:
- `wall configure`: Configure settings
- `wall create`: Create guards/schemas
- `wall hub`: Hub operations
- `wall server`: Server management

**Use Cases**: Command-line operations, automation, setup

---

### 11.2 Server (Flask REST API)
**Description**: REST API server for remote guard execution.

**Features**:
- Flask-based REST API
- Guard registration
- Remote validation endpoints
- Health checks
- Configuration management

**Endpoints**:
- `POST /guards/{guard_name}/validate`: Validate text
- `GET /guards`: List guards
- `GET /health`: Health check

**Use Cases**: Microservices, remote validation, API services

---

### 11.3 API Client
**Description**: Client for remote guard execution via API.

**Features**:
- Remote validation calls
- Error handling
- Response parsing

**Use Cases**: Client applications, distributed systems

---

### 11.4 Hub Integration
**Description**: Integration with validator hub for sharing validators.

**Features**:
- Validator discovery
- Validator installation
- Hub token management
- Telemetry

**Use Cases**: Validator sharing, community validators

---

### 11.5 Settings Management
**Description**: Configuration and settings management.

**Features**:
- Environment variable support
- Configuration files
- Default settings
- Settings override

**Use Cases**: Configuration management, environment-specific settings

---

## 12. Advanced Features

### 12.1 Prompt System
**Description**: Structured prompt management.

**Components**:
- **Instructions**: System-level instructions (AI behavior)
- **Messages**: Conversation history (system, user, assistant)
- **Prompt**: Combines instructions and messages

**Use Cases**: Consistent prompt management, conversation handling

---

### 12.2 History Tracking
**Description**: Tracks LLM interaction history.

**Features**:
- Call history
- Input/output tracking
- Iteration tracking
- Metadata storage

**Use Cases**: Conversation history, debugging, analytics

---

### 12.3 Call Tracing
**Description**: Traces guard execution for debugging.

**Features**:
- Execution tracing
- Step-by-step tracking
- Performance profiling

**Use Cases**: Debugging, performance analysis

---

### 12.4 Formatters
**Description**: Format validation outputs.

**Types**:
- JSON formatter
- Base formatter (extensible)

**Use Cases**: Output formatting, API responses

---

### 12.5 Error Handling
**Description**: Comprehensive error handling system.

**Features**:
- Validation errors
- Custom exceptions
- Error messages
- Error spans (location in text)

**Use Cases**: Error reporting, debugging

---

### 12.6 Remote Inference
**Description**: Remote LLM inference support.

**Features**:
- Remote API calls
- Inference management
- Response handling

**Use Cases**: Remote LLM services, distributed inference

---

### 12.7 Utilities
**Description**: Various utility functions.

**Utilities**:
- API utilities
- Document utilities
- Exception utilities
- Naming utilities
- Parsing utilities
- Prompt utilities
- Regex utilities
- Safe get utilities
- Structured data utilities
- Tokenization utilities
- Validator utilities
- XML utilities

**Use Cases**: Helper functions, common operations

---

## Summary

**Total Features**: 50+ major features across 12 categories

**Core Categories**:
1. **Core Validation** (6 features): Guard, AsyncGuard, Validators, OnFailActions, Re-asking, Validation Outcome
2. **NLP & Context** (3 features): Context Manager, Keyword Matcher, Similarity Engine
3. **RAG & Retrieval** (6 features): RAG Retriever, ChromaDB, Embedding Service, QA Scorer, FAISS, Document Store
4. **Scoring** (6 features): Response Scorer, 5 metric types
5. **Monitoring** (3 features): LLM Monitor, Metrics Collector, Telemetry
6. **Logging** (3 features): Wall Logger, Formatters, Handlers
7. **Visualization** (9 features): 9 different visualization types including 3D graphs
8. **Schemas** (4 features): Pydantic, RAIL, JSON Schema, Generator
9. **Integrations** (4 features): LangChain, LangGraph, LlamaIndex, MLflow
10. **Execution** (4 features): Runner, AsyncRunner, StreamRunner, AsyncStreamRunner
11. **Infrastructure** (5 features): CLI, Server, API Client, Hub, Settings
12. **Advanced** (7 features): Prompt System, History, Tracing, Formatters, Errors, Remote Inference, Utilities

**Key Highlights**:
- ✅ Complete validation pipeline
- ✅ NLP-based context filtering
- ✅ RAG with multiple vector databases
- ✅ Comprehensive scoring metrics
- ✅ Full monitoring and logging
- ✅ Interactive 3D visualizations
- ✅ Multiple schema systems
- ✅ Framework integrations
- ✅ Streaming and async support
- ✅ Production-ready infrastructure

---

**Wall Library** - The complete solution for production-ready LLM applications.

