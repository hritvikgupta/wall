"""Sequential validator service."""

from typing import List, Dict, Any

from wall_library.validator_service.validator_service_base import ValidatorServiceBase
from wall_library.validator_base import Validator
from wall_library.classes.validation.validation_result import ValidationResult


class SequentialValidatorService(ValidatorServiceBase):
    """Sequential validation execution service."""

    def validate(
        self, value: Any, validators: List[Validator], metadata: Dict[str, Any] = None
    ) -> List[ValidationResult]:
        """Validate a value sequentially using validators.

        Args:
            value: Value to validate
            validators: List of validators to run
            metadata: Optional metadata

        Returns:
            List of validation results
        """
        metadata = metadata or {}
        results = []

        for validator in validators:
            result = validator.validate(value, metadata)
            results.append(result)

        return results


