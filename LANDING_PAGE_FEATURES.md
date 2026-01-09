# Wall Library - Landing Page Features

Short, display-ready feature descriptions with examples across multiple domains.

---

## 🛡️ Core Features

### 1. Wall Guard - Multi-Layer Validation
**What it does**: Validates LLM responses with custom rules before they reach users.

**Healthcare Example**:
- ❌ Blocks: "This is a guaranteed cure for diabetes!"
- ✅ Allows: "Common symptoms include increased thirst and frequent urination. Consult your doctor."

**Finance Example**:
- ❌ Blocks: "Invest all your money in this stock - guaranteed returns!"
- ✅ Allows: "Investment strategies vary by risk tolerance. Consult a financial advisor."

**Legal Example**:
- ❌ Blocks: "I guarantee you'll win this case if you follow my advice."
- ✅ Allows: "Legal outcomes depend on many factors. Consult with a qualified attorney."

---

### 2. Context Manager - Stay in Your Lane
**What it does**: Ensures responses stay within approved topics using NLP.

**Healthcare Domain**:
- ✅ "Diabetes symptoms include increased thirst" → Within context (0.85 similarity)
- ❌ "Here's a chocolate cake recipe" → Outside context (0.15 similarity)

**Finance Domain**:
- ✅ "Investment strategies for retirement planning" → Within context (0.82 similarity)
- ❌ "How to bake a birthday cake" → Outside context (0.12 similarity)

**E-commerce Domain**:
- ✅ "Product features and pricing information" → Within context (0.88 similarity)
- ❌ "Medical advice about diabetes" → Outside context (0.18 similarity)

---

### 3. RAG Retriever - Grounded in Knowledge
**What it does**: Retrieves verified information from your knowledge base to prevent hallucinations.

**Healthcare**:
- Query: "What are diabetes symptoms?"
- Retrieved: "Common symptoms include increased thirst, frequent urination..." (Score: 0.92)
- LLM uses this verified context → Accurate response

**Finance**:
- Query: "What are retirement planning strategies?"
- Retrieved: "401(k) contributions, IRA options, asset allocation..." (Score: 0.89)
- LLM uses this verified context → Accurate response

**Customer Support**:
- Query: "How do I return a product?"
- Retrieved: "Return policy: 30-day window, original packaging required..." (Score: 0.95)
- LLM uses this verified context → Accurate response

---

### 4. Response Scorer - Quality Assurance
**What it does**: Scores response quality using multiple metrics (ROUGE, BLEU, similarity).

**Healthcare**:
- Response: "Diabetes symptoms include increased thirst, frequent urination, fatigue."
- Scores: Cosine: 0.92, ROUGE: 0.88, BLEU: 0.85 → **EXCELLENT** ✅

**Education**:
- Response: "The water cycle involves evaporation, condensation, precipitation."
- Scores: Cosine: 0.89, ROUGE: 0.85, BLEU: 0.82 → **EXCELLENT** ✅

**Low Quality Example**:
- Response: "Diabetes has symptoms."
- Scores: Cosine: 0.35, ROUGE: 0.25, BLEU: 0.20 → **POOR** ❌

---

### 5. LLM Monitor - Track Everything
**What it does**: Monitors all LLM interactions for performance and analytics.

**Metrics Tracked**:
- Total interactions: 1,250
- Success rate: 94%
- Average latency: 0.42s
- Error breakdown: ValidationError (3%), TimeoutError (2%), NetworkError (1%)

**Use Cases**: Performance monitoring, debugging, compliance tracking

---

### 6. Visualization - See Your Data
**What it does**: Interactive 3D graphs, word clouds, and dashboards.

**3D Score Visualization**:
- Plot responses in 3D space (Cosine, ROUGE, BLEU axes)
- Hover to see full text, keywords, scores
- Identify high/low quality responses visually

**Context Boundaries**:
- Pie chart: 85% inside wall, 15% outside
- Bar chart: Similarity scores for each response
- Visual threshold indicators

**Word Clouds**:
- Visualize most common keywords
- Size = frequency
- Color-coded by domain

---

### 7. OnFailActions - Smart Failure Handling
**What it does**: Defines what happens when validation fails.

**EXCEPTION** (Strict):
- Input: "Guaranteed cure for diabetes!"
- Output: ❌ Error raised, no response sent

**FILTER** (Moderate):
- Input: "Symptoms include thirst. This is a guaranteed cure."
- Output: ✅ "Symptoms include thirst." (unsafe part removed)

**REASK** (Auto-Retry):
- Input: "100% effective treatment!"
- Output: ✅ LLM re-asked → "Treatment has shown effectiveness in studies. Consult your doctor."

