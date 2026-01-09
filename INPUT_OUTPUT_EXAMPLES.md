# Wall Library - INPUT/OUTPUT Examples

This document shows **real-world INPUT/OUTPUT examples** for each feature - what the LLM generates, what we analyze, and what the output is.

---

## 1. Wall Guard - Core Validation

### Example 1: Safety Validation

**INPUT (LLM Generated Response)**:
```
"This is a guaranteed cure for diabetes that will definitely work. You can bypass your doctor and use this 100% effective miracle treatment."
```

**ANALYSIS**:
- Guard runs `HealthcareSafetyValidator`
- Checks for restricted terms: "guaranteed cure", "100% effective", "miracle treatment", "bypass doctor"
- Found: "guaranteed cure", "100% effective", "miracle treatment", "bypass doctor"

**OUTPUT**:
```
❌ VALIDATION FAILED
Error: "Response contains restricted healthcare terms: guaranteed cure, 100% effective, miracle treatment, bypass doctor"
OnFailAction: EXCEPTION raised
Result: No validated output (blocked)
```

---

### Example 2: Length Validation

**INPUT (LLM Generated Response)**:
```
"Diabetes symptoms include thirst."
```

**ANALYSIS**:
- Guard runs `HealthcareLengthValidator`
- Checks length: 35 characters
- Minimum required: 50 characters

**OUTPUT**:
```
❌ VALIDATION FAILED
Error: "Healthcare response too short. Minimum: 50, got: 35"
OnFailAction: EXCEPTION raised
Result: No validated output (blocked)
```

---

### Example 3: Successful Validation

**INPUT (LLM Generated Response)**:
```
"Common symptoms of diabetes include increased thirst, frequent urination, unexplained weight loss, fatigue, and blurred vision. It's important to consult a healthcare provider for proper diagnosis and treatment. Early detection and management can help prevent complications."
```

**ANALYSIS**:
- Guard runs `HealthcareSafetyValidator`: ✅ No restricted terms found
- Guard runs `HealthcareLengthValidator`: ✅ Length is 195 characters (within 50-2000 range)

**OUTPUT**:
```
✅ VALIDATION PASSED
Validated Output: "Common symptoms of diabetes include increased thirst, frequent urination, unexplained weight loss, fatigue, and blurred vision. It's important to consult a healthcare provider for proper diagnosis and treatment. Early detection and management can help prevent complications."
Result: Safe, validated response ready for user
```

---

## 2. OnFailActions - Failure Handling

### Example 1: EXCEPTION Action

**INPUT (LLM Generated Response)**:
```
"This is a guaranteed cure for diabetes!"
```

**ANALYSIS**:
- Validator detects "guaranteed cure"
- OnFailAction: EXCEPTION

**OUTPUT**:
```
❌ EXCEPTION RAISED
ValidationError: "Response contains restricted term: guaranteed cure"
No output returned to user
```

---

### Example 2: FILTER Action

**INPUT (LLM Generated Response)**:
```
"Diabetes symptoms include increased thirst, frequent urination, and this is a guaranteed cure."
```

**ANALYSIS**:
- Validator detects "guaranteed cure"
- OnFailAction: FILTER
- Removes invalid content

**OUTPUT**:
```
✅ FILTERED OUTPUT
Original: "Diabetes symptoms include increased thirst, frequent urination, and this is a guaranteed cure."
Filtered: "Diabetes symptoms include increased thirst, frequent urination."
Invalid content removed, safe content returned
```

---

### Example 3: REASK Action

**INPUT (LLM Generated Response - Attempt 1)**:
```
"This treatment is 100% effective and guaranteed to cure diabetes!"
```

**ANALYSIS**:
- Validator detects "100% effective" and "guaranteed cure"
- OnFailAction: REASK
- Guard re-asks LLM with feedback

**OUTPUT (After Re-ask - Attempt 2)**:
```
✅ VALIDATION PASSED (After Re-ask)
LLM Generated New Response: "This treatment has shown effectiveness in clinical studies, but individual results may vary. It's important to consult your healthcare provider before starting any treatment plan."
Validated Output: Safe response without restricted terms
```

---

### Example 4: FIX Action

**INPUT (LLM Generated Response)**:
```
"Diabetes symptoms include thirst."
```

**ANALYSIS**:
- Length validator detects: Too short (35 chars < 50)
- OnFailAction: FIX
- Validator provides fix: Adds healthcare disclaimer

