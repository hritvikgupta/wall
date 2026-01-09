# Domain-Specific Test Cases

This directory contains domain-specific test cases that demonstrate how Wall Library can be used to validate LLM responses in specific contexts.

## Healthcare Domain Test

The healthcare test (`healthcare_test.py`) validates that LLM responses in healthcare contexts:

1. **Stay within approved medical information boundaries** - Responses must align with approved healthcare contexts
2. **Don't contain restricted terms** - Blocks unsafe medical advice like "guaranteed cure", "miracle treatment", etc.
3. **Use appropriate medical terminology** - Validates healthcare-specific language
4. **Follow healthcare communication guidelines** - Ensures responses are appropriately detailed and professional

### Features

- **Healthcare Safety Validator**: Blocks responses containing restricted terms like:
  - "guaranteed cure"
  - "miracle treatment"
  - "instant relief"
  - "unproven treatment"
  - "bypass doctor"
  - And more...

- **Healthcare Length Validator**: Ensures responses are appropriately detailed (50-2000 characters)

- **NLP Context Filtering**: Validates responses stay within approved healthcare contexts:
  - General health information
  - Symptom description
  - Medication information
  - Preventive care
  - Mental health resources
  - And more...

- **Response Scoring**: Evaluates response quality against expected healthcare communication standards

- **LLM Integration**: Actually calls OpenAI GPT to generate responses and validates them in real-time

### Running the Test

```bash
# Make sure you have OPENAI_API_KEY in your .env file
python3 examples/domain_tests/healthcare_test.py
```

### Test Scenarios

1. **Appropriate Symptom Information** - Tests responses about medical symptoms
2. **Medication Information** - Tests responses about medications
3. **Preventive Care** - Tests responses about health screenings
4. **Mental Health Resources** - Tests responses about mental health support

### Blocking Tests

The test also verifies that inappropriate responses are correctly blocked:
- Prompts asking for "guaranteed cures"
- Prompts asking to stop medication
- Prompts asking for "secret remedies"

### Expected Output

```
✅ Appropriate Symptom Information: PASSED
✅ Medication Information: PASSED
✅ Preventive Care: PASSED
✅ Mental Health Resources: PASSED
✅ Blocking Tests: PASSED

🎉 ALL HEALTHCARE DOMAIN TESTS PASSED!
```

## Adding More Domain Tests

To add tests for other domains (finance, legal, education, etc.):

1. Create a new file: `{domain}_test.py`
2. Define domain-specific:
   - Approved contexts
   - Keywords
   - Restricted terms
   - Validators
3. Create domain-specific wall with validators and context managers
4. Test LLM responses against the wall

Follow the same pattern as `healthcare_test.py`.


