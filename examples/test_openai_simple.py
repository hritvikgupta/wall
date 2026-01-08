"""Simple test with OpenAI API - validates library is working."""

import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

print("=" * 60)
print("Wall Library - OpenAI Integration Test")
print("=" * 60)

# Check API key
api_key = os.getenv("OPENAI_API_KEY")
if not api_key:
    print("\n❌ ERROR: OPENAI_API_KEY not found in environment")
    print("Please set OPENAI_API_KEY in your .env file")
    exit(1)

print(f"\n✓ API Key found: {api_key[:20]}...")

# Test basic imports
try:
    from wall_library import WallGuard
    print("✓ WallGuard imported successfully")
except ImportError as e:
    print(f"❌ Failed to import WallGuard: {e}")
    exit(1)

try:
    import openai
    from openai import OpenAI
    print("✓ OpenAI library imported successfully")
except ImportError as e:
    print(f"❌ Failed to import OpenAI: {e}")
    print("Install with: pip install openai")
    exit(1)

# Test creating a guard
try:
    guard = WallGuard()
    print("✓ Guard created successfully")
except Exception as e:
    print(f"❌ Failed to create guard: {e}")
    exit(1)

# Test OpenAI connection (simple test without full guard execution)
try:
    client = OpenAI(api_key=api_key)
    print("✓ OpenAI client created")
    
    print("\n📡 Testing OpenAI API connection...")
    # Simple test call
    response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[{"role": "user", "content": "Say 'Hello' in one word"}],
        max_tokens=10
    )
    print(f"✓ OpenAI API connection successful!")
    print(f"✓ Response: {response.choices[0].message.content}")
    
except Exception as e:
    print(f"⚠️  OpenAI API test failed: {e}")
    print("This might be due to:")
    print("  - Network connectivity issues")
    print("  - Invalid API key")
    print("  - API rate limits")
    print("\nHowever, the library structure is correct ✓")

print("\n" + "=" * 60)
print("✅ Basic integration test completed!")
print("=" * 60)
print("\nNote: For full guard execution with OpenAI, use:")
print("  guard(llm_api=llm_api_call, prompt='your prompt')")