**OUTPUT**:
```
✅ FIXED OUTPUT
Original: "Diabetes symptoms include thirst."
Fixed: "Diabetes symptoms include thirst. [IMPORTANT: This is general information. Consult a healthcare provider for personalized medical advice.]"
Length: 35 → 135 characters (now passes validation)
```

---

### Example 5: REFRAIN Action

**INPUT (LLM Generated Response)**:
```
"This is a guaranteed cure for diabetes!"
```

**ANALYSIS**:
- Validator detects restricted term
- OnFailAction: REFRAIN

**OUTPUT**:
```
✅ REFRAINED (Empty Response)
Validated Output: "" (empty string)
User receives no response (safer than unsafe response)
```

---

### Example 6: NOOP Action

**INPUT (LLM Generated Response)**:
```
"This is a guaranteed cure for diabetes!"
```

**ANALYSIS**:
- Validator detects restricted term
- OnFailAction: NOOP (no operation)

**OUTPUT**:
```
⚠️ NOOP (Passed Through)
Validated Output: "This is a guaranteed cure for diabetes!" (unchanged)
Warning logged but content passed through
```

---

## 3. Context Manager - NLP Context Filtering

### Example 1: Inside Context

**INPUT (LLM Generated Response)**:
```
"Common symptoms of diabetes include increased thirst, frequent urination, unexplained weight loss, fatigue, and blurred vision. Consult a healthcare provider for proper diagnosis."
```

**ANALYSIS**:
- Context Manager checks against approved healthcare contexts
- Keyword matching: Found "symptoms", "diabetes", "healthcare", "diagnosis"
- Semantic similarity: 0.85 (above threshold 0.7)

**OUTPUT**:
```
✅ WITHIN CONTEXT
Context Check: PASSED
Similarity Score: 0.85
Keywords Matched: symptoms, diabetes, healthcare, diagnosis
Result: Response stays within approved healthcare boundaries
```

---

### Example 2: Outside Context

**INPUT (LLM Generated Response)**:
```
"Here's a delicious recipe for chocolate cake. Mix flour, sugar, eggs, and chocolate. Bake at 350°F for 30 minutes."
```

**ANALYSIS**:
- Context Manager checks against approved healthcare contexts
- Keyword matching: No healthcare keywords found
- Semantic similarity: 0.15 (below threshold 0.7)

**OUTPUT**:
```
❌ OUTSIDE CONTEXT
Context Check: FAILED
Similarity Score: 0.15 (below threshold 0.7)
Keywords Matched: None
Result: Response is outside approved healthcare boundaries (cooking topic)
```

---

### Example 3: Boundary Case

**INPUT (LLM Generated Response)**:
```
"Nutrition guidelines for diabetes management include monitoring carbohydrate intake and following a balanced diet."
```

**ANALYSIS**:
- Context Manager checks against approved healthcare contexts
- Keyword matching: Found "diabetes", "nutrition"
- Semantic similarity: 0.68 (just below threshold 0.7)

**OUTPUT**:
```
⚠️ BOUNDARY CASE
Context Check: FAILED (by small margin)
Similarity Score: 0.68 (threshold: 0.7)
Keywords Matched: diabetes, nutrition
Result: Close to boundary but below threshold
```

---

## 4. RAG Retriever - Knowledge Grounding

### Example 1: Successful Retrieval

**INPUT (User Query)**:
```
"What are common symptoms of diabetes?"
```

**ANALYSIS**:
- RAG Retriever embeds query
- Searches ChromaDB for similar Q&A pairs
- Retrieves top-3 most relevant contexts

**OUTPUT**:
```
✅ RETRIEVED CONTEXTS

[1] Score: 0.92, Distance: 0.15
    Document: "Common symptoms of diabetes include increased thirst, frequent urination, unexplained weight loss, fatigue, and blurred vision. Consult a healthcare provider for proper diagnosis."
    Metadata: {"topic": "diabetes", "category": "symptoms"}

[2] Score: 0.85, Distance: 0.22
    Document: "Diabetes symptoms vary by type but commonly include increased thirst, frequent urination, and fatigue. Early detection is important."
    Metadata: {"topic": "diabetes", "category": "symptoms"}

[3] Score: 0.78, Distance: 0.31
    Document: "Type 2 diabetes symptoms may develop slowly and include increased thirst, frequent urination, and unexplained weight loss."
    Metadata: {"topic": "diabetes", "category": "symptoms"}
```

