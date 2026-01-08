# Healthcare Domain Feature Explanations

This document explains Wall Library features using healthcare examples from `healthcare_test.py`.

---

## 1. RAIL Schema — Parsing and Validation

### What is RAIL?
RAIL (Reliable AI Language) is an XML-based schema format that defines:
- **Output structure**: What fields the LLM should return
- **Validators**: Rules to validate each field
- **On-fail actions**: What to do if validation fails

### Healthcare Example:

```python
# RAIL schema for healthcare symptom reporting
rail_schema = """
<rail version="0.1">
<output>
    <string name="symptom_description" 
            description="Patient symptom description" 
            validators="length" 
            on-fail-length="exception"/>
    <string name="recommendation" 
            description="General health recommendation" 
            validators="length" 
            on-fail-length="exception"/>
</output>
<prompt>
You are a healthcare assistant. Provide symptom information and recommendations.
</prompt>
</rail>
"""

# Parse and use the RAIL schema
from wall_library.schema.rail_schema import rail_string_to_schema

processed_schema = rail_string_to_schema(rail_schema)
guard = WallGuard()
guard.processed_schema = processed_schema
```

### Real-World Use Case:
**Scenario**: A patient asks "I have been feeling very thirsty and urinating frequently. What should I do?"

**What RAIL does**:
1. Defines that the LLM must return two fields: `symptom_description` and `recommendation`
2. Validates that each field meets length requirements
3. If validation fails, raises an exception (prevents incomplete medical advice)

**Why it matters**: Ensures healthcare responses are **structured** and **complete** - critical for medical information!

---

## 2. JSON Schema — Generation from Pydantic Models

### What is JSON Schema?
JSON Schema defines the structure and validation rules for JSON data. Wall Library can generate JSON schemas from Pydantic models.

### Healthcare Example:

```python
from pydantic import BaseModel, Field
from wall_library import WallGuard

# Define healthcare response structure using Pydantic
class HealthcareResponse(BaseModel):
    symptom: str = Field(description="Patient symptom description")
    severity: str = Field(description="Symptom severity level: mild, moderate, severe")
    recommendation: str = Field(description="General recommendation (must include 'consult healthcare provider')")

# Generate JSON schema automatically
json_schema = HealthcareResponse.model_json_schema()
# Result: {
#   "properties": {
#     "symptom": {"type": "string", "description": "Patient symptom description"},
#     "severity": {"type": "string", "description": "Symptom severity level..."},
#     "recommendation": {"type": "string", "description": "General recommendation..."}
#   }
# }

# Create guard that validates LLM output matches this structure
guard = WallGuard.for_pydantic(output_class=HealthcareResponse)
```

### Real-World Use Case:
**Scenario**: LLM generates response about diabetes symptoms.

**What JSON Schema does**:
1. **Validates structure**: Ensures response has `symptom`, `severity`, and `recommendation` fields
2. **Type checking**: Ensures each field is a string
3. **Completeness**: Prevents incomplete medical advice

**Example validation**:
```python
# ✅ Valid response
{
  "symptom": "Increased thirst and frequent urination",
  "severity": "moderate",
  "recommendation": "These symptoms may indicate diabetes. Consult healthcare provider for proper diagnosis."
}

# ❌ Invalid - missing severity field
{
  "symptom": "Increased thirst",
  "recommendation": "See a doctor"
}
# → Validation fails! Missing required field
```

---

## 3. FIX_REASK Action — Fix Then Reask on Failure

### What is FIX_REASK?
When validation fails, FIX_REASK:
1. **First**: Attempts to automatically fix the response
2. **Then**: If fix doesn't work, re-asks the LLM to generate a new response

### Healthcare Example:

```python
@register_validator("healthcare_completeness", require_rc=False)
class HealthcareCompletenessValidator(Validator):
    """Ensures healthcare responses are complete and detailed."""
    
    def _validate(self, value, metadata):
        # Healthcare responses must be at least 100 characters
        if len(value) < 100:
            # Try to fix by adding a disclaimer
            fixed_value = value + " [IMPORTANT: This is general information. Consult a healthcare provider for personalized medical advice.]"
            return FailResult(
                error_message=f"Response too short: {len(value)} < 100 characters",
                fix_value=fixed_value,  # ← This is the fix attempt
                metadata=metadata
            )
        return PassResult(metadata=metadata)

# Create guard with FIX_REASK
guard = WallGuard().use(
    (HealthcareCompletenessValidator, {"require_rc": False}, OnFailAction.FIX_REASK)
)

# Test with incomplete response
short_response = "Diabetes symptoms include thirst."
outcome = guard.validate(short_response)
```

### Real-World Use Case:
**Scenario**: LLM generates a short, incomplete response: "Diabetes symptoms include thirst."

