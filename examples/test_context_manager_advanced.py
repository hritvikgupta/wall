from wall_library.nlp.context_manager import ContextManager
import logging

# Setup basic logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def mock_llm_call(prompt: str) -> str:
    """Mock LLM that approves everything."""
    logger.info(f"Mock LLM received prompt: {prompt[:50]}...")
    return "yes"

def mock_llm_reject_call(prompt: str) -> str:
    """Mock LLM that rejects everything."""
    logger.info(f"Mock LLM received prompt: {prompt[:50]}...")
    return "no"

def mock_vllm_call(prompt: str, image: str) -> str:
    """Mock VLLM that approves everything."""
    logger.info(f"Mock VLLM received prompt: {prompt[:50]}... and image: {image[:20]}...")
    return "Yes, this image is valid."

def test_manual_check_llm():
    print("\n--- Testing Text Context with LLM Verification ---")
    cm = ContextManager()
    cm.add_string_list(["Healthcare policies require all patient data to be encrypted."])
    # Clear keywords to force similarity/LLM check (otherwise 'patient' keyword match passes immediately)
    cm.keywords = set()
    
    # 1. Test Valid Context (Keyword/Similarity should pass, but let's force LLM check if we wanted to)
    # Actually, in our logic, if similarity passes, LLM isn't called unless we change logic or it fails similarity.
    # Let's test a case where similarity might fail or be low, but LLM approves it.
    
    query = "I want to share patient records publicly." # This should definitely fail similarity/keyword checks if they were strict, or at least be controversial.
    
    query = "I want to share patient records publicly." 
    
    # 2. Test LLM Strategy (Explicit)
    print("Testing Strategy='llm_check'...")
    is_valid = cm.check_context(
        query, 
        llm_call=mock_llm_call, 
        strategy="llm_check"
    )
    print(f"Query: '{query}'")
    print(f"Result (Mock LLM says Yes): {is_valid}")
    
    # Test rejection with LLM strategy
    print("Testing Strategy='llm_check' (Rejection)...")
    is_valid_reject = cm.check_context(
        query, 
        llm_call=mock_llm_reject_call, 
        strategy="llm_check"
    )
    print(f"Result (Mock LLM says No): {is_valid_reject}")

def test_manual_check_image():
    print("\n--- Testing Image Context Guard ---")
    cm = ContextManager()
    cm.add_string_list(["The image must contain a cat."])
    
    image_url = "http://example.com/cat.jpg"
    
    is_valid = cm.check_image_context(
        image=image_url,
        vllm_call=mock_vllm_call,
        prompt_template="Context: {context}\nDoes the image contain the required elements?"
    )
    
    print(f"Image: {image_url}")
    print(f"Context: 'The image must contain a cat.'")
    print(f"Result (Mock VLLM says Yes): {is_valid}")

if __name__ == "__main__":
    test_manual_check_llm()
    test_manual_check_image()