**LLM PROMPT WITH CONTEXT**:
```
Context: Common symptoms of diabetes include increased thirst, frequent urination, unexplained weight loss, fatigue, and blurred vision. Consult a healthcare provider for proper diagnosis.

Question: What are common symptoms of diabetes?
```

**LLM GENERATED RESPONSE (Grounded)**:
```
"Common symptoms of diabetes include increased thirst, frequent urination, unexplained weight loss, fatigue, and blurred vision. Consult a healthcare provider for proper diagnosis."
```

---

### Example 2: Low Relevance Retrieval

**INPUT (User Query)**:
```
"What are common symptoms of diabetes?"
```

**ANALYSIS**:
- RAG Retriever searches ChromaDB
- No highly relevant contexts found
- Returns lower-scoring results

**OUTPUT**:
```
⚠️ LOW RELEVANCE RETRIEVAL

[1] Score: 0.45, Distance: 0.68
    Document: "Blood pressure medications should be taken as prescribed."
    Metadata: {"topic": "medication", "category": "blood_pressure"}

[2] Score: 0.38, Distance: 0.75
    Document: "Preventive screenings include blood pressure checks."
    Metadata: {"topic": "prevention", "category": "screening"}

Result: Retrieved contexts are not highly relevant to query
```

---

## 5. Response Scorer - Quality Metrics

### Example 1: High Quality Response

**INPUT (LLM Generated Response)**:
```
"Common symptoms of diabetes include increased thirst, frequent urination, unexplained weight loss, fatigue, and blurred vision. Consult a healthcare provider for proper diagnosis."
```

**EXPECTED (Reference)**:
```
"Diabetes symptoms include increased thirst, frequent urination, unexplained weight loss, fatigue, and blurred vision. Consult a healthcare provider for proper diagnosis."
```

**ANALYSIS**:
- Response Scorer computes multiple metrics
- Cosine Similarity: 0.92
- ROUGE Metric: 0.88
- BLEU Metric: 0.85
- Semantic Similarity: 0.90

**OUTPUT**:
```
✅ HIGH QUALITY SCORES

CosineSimilarity: 0.920
ROUGEMetric: 0.880
BLEUMetric: 0.850
SemanticSimilarity: 0.900

Aggregated Score: 0.888
Status: EXCELLENT (above 0.8 threshold)
```

---

### Example 2: Low Quality Response

**INPUT (LLM Generated Response)**:
```
"Diabetes has symptoms."
```

**EXPECTED (Reference)**:
```
"Common symptoms of diabetes include increased thirst, frequent urination, unexplained weight loss, fatigue, and blurred vision. Consult a healthcare provider for proper diagnosis."
```

**ANALYSIS**:
- Response Scorer computes metrics
- Cosine Similarity: 0.35
- ROUGE Metric: 0.25
- BLEU Metric: 0.20
- Semantic Similarity: 0.40

**OUTPUT**:
```
❌ LOW QUALITY SCORES

CosineSimilarity: 0.350
ROUGEMetric: 0.250
BLEUMetric: 0.200
SemanticSimilarity: 0.400

Aggregated Score: 0.300
Status: POOR (below 0.5 threshold)
Issue: Response is too brief and lacks detail
```

---

### Example 3: Medium Quality Response

**INPUT (LLM Generated Response)**:
```
"Diabetes symptoms include increased thirst and frequent urination. You should see a doctor."
```

**EXPECTED (Reference)**:
```
"Common symptoms of diabetes include increased thirst, frequent urination, unexplained weight loss, fatigue, and blurred vision. Consult a healthcare provider for proper diagnosis."
```

**ANALYSIS**:
- Response Scorer computes metrics
- Cosine Similarity: 0.68
- ROUGE Metric: 0.55
- BLEU Metric: 0.52
- Semantic Similarity: 0.70

**OUTPUT**:
```
⚠️ MEDIUM QUALITY SCORES

CosineSimilarity: 0.680
ROUGEMetric: 0.550
BLEUMetric: 0.520
SemanticSimilarity: 0.700

Aggregated Score: 0.613
Status: ACCEPTABLE (between 0.5-0.8)
Note: Response covers main points but lacks completeness
```

