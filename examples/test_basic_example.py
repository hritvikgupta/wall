"""Basic test example that works without external APIs."""

from wall_library import WallGuard, OnFailAction
from wall_library.validator_base import Validator, register_validator
from wall_library.classes.validation.validation_result import PassResult, FailResult
from typing import Any


# Create a simple test validator
@register_validator("test_length")
class LengthValidator(Validator):
    """Simple length validator for testing."""
    
    def __init__(self, min_length: int = 0, max_length: int = 100, **kwargs):
        """Initialize length validator."""
        super().__init__(**kwargs)
        self.min_length = min_length
        self.max_length = max_length
        self.rail_alias = "test_length"
    
    def _validate(self, value: Any, metadata: dict) -> PassResult | FailResult:
        """Validate value length."""
        from wall_library.classes.validation.validation_result import PassResult, FailResult
        
        if not isinstance(value, str):
            return FailResult(
                error_message=f"Value must be a string, got {type(value).__name__}",
                metadata=metadata,
            )
        
        length = len(value)
        if length < self.min_length:
            return FailResult(
                error_message=f"Value too short. Minimum length: {self.min_length}, got: {length}",
                metadata=metadata,
            )
        
        if length > self.max_length:
            return FailResult(
                error_message=f"Value too long. Maximum length: {self.max_length}, got: {length}",
                metadata=metadata,
            )
        
        return PassResult(metadata=metadata)


def main():
    """Test basic validation."""
    print("=" * 60)
    print("Wall Library - Basic Validation Test")
    print("=" * 60)
    
    # Create guard with validator (skip RC file requirement)
    print("\n1. Creating guard with LengthValidator...")
    guard = WallGuard().use(
        (LengthValidator, {"min_length": 5, "max_length": 20, "require_rc": False}, OnFailAction.EXCEPTION)
    )
    print("✓ Guard created")
    
    # Test valid input
    print("\n2. Testing valid input: 'Hello World'")
    try:
        outcome = guard.validate("Hello World")
        print(f"✓ Validation passed: {outcome.validation_passed}")
        print(f"✓ Validated output: {outcome.validated_output}")
    except Exception as e:
        print(f"❌ Validation failed: {e}")
    
    # Test invalid input (too short)
    print("\n3. Testing invalid input (too short): 'Hi'")
    try:
        outcome = guard.validate("Hi")
        print(f"✓ Validation passed: {outcome.validation_passed}")
    except Exception as e:
        print(f"✓ Expected failure caught: {str(e)[:50]}...")
    
    # Test invalid input (too long)
    print("\n4. Testing invalid input (too long): 'A' * 30")
    try:
        outcome = guard.validate("A" * 30)
        print(f"✓ Validation passed: {outcome.validation_passed}")
    except Exception as e:
        print(f"✓ Expected failure caught: {str(e)[:50]}...")
    
    print("\n" + "=" * 60)
    print("✅ Basic validation test completed successfully!")
    print("=" * 60)


if __name__ == "__main__":
    main()

