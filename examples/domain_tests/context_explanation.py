#!/usr/bin/env python3
"""
Explanation of check_context() function in ContextManager.

This script demonstrates how check_context works step-by-step.
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from wall_library.nlp import ContextManager

print("="*80)
print("HOW check_context() WORKS")
print("="*80)

# Step 1: Create a ContextManager with healthcare boundaries
print("\n📋 STEP 1: Setting up context boundaries")
print("-" * 80)

context_manager = ContextManager()

# Add approved healthcare contexts
healthcare_contexts = [
    "General health information and wellness tips",
    "Symptom description and when to seek medical attention",
    "Medication information and dosage instructions",
    "Preventive care and screening recommendations",
]

context_manager.add_string_list(healthcare_contexts)

# Add keywords
healthcare_keywords = ["health", "medical", "doctor", "patient", "symptom", "medication"]
context_manager.add_keywords(healthcare_keywords)

print(f"✓ Added {len(healthcare_contexts)} approved contexts")
print(f"✓ Added {len(healthcare_keywords)} keywords")
print(f"\nContexts: {healthcare_contexts}")
print(f"Keywords: {healthcare_keywords}")

# Step 2: Explain the check_context algorithm
print("\n\n🔍 STEP 2: How check_context() validates text")
print("-" * 80)
print("""
The check_context() function uses a TWO-STEP validation process:

1. KEYWORD MATCHING (Fast Check)
   └─ Checks if the text contains ANY of the approved keywords
   └─ If found → Returns TRUE immediately (text is in context)
   └─ If not found → Proceeds to Step 2

2. SEMANTIC SIMILARITY (Deep Check)
   └─ Compares the text against ALL approved contexts
   └─ Calculates cosine similarity for each context
   └─ Takes the MAXIMUM similarity score
   └─ If max_similarity >= threshold → Returns TRUE
   └─ If max_similarity < threshold → Returns FALSE

3. FALLBACK
   └─ If no keywords or contexts are set → Returns TRUE (no restrictions)
""")

# Step 3: Demonstrate with examples
print("\n\n🧪 STEP 3: Real Examples")
print("-" * 80)

test_cases = [
    {
        "text": "What are common symptoms of diabetes?",
        "description": "Healthcare-related query",
        "expected": True,
    },
    {
        "text": "The weather today is sunny and warm.",
        "description": "Completely unrelated topic",
        "expected": False,
    },
    {
        "text": "I need information about blood pressure medication.",
        "description": "Contains healthcare keywords",
        "expected": True,
    },
    {
        "text": "Python is a programming language.",
        "description": "Technology topic, no healthcare keywords",
        "expected": False,
    },
]

for i, test in enumerate(test_cases, 1):
    print(f"\n--- Example {i}: {test['description']} ---")
    print(f"Text: \"{test['text']}\"")
    
    # Check with keyword matching first
    keyword_match = context_manager.keyword_matcher.match(
        test['text'], 
        list(context_manager.keywords)
    )
    print(f"  ✓ Keyword Match: {keyword_match}")
    
    # Check similarity if no keyword match
    if not keyword_match and context_manager.contexts:
        similarities = [
            context_manager.similarity_engine.cosine_similarity(test['text'], ctx)
            for ctx in context_manager.contexts
        ]
        max_sim = max(similarities)
        print(f"  ✓ Max Similarity: {max_sim:.3f}")
        print(f"  ✓ Similarity Threshold: 0.7")
        print(f"  ✓ Similarity Check: {max_sim >= 0.7}")
    
    # Final result
    result = context_manager.check_context(test['text'], threshold=0.7)
    status = "✅ PASS" if result == test['expected'] else "❌ FAIL"
    print(f"  {status} Final Result: {result} (Expected: {test['expected']})")

# Step 4: Explain the threshold
print("\n\n⚙️  STEP 4: Understanding the Threshold")
print("-" * 80)
print("""
The threshold parameter (default: 0.7) controls how strict the validation is:

- threshold = 0.9 → VERY STRICT (only very similar texts pass)
- threshold = 0.7 → MODERATE (default, balanced)
- threshold = 0.5 → LENIENT (more texts will pass)
- threshold = 0.3 → VERY LENIENT (most related texts pass)

Similarity scores range from 0.0 to 1.0:
- 1.0 = Identical or very similar meaning
- 0.7-0.9 = Highly related
- 0.5-0.7 = Moderately related
- 0.3-0.5 = Somewhat related
- 0.0-0.3 = Unrelated
""")

# Demonstrate threshold effect
print("\n📊 Threshold Effect Example:")
print("-" * 80)
test_text = "I have questions about my medication dosage"
print(f"Text: \"{test_text}\"\n")

for threshold in [0.9, 0.7, 0.5, 0.3]:
    result = context_manager.check_context(test_text, threshold=threshold)
    print(f"  Threshold {threshold}: {'✅ PASS' if result else '❌ FAIL'}")

# Step 5: Visual flow diagram
print("\n\n📊 VISUAL FLOW DIAGRAM")
print("-" * 80)
print("""
                    check_context(text, threshold=0.7)
                              │
                              ▼
                    ┌─────────────────────┐
                    │  Has Keywords?      │
                    └──────────┬──────────┘
                               │
                    ┌──────────┴──────────┐
                    │                     │
              YES   │                     │   NO
                    ▼                     ▼
         ┌──────────────────┐   ┌──────────────────────┐
         │ Keyword Matcher   │   │ Has Contexts?        │
         │ .match()          │   └──────────┬───────────┘
         └────────┬──────────┘              │
                  │                         │
                  │                         ▼
                  │              ┌──────────────────────┐
                  │              │ Calculate Similarity │
                  │              │ for each context     │
                  │              └──────────┬───────────┘
                  │                         │
                  │                         ▼
                  │              ┌──────────────────────┐
                  │              │ max_similarity >=     │
                  │              │ threshold?           │
                  │              └──────────┬───────────┘
                  │                         │
                  └──────────┬──────────────┘
                             │
                    ┌────────┴────────┐
                    │                 │
                 TRUE              FALSE
                    │                 │
                    ▼                 ▼
              ✅ IN CONTEXT    ❌ OUT OF CONTEXT
""")

print("\n" + "="*80)
print("SUMMARY")
print("="*80)
print("""
check_context() is a TWO-LAYER validation system:

1. FAST LAYER: Keyword matching (instant check)
   - If text contains approved keywords → PASS immediately
   
2. DEEP LAYER: Semantic similarity (ML-powered)
   - Compares text meaning against approved contexts
   - Uses cosine similarity (with sentence-transformers if available)
   - Returns PASS if similarity >= threshold

This ensures:
✓ Fast validation for obvious matches (keywords)
✓ Accurate validation for nuanced content (similarity)
✓ Configurable strictness (threshold parameter)
✓ Graceful fallback (works even without ML models)
""")