**FIX** (Auto-Fix):
- Input: "Diabetes symptoms: thirst" (too short)
- Output: ✅ "Diabetes symptoms: thirst. [IMPORTANT: Consult healthcare provider.]"

---

### 8. Schema Systems - Structured Output
**What it does**: Ensures LLM outputs match expected structure.

**Healthcare**:
- Schema: PatientInfo {condition, symptoms[], severity, recommendation}
- ✅ Valid: All fields present, correct types
- ❌ Invalid: Missing "severity" field

**E-commerce**:
- Schema: ProductInfo {name, price, description, category}
- ✅ Valid: All fields present
- ❌ Invalid: Missing "price" field

**Finance**:
- Schema: InvestmentAdvice {strategy, risk_level, timeframe, disclaimer}
- ✅ Valid: All fields present
- ❌ Invalid: Missing "disclaimer" field

---

### 9. Framework Integration
**What it does**: Works seamlessly with LangChain, LangGraph, and other frameworks.

**LangChain**:
- Convert guard → Runnable
- Use in chains: `prompt | llm | guard_runnable`
- Sequential execution with validation

**LangGraph**:
- Create nodes with guard validation
- Integrate into graph workflows
- State management with validation

---

### 10. Streaming & Async
**What it does**: Supports real-time streaming and async operations.

**Streaming**:
- Validate chunks as they arrive
- Real-time safety checks
- Immediate blocking of unsafe content

**Async**:
- Non-blocking validation
- Concurrent processing
- High-performance async workflows

---

## 📊 Domain Examples

### Healthcare
- ✅ Blocks dangerous medical claims
- ✅ Ensures responses stay within medical boundaries
- ✅ Validates structured patient information
- ✅ Scores against medical guidelines

### Finance
- ✅ Blocks investment guarantees
- ✅ Ensures compliance with financial regulations
- ✅ Validates structured financial data
- ✅ Scores against approved financial advice

### Legal
- ✅ Prevents unauthorized legal advice
- ✅ Ensures responses stay within legal information boundaries
- ✅ Validates structured legal documents
- ✅ Scores against legal standards

### E-commerce
- ✅ Blocks false product claims
- ✅ Ensures accurate product information
- ✅ Validates structured product data
- ✅ Scores against product specifications

### Education
- ✅ Ensures accurate educational content
- ✅ Validates structured course information
- ✅ Scores against curriculum standards
- ✅ Maintains educational boundaries

### Customer Support
- ✅ Ensures accurate policy information
- ✅ Validates structured support responses
- ✅ Scores against support guidelines
- ✅ Maintains brand voice consistency

---

## 🎯 Key Benefits

### Safety
- Blocks dangerous, inappropriate, or false content
- Prevents hallucinations and misinformation
- Ensures compliance with regulations

### Quality
- Scores response quality automatically
- Ensures completeness and accuracy
- Validates structure and format

### Context Compliance
- Keeps responses within approved topics
- Prevents off-topic responses
- Maintains domain boundaries

### Observability
- Tracks all interactions
- Visualizes data with 3D graphs
- Comprehensive monitoring dashboards

### Production Ready
- Framework integrations (LangChain, LangGraph)
- Streaming and async support
- REST API server
- CLI tools

---

## 💡 Real-World Use Cases

**Healthcare Chatbot**:
- Input: "What are diabetes symptoms?"
- Analysis: Safety check ✅, Context check ✅, RAG retrieval ✅
- Output: "Common symptoms include increased thirst, frequent urination..." (Safe, accurate, compliant)

**Financial Advisor Bot**:
- Input: "What's the best investment?"
- Analysis: Blocks guarantees ✅, Retrieves verified strategies ✅
- Output: "Investment strategies vary. Consult a financial advisor..." (Compliant, accurate)

**E-commerce Assistant**:
- Input: "Is this product guaranteed to work?"
- Analysis: Blocks false claims ✅, Retrieves product info ✅
- Output: "Product features include... See customer reviews..." (Accurate, compliant)

**Legal Information Bot**:
- Input: "Can you guarantee I'll win my case?"
- Analysis: Blocks legal guarantees ✅, Provides information only ✅
- Output: "Legal outcomes depend on many factors. Consult an attorney..." (Compliant, safe)

---

## 🚀 Quick Stats

- **50+ Features** across 12 categories
- **8 OnFailActions** for flexible failure handling
- **5 Scoring Metrics** for quality assessment
- **3 Vector Databases** supported (ChromaDB, FAISS)
- **4 Framework Integrations** (LangChain, LangGraph, LlamaIndex, MLflow)
- **9 Visualization Types** including interactive 3D graphs
- **Multiple Domains** supported (Healthcare, Finance, Legal, E-commerce, Education, etc.)

---

**Wall Library** - Enterprise-grade validation for production LLM applications.

