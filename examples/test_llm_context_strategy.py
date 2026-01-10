from wall_library.nlp.context_manager import ContextManager
import logging

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def mock_llm_cot_approve(prompt: str) -> str:
    """Mock LLM response simulating Chain of Thought approval."""
    print(f"\n[Mock LLM Input]:\n{prompt[:100]}...\n")
    return """
    1. Intent: User wants to share data.
    2. Context: Data sharing is allowed if encrypted.
    3. Verdict: This seems safe because encryption is mentioned.
    final_answer: yes
    """

def mock_llm_cot_reject(prompt: str) -> str:
    """Mock LLM response simulating Chain of Thought rejection."""
    print(f"\n[Mock LLM Input]:\n{prompt[:100]}...\n")
    return """
    1. Intent: User wants to delete the database.
    2. Context: Usage is read-only.
    3. Verdict: This violates the read-only constraint.
    final_answer: no
    """

def test_llm_strategy():
    print("----------------------------------------------------------------")
    print("Testing ContextManager with strategy='llm_check'")
    print("----------------------------------------------------------------")
    
    cm = ContextManager()
    # Add a context that would normally fail simple keyword checks if we were strict,
    # or let's say we rely entirely on the LLM to interpret "sensitive data".
    cm.add_string_list(["Handling of sensitive data must follow strict protocols."])

    query = "I am processing encrypted sensitive data."

    # 1. Test Approval
    print("\n--- Test 1: Approval (Expected True) ---")
    is_valid = cm.check_context(
        query,
        strategy="llm_check",
        llm_call=mock_llm_cot_approve
    )
    print(f"Query: '{query}'")
    print(f"Is Valid: {is_valid}")
    assert is_valid is True, "Should be valid based on 'final_answer: yes'"

    # 2. Test Rejection
    print("\n--- Test 2: Rejection (Expected False) ---")
    bad_query = "I am deleting the sensitive data database."
    is_valid_reject = cm.check_context(
        bad_query,
        strategy="llm_check",
        llm_call=mock_llm_cot_reject
    )
    print(f"Query: '{bad_query}'")
    print(f"Is Valid: {is_valid_reject}")
    assert is_valid_reject is False, "Should be invalid based on 'final_answer: no'"

    print("\n[SUCCESS] LLM Strategy tests passed!")

if __name__ == "__main__":
    test_llm_strategy()