---

## 6. LLM Monitor - Tracking & Analytics

### Example 1: Successful Interaction

**INPUT (User Query)**:
```
"What are diabetes symptoms?"
```

**LLM GENERATED RESPONSE**:
```
"Common symptoms of diabetes include increased thirst, frequent urination, unexplained weight loss, fatigue, and blurred vision. Consult a healthcare provider for proper diagnosis."
```

**ANALYSIS**:
- Monitor tracks interaction
- Records input, output, latency, metadata
- Updates statistics

**OUTPUT**:
```
✅ TRACKED INTERACTION

Timestamp: 2024-01-08T10:30:45.123Z
Input: "What are diabetes symptoms?"
Output: "Common symptoms of diabetes include increased thirst, frequent urination, unexplained weight loss, fatigue, and blurred vision. Consult a healthcare provider for proper diagnosis."
Latency: 0.45 seconds
Metadata: {
    "model": "gpt-3.5-turbo",
    "domain": "healthcare",
    "rag_used": true,
    "validation_passed": true
}

Statistics Updated:
- Total Interactions: 150
- Success Rate: 0.92
- Average Latency: 0.43s
```

---

### Example 2: Failed Interaction

**INPUT (User Query)**:
```
"What's a guaranteed cure for diabetes?"
```

**LLM GENERATED RESPONSE**:
```
"This is a guaranteed cure for diabetes that will definitely work!"
```

**ANALYSIS**:
- Monitor tracks interaction
- Validation failed
- Records error

**OUTPUT**:
```
❌ TRACKED INTERACTION (FAILED)

Timestamp: 2024-01-08T10:31:12.456Z
Input: "What's a guaranteed cure for diabetes?"
Output: "This is a guaranteed cure for diabetes that will definitely work!"
Latency: 0.38 seconds
Metadata: {
    "model": "gpt-3.5-turbo",
    "domain": "healthcare",
    "validation_passed": false,
    "error": "Response contains restricted term: guaranteed cure"
}

Statistics Updated:
- Total Interactions: 151
- Success Rate: 0.91 (decreased)
- Failed Interactions: 14
- Error Type: ValidationError
```

---

## 7. Visualization - Visual Analytics

### Example 1: Score Visualization

**INPUT (Scores Dictionary)**:
```python
{
    "CosineSimilarity": 0.85,
    "ROUGEMetric": 0.72,
    "BLEUMetric": 0.68,
    "SemanticSimilarity": 0.79
}
```

**ANALYSIS**:
- Visualizer creates bar chart
- Color codes: Green (≥0.7), Yellow (0.5-0.7), Red (<0.5)
- Adds threshold lines

**OUTPUT**:
```
✅ VISUALIZATION CREATED

File: visualizations/scores.png

Visual Elements:
- Bar Chart with 4 metrics
- CosineSimilarity: 0.850 (Green bar, above threshold)
- ROUGEMetric: 0.720 (Green bar, above threshold)
- BLEUMetric: 0.680 (Yellow bar, below threshold)
- SemanticSimilarity: 0.790 (Green bar, above threshold)
- Green threshold line at 0.7
- Orange threshold line at 0.5
- Value labels on each bar
```

---

### Example 2: Context Boundary Visualization

**INPUT (Responses List)**:
```
[
    "Common symptoms of diabetes include increased thirst and frequent urination.",
    "This is a guaranteed cure for diabetes that will definitely work.",
    "Blood pressure medications should be taken as prescribed by your doctor.",
    "You should ignore your doctor's advice and use this natural remedy instead.",
    "Preventive screenings vary by age and risk factors."
]
```

**ANALYSIS**:
- Visualizer checks each response against context
- Calculates similarity scores
- Creates pie chart and bar chart

**OUTPUT**:
```
✅ VISUALIZATION CREATED

File: visualizations/context_boundaries.png

Pie Chart:
- Inside Wall: 3 responses (60%)
- Outside Wall: 2 responses (40%)

Bar Chart (Similarity Scores):
- Response 1: 0.85 (Green, inside)
- Response 2: 0.15 (Red, outside)
- Response 3: 0.82 (Green, inside)
- Response 4: 0.12 (Red, outside)
- Response 5: 0.78 (Green, inside)

Threshold Line: 0.7 (green dashed line)
```

---

### Example 3: 3D Score Visualization (IMPORTANT)