**What FIX_REASK does**:
1. **Detects problem**: Response is only 35 characters (needs 100+)
2. **Attempts fix**: Adds disclaimer: "Diabetes symptoms include thirst. [IMPORTANT: This is general information. Consult a healthcare provider for personalized medical advice.]"
3. **Validates fix**: If fixed version passes → returns it
4. **If fix fails**: Re-asks LLM to generate a new, complete response

**Why it matters**: In healthcare, **incomplete information is dangerous**. FIX_REASK ensures responses are always complete and include necessary disclaimers.

---

## 4. Document Store — Document Storage and Retrieval

### What is Document Store?
A simple document storage system that lets you:
- Store healthcare documents with metadata
- Search documents by query
- Retrieve relevant documents for context

### Healthcare Example:

```python
from wall_library.document_store import DocumentStore, Document

# Create document store for healthcare knowledge base
store = DocumentStore()

# Add healthcare documents
docs = [
    Document(
        id="diabetes_symptoms_001",
        content="Diabetes symptoms include increased thirst, frequent urination, unexplained weight loss, fatigue, and blurred vision. Consult a healthcare provider for proper diagnosis.",
        metadata={"topic": "diabetes", "category": "symptoms", "severity": "moderate"}
    ),
    Document(
        id="bp_medication_001",
        content="Blood pressure medications should be taken exactly as prescribed by your doctor, usually at the same time each day. Never stop taking medication without consulting your healthcare provider.",
        metadata={"topic": "medication", "category": "blood_pressure", "severity": "high"}
    ),
    Document(
        id="preventive_screening_001",
        content="Preventive screenings vary by age and risk factors but typically include blood pressure checks, cholesterol tests, cancer screenings, and diabetes screening. Consult your doctor for personalized recommendations.",
        metadata={"topic": "prevention", "category": "screening", "severity": "low"}
    ),
]

# Store documents
for doc in docs:
    store.add(doc)

# Search for relevant documents
query = "What are diabetes symptoms?"
results = store.search(query, top_k=2)

# Results:
# - [diabetes_symptoms_001] Diabetes symptoms include increased thirst...
```

### Real-World Use Case:
**Scenario**: Patient asks "What are diabetes symptoms?"

**What Document Store does**:
1. **Searches** stored healthcare documents
2. **Finds** relevant document: `diabetes_symptoms_001`
3. **Retrieves** it to provide accurate, pre-approved information

**Why it matters**: Instead of letting LLM generate potentially inaccurate information, you can **retrieve verified healthcare documents** from your knowledge base!

---

## 5. Prompt System — Instructions and Messages Classes

### What is Prompt System?
A structured way to manage LLM prompts with:
- **Instructions**: System-level instructions (how the AI should behave)
- **Messages**: Conversation history (system, user, assistant messages)

### Healthcare Example:

```python
from wall_library.prompt import Prompt, Instructions, Messages

# Define healthcare assistant instructions
instructions = Instructions(
    source="""You are a healthcare assistant. Your role is to:
1. Provide accurate, evidence-based health information
2. Always recommend consulting a healthcare provider for diagnosis
3. Never provide specific medical diagnoses
4. Use clear, empathetic language
5. Include appropriate disclaimers"""
)

# Define conversation messages
messages = Messages(
    source=[
        {
            "role": "system",
            "content": "You are a helpful healthcare assistant specializing in patient education."
        },
        {
            "role": "user",
            "content": "What are common symptoms of diabetes?"
        }
    ]
)

# Create prompt
prompt = Prompt(instructions=instructions, messages=messages)

# Use with guard
guard = WallGuard()
# Guard can now use this structured prompt
```

### Real-World Use Case:
**Scenario**: Building a healthcare chatbot.

**What Prompt System does**:
1. **Instructions**: Sets the AI's role and behavior rules
   - "Always recommend consulting healthcare provider"
   - "Never provide specific diagnoses"
2. **Messages**: Manages conversation flow
   - System message: Sets the assistant's persona
   - User message: Patient's question
   - Assistant message: (Generated by LLM, validated by guard)

**Why it matters**: Ensures **consistent, safe healthcare communication** across all interactions!

---

## 6. LangChain Wrapper — LangChain Runnable Integration

### What is LangChain Wrapper?
Converts your Wall Library guard into a LangChain `Runnable`, allowing you to use it in LangChain chains, agents, and workflows.

### Healthcare Example:

```python
from wall_library import WallGuard, OnFailAction
from wall_library.wrappers import LangChainWrapper
from wall_library.validator_base import Validator, register_validator

# Create healthcare guard with safety validators
guard = WallGuard().use(
    (HealthcareSafetyValidator, {"require_rc": False}, OnFailAction.EXCEPTION),
    (HealthcareLengthValidator, {"min_length": 50, "require_rc": False}, OnFailAction.EXCEPTION)
)

# Convert to LangChain Runnable
wrapper = LangChainWrapper(guard)
runnable = wrapper.to_runnable()

# Now use in LangChain chain!
from langchain.chains import LLMChain
from langchain.prompts import PromptTemplate

# Create chain: Prompt → LLM → WallGuard Validation
prompt = PromptTemplate(template="Answer: {question}", input_variables=["question"])
chain = prompt | llm | runnable  # ← Your guard validates LLM output!

# Use the chain
result = chain.invoke({
    "question": "What are diabetes symptoms?"
})
# ✅ LLM generates response → Guard validates it → Returns validated output
```

### Real-World Use Case:
**Scenario**: Building a healthcare chatbot with LangChain.

**What LangChain Wrapper does**:
1. **Integrates** your healthcare guard into LangChain workflows
2. **Validates** every LLM response automatically
3. **Blocks** unsafe responses (e.g., "guaranteed cure", "miracle treatment")
4. **Ensures** responses meet length requirements

**Example workflow**:
```
User Question → LangChain Prompt → LLM → WallGuard (Validates) → Safe Response
                                      ↓
                              If unsafe → Exception/Filter
```

**Why it matters**: You can use **all LangChain features** (chains, agents, tools) while ensuring **every response is validated** by your healthcare safety rules!

---

## 7. Re-asking Mechanism — Automatic Retries with Exponential Backoff

### What is Re-asking?
When validation fails, the system automatically:
1. **Re-asks** the LLM to generate a new response
2. **Retries** up to `num_reasks` times
3. **Uses exponential backoff** (waits longer between each retry)

### Healthcare Example:

```python
@register_validator("healthcare_safety_check", require_rc=False)
class HealthcareSafetyCheckValidator(Validator):
    """Ensures response doesn't contain dangerous medical claims."""
    
    def __init__(self, **kwargs):
        super().__init__(require_rc=False, **kwargs)
        self.attempt_count = 0
    
    def _validate(self, value, metadata):
        self.attempt_count += 1
        
        # Check for dangerous claims
        dangerous_phrases = [
            "guaranteed cure",
            "100% effective",
            "miracle treatment",
            "bypass doctor"
        ]
        
        value_lower = value.lower()
        for phrase in dangerous_phrases:
            if phrase in value_lower:
                return FailResult(
                    error_message=f"Response contains dangerous claim: {phrase}",
                    metadata={**metadata, "attempt": self.attempt_count}
                )
        
        return PassResult(metadata=metadata)

# Create guard with REASK action
guard = WallGuard().use(
    (HealthcareSafetyCheckValidator, {"require_rc": False}, OnFailAction.REASK)
)
guard.num_reasks = 3  # Try up to 3 times

# Test with problematic response
# (In real scenario, LLM might generate: "This treatment is 100% effective!")
problematic_response = "This treatment is 100% effective!"
outcome = guard.validate(problematic_response)
```

### Real-World Use Case:
**Scenario**: LLM generates a response with dangerous claim: "This treatment is 100% effective!"

**What Re-asking does**:
1. **Attempt 1**: Validates response → **FAILS** (contains "100% effective")
2. **Wait** (exponential backoff: 1 second)
3. **Attempt 2**: Re-asks LLM → New response: "This treatment has shown effectiveness in studies, but consult your doctor."
4. **Validates** → **PASSES** ✅
5. **Returns** safe response

**Exponential Backoff**:
- Attempt 1 → Attempt 2: Wait 1 second
- Attempt 2 → Attempt 3: Wait 2 seconds
- Attempt 3 → Attempt 4: Wait 4 seconds

**Why it matters**: In healthcare, **one bad response can harm a patient**. Re-asking gives the LLM multiple chances to generate a safe, compliant response!

---

## Summary: Why These Features Matter in Healthcare

| Feature | Healthcare Benefit |
|---------|-------------------|
| **RAIL Schema** | Ensures structured, complete medical information |
| **JSON Schema** | Validates response structure (prevents incomplete advice) |
| **FIX_REASK** | Automatically adds disclaimers to incomplete responses |
| **Document Store** | Retrieves verified healthcare documents (not LLM hallucinations) |
| **Prompt System** | Ensures consistent, safe healthcare communication |
| **LangChain Wrapper** | Integrates safety validation into existing LangChain workflows |
| **Re-asking** | Gives LLM multiple chances to generate safe responses |

**All together**: These features create a **comprehensive safety system** that ensures healthcare LLM responses are:
- ✅ **Accurate** (validated against knowledge base)
- ✅ **Complete** (structured schemas)
- ✅ **Safe** (blocks dangerous claims)
- ✅ **Compliant** (includes disclaimers)
- ✅ **Reliable** (automatic retries)

