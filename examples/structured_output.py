"""Structured output example."""

from wall_library import WallGuard
from pydantic import BaseModel, Field


class Pet(BaseModel):
    """Pet model."""
    pet_type: str = Field(description="Species of pet")
    name: str = Field(description="a unique pet name")


def main():
    """Structured output example."""
    prompt = "What kind of pet should I get and what should I name it?"
    guard = WallGuard.for_pydantic(output_class=Pet, prompt=prompt)

    # In real usage, you would call with an LLM API
    # raw_output, validated_output, *rest = guard(
    #     llm_api=openai.completions.create,
    #     engine="gpt-3.5-turbo-instruct"
    # )
    print("Guard created for structured output generation")


if __name__ == "__main__":
    main()