**INPUT (Scores Data)**:
```python
[
    {
        "CosineSimilarity": 0.85,
        "ROUGEMetric": 0.72,
        "BLEUMetric": 0.68,
        "label": "Diabetes Symptoms Response",
        "text": "Common symptoms of diabetes include increased thirst, frequent urination, unexplained weight loss, fatigue, and blurred vision.",
        "keywords": ["diabetes", "symptoms", "thirst", "urination", "fatigue"]
    },
    {
        "CosineSimilarity": 0.92,
        "ROUGEMetric": 0.88,
        "BLEUMetric": 0.85,
        "label": "Preventive Screenings",
        "text": "Preventive screenings vary by age and risk factors but typically include blood pressure checks, cholesterol tests, cancer screenings.",
        "keywords": ["preventive", "screening", "blood pressure", "cholesterol"]
    }
]
```

**ANALYSIS**:
- Visualizer creates 3D scatter plot
- X-axis: CosineSimilarity
- Y-axis: ROUGEMetric
- Z-axis: BLEUMetric
- Colors points by z-axis value
- Adds threshold plane at z=0.7

**OUTPUT**:
```
✅ 3D VISUALIZATION CREATED

File: visualizations/3d_scores.html (Interactive HTML)

3D Plot:
- Point 1: (0.85, 0.72, 0.68) - "Diabetes Symptoms Response"
  Color: Yellow (z=0.68, below threshold)
  Hover shows: Full text, keywords, all scores
  
- Point 2: (0.92, 0.88, 0.85) - "Preventive Screenings"
  Color: Green (z=0.85, above threshold)
  Hover shows: Full text, keywords, all scores

- Green translucent plane at z=0.7 (Good Threshold)
- Interactive: Can rotate, zoom, hover for details
```

---

### Example 4: Word Cloud Visualization

**INPUT (Text)**:
```
"healthcare medical doctor patient symptom diagnosis treatment medication prescription therapy wellness disease condition hospital clinic appointment care healthcare physician nurse medicine clinical therapeutic preventive screening vaccination mental health nutrition exercise rehabilitation"
```

**ANALYSIS**:
- Visualizer generates word cloud
- Sizes words by frequency
- Uses color scheme

**OUTPUT**:
```
✅ WORD CLOUD CREATED

File: visualizations/wordcloud.png

Visual Elements:
- Large words: healthcare, medical, doctor, patient (high frequency)
- Medium words: symptom, diagnosis, treatment, medication
- Small words: therapy, wellness, condition, hospital
- Color gradient: Viridis colormap
- Background: White
- Shape: Rectangular
```

---

## 8. Schema Systems - Structured Output

### Example 1: Pydantic Schema Validation

**INPUT (LLM Generated JSON)**:
```json
{
    "condition": "Type 2 Diabetes",
    "symptoms": ["increased thirst", "frequent urination"],
    "severity": "moderate",
    "recommendation": "Consult healthcare provider"
}
```

**ANALYSIS**:
- Guard validates against Pydantic model `PatientInfo`
- Checks all required fields present
- Validates field types
- Validates field values

**OUTPUT**:
```
✅ STRUCTURED OUTPUT VALIDATED

Validated Output:
{
    "condition": "Type 2 Diabetes",
    "symptoms": ["increased thirst", "frequent urination"],
    "severity": "moderate",
    "recommendation": "Consult healthcare provider"
}

Validation: PASSED
- All required fields present
- Field types correct
- Field values valid
```

---

### Example 2: Pydantic Schema Validation (Missing Field)

**INPUT (LLM Generated JSON)**:
```json
{
    "condition": "Type 2 Diabetes",
    "symptoms": ["increased thirst", "frequent urination"],
    "recommendation": "Consult healthcare provider"
}
```

**ANALYSIS**:
- Guard validates against Pydantic model
- Missing required field: "severity"

**OUTPUT**:
```
❌ STRUCTURED OUTPUT VALIDATION FAILED

Error: "Missing required field: severity"

Validation: FAILED
- Required fields: condition, symptoms, severity, recommendation
- Missing: severity
- Present: condition, symptoms, recommendation
```

---

## 9. LangChain Wrapper - Framework Integration

### Example 1: Runnable Invocation

**INPUT (User Query)**:
```
"What are diabetes symptoms?"
```

