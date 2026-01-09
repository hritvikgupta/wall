"""Test example with OpenAI API."""

import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

from wall_library import WallGuard
from pydantic import BaseModel, Field

try:
    import openai
    OPENAI_AVAILABLE = True
except ImportError:
    OPENAI_AVAILABLE = False
    print("OpenAI not installed. Install with: pip install openai")


class Pet(BaseModel):
    """Pet model."""
    pet_type: str = Field(description="Species of pet")
    name: str = Field(description="a unique pet name")


def main():
    """Test structured output with OpenAI."""
    if not OPENAI_AVAILABLE:
        print("OpenAI package not available")
        return

    # Check for API key
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        print("ERROR: OPENAI_API_KEY not found in environment")
        return

    openai.api_key = api_key

    print("Creating guard with Pydantic model...")
    prompt = "What kind of pet should I get and what should I name it? Give me one recommendation."
    
    guard = WallGuard.for_pydantic(output_class=Pet, prompt=prompt)
    print("✓ Guard created successfully")

    print("\nCalling OpenAI with guard...")
    try:
        # Note: This uses a simplified OpenAI call
        # In production, you would use the full OpenAI client
        from openai import OpenAI
        client = OpenAI(api_key=api_key)

        # Create a simple wrapper for the LLM API
        def llm_api_call(prompt: str, **kwargs):
            """Wrapper for OpenAI API call."""
            response = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": prompt}],
                **kwargs
            )
            return response.choices[0].message.content

        # Use guard with OpenAI
        raw_output, validated_output, outcome = guard(
            llm_api=llm_api_call,
            prompt=prompt,
        )

        print(f"\n✓ Raw output: {raw_output}")
        print(f"✓ Validated output: {validated_output}")
        print(f"✓ Validation passed: {outcome.validation_passed}")

        if validated_output:
            print(f"\n📝 Pet Type: {validated_output.get('pet_type', 'N/A')}")
            print(f"📝 Pet Name: {validated_output.get('name', 'N/A')}")

    except Exception as e:
        print(f"\n❌ Error: {e}")
        print("\nNote: The guard structure is correct. Error might be due to:")
        print("  - OpenAI API connectivity")
        print("  - API key issues")
        print("  - Missing dependencies")


if __name__ == "__main__":
    main()