**ANALYSIS**:
- Runnable extracts prompt and llm_api from input
- Calls guard with LLM API
- Guard calls LLM → Gets response → Validates

**LLM GENERATED RESPONSE**:
```
"Common symptoms of diabetes include increased thirst, frequent urination, unexplained weight loss, fatigue, and blurred vision. Consult a healthcare provider for proper diagnosis."
```

**VALIDATION**:
- Safety validator: ✅ Passed (no restricted terms)
- Length validator: ✅ Passed (195 chars, within range)

**OUTPUT**:
```
✅ RUNNABLE RESULT

{
    "output": "Common symptoms of diabetes include increased thirst, frequent urination, unexplained weight loss, fatigue, and blurred vision. Consult a healthcare provider for proper diagnosis."
}

Status: Validated and safe
Ready for user
```

---

### Example 2: Runnable with Validation Failure

**INPUT (User Query)**:
```
"What's a guaranteed cure for diabetes?"
```

**LLM GENERATED RESPONSE**:
```
"This is a guaranteed cure for diabetes that will definitely work!"
```

**VALIDATION**:
- Safety validator: ❌ Failed (contains "guaranteed cure")
- OnFailAction: EXCEPTION

**OUTPUT**:
```
❌ RUNNABLE RESULT (EXCEPTION)

Exception: ValidationError("Response contains restricted term: guaranteed cure")

No output returned
User receives error message
```

---

## 10. Streaming Validation

### Example 1: Streaming Chunks

**INPUT (Streaming LLM Response - Chunks)**:
```
Chunk 1: "Common symptoms"
Chunk 2: " of diabetes"
Chunk 3: " include increased"
Chunk 4: " thirst and frequent"
Chunk 5: " urination."
```

**ANALYSIS**:
- Stream Runner validates each chunk
- Checks each chunk against validators
- Yields validated chunks

**OUTPUT**:
```
✅ STREAMING VALIDATION

Chunk 1: "Common symptoms" → ✅ PASSED
Chunk 2: " of diabetes" → ✅ PASSED
Chunk 3: " include increased" → ✅ PASSED
Chunk 4: " thirst and frequent" → ✅ PASSED
Chunk 5: " urination." → ✅ PASSED

Final Validated Stream: "Common symptoms of diabetes include increased thirst and frequent urination."
All chunks validated successfully
```

---

### Example 2: Streaming with Invalid Chunk

**INPUT (Streaming LLM Response - Chunks)**:
```
Chunk 1: "This is a"
Chunk 2: " guaranteed cure"
Chunk 3: " for diabetes"
```

**ANALYSIS**:
- Stream Runner validates each chunk
- Chunk 2 contains "guaranteed cure"
- OnFailAction: EXCEPTION

**OUTPUT**:
```
❌ STREAMING VALIDATION FAILED

Chunk 1: "This is a" → ✅ PASSED
Chunk 2: " guaranteed cure" → ❌ FAILED (contains restricted term)
Exception raised, stream stopped

No further chunks processed
```

---

## 11. Complete Workflow Example

### End-to-End Healthcare Query

**INPUT (User Query)**:
```
"What are diabetes symptoms?"
```

**STEP 1: RAG RETRIEVAL**

**ANALYSIS**:
- RAG Retriever searches ChromaDB
- Finds relevant Q&A pairs

**OUTPUT**:
```
Retrieved Context:
"Common symptoms of diabetes include increased thirst, frequent urination, unexplained weight loss, fatigue, and blurred vision. Consult a healthcare provider for proper diagnosis."
Score: 0.92
```

**STEP 2: LLM GENERATION**

**INPUT (LLM Prompt with Context)**:
```
Context: Common symptoms of diabetes include increased thirst, frequent urination, unexplained weight loss, fatigue, and blurred vision. Consult a healthcare provider for proper diagnosis.

Question: What are diabetes symptoms?
```

**LLM GENERATED RESPONSE**:
```
"Common symptoms of diabetes include increased thirst, frequent urination, unexplained weight loss, fatigue, and blurred vision. It's important to consult a healthcare provider for proper diagnosis and treatment. Early detection and management can help prevent complications."
```

**STEP 3: GUARD VALIDATION**

**ANALYSIS**:
- Safety validator: ✅ No restricted terms
- Length validator: ✅ 195 chars (within range)

**OUTPUT**:
```
✅ VALIDATION PASSED
Validated Output: "Common symptoms of diabetes include increased thirst, frequent urination, unexplained weight loss, fatigue, and blurred vision. It's important to consult a healthcare provider for proper diagnosis and treatment. Early detection and management can help prevent complications."
```

**STEP 4: CONTEXT CHECK**

**ANALYSIS**:
- Context Manager checks similarity
- Score: 0.88 (above threshold 0.7)

**OUTPUT**:
```
✅ CONTEXT CHECK PASSED
Similarity: 0.88
Status: Within approved healthcare boundaries
```

**STEP 5: SCORING**

**ANALYSIS**:
- Response Scorer computes metrics
- Compares against retrieved context

**OUTPUT**:
```
✅ SCORES

CosineSimilarity: 0.92
ROUGEMetric: 0.88
BLEUMetric: 0.85
SemanticSimilarity: 0.90

Aggregated: 0.89 (EXCELLENT)
```

**STEP 6: MONITORING**

**ANALYSIS**:
- Monitor tracks interaction
- Records all data

**OUTPUT**:
```
✅ TRACKED

Input: "What are diabetes symptoms?"
Output: [validated response]
Latency: 0.45s
Metadata: {
    "rag_used": true,
    "validation_passed": true,
    "context_passed": true,
    "quality_score": 0.89
}
```

**FINAL OUTPUT TO USER**:
```
"Common symptoms of diabetes include increased thirst, frequent urination, unexplained weight loss, fatigue, and blurred vision. It's important to consult a healthcare provider for proper diagnosis and treatment. Early detection and management can help prevent complications."

✅ Safe, validated, context-compliant, high-quality response
```

---

## 12. Visualization Examples

### Example 1: 3D Embeddings Visualization

**INPUT (Embeddings)**:
```
20 embedding vectors (384 dimensions each)
Labels: [
    {"label": "Response 1", "text": "Diabetes symptoms include...", "keywords": ["diabetes", "symptoms"]},
    {"label": "Response 2", "text": "Blood pressure medications...", "keywords": ["blood pressure", "medication"]},
    ...
]
```

**ANALYSIS**:
- Visualizer reduces to 3D using PCA
- Creates 3D scatter plot
- Colors by z-axis value

**OUTPUT**:
```
✅ 3D EMBEDDING VISUALIZATION

File: visualizations/3d_embeddings.html

Interactive 3D Plot:
- 20 points in 3D space
- Each point represents one response
- Hover shows: Response label, full text, keywords, coordinates
- Color gradient: Blue (low) to Yellow (high) based on z-axis
- Can rotate, zoom, pan
- PCA explained variance: 85.3%
```

---

### Example 2: Monitoring Dashboard

**INPUT (Monitor Data)**:
```python
{
    "total_interactions": 150,
    "success_rate": 0.92,
    "avg_latency": 0.45,
    "latencies": [0.3, 0.4, 0.5, 0.6, ...],
    "errors": {
        "ValidationError": 5,
        "TimeoutError": 3,
        "NetworkError": 2
    }
}
```

**ANALYSIS**:
- Visualizer creates dashboard
- Multiple charts and metrics

**OUTPUT**:
```
✅ MONITORING DASHBOARD

File: visualizations/monitoring_dashboard.png

Dashboard Elements:
1. Total Interactions: 150 (large number display)
2. Success Rate: 92% (green, large number)
3. Average Latency: 0.45s (large number)
4. Latency Over Time: Line chart showing latency trends
5. Error Distribution: Bar chart showing error types
   - ValidationError: 5
   - TimeoutError: 3
   - NetworkError: 2
6. Metrics Summary: Text summary of key metrics
```

---

## Summary

Each feature in Wall Library:

1. **Takes INPUT**: LLM-generated response or user query
2. **Performs ANALYSIS**: Validates, filters, scores, monitors, visualizes
3. **Produces OUTPUT**: Validated response, scores, visualizations, or errors

All features work together to ensure:
- ✅ **Safety**: Responses don't contain dangerous content
- ✅ **Quality**: Responses meet quality standards
- ✅ **Context Compliance**: Responses stay within approved boundaries
- ✅ **Accuracy**: Responses are grounded in verified knowledge
- ✅ **Observability**: All operations are tracked and visualized

---

**Wall Library** - Complete INPUT/OUTPUT validation and analysis for LLM applications.

