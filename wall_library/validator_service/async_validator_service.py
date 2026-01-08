"""Async validator service."""

import asyncio
from typing import List, Dict, Any

from wall_library.validator_service.validator_service_base import ValidatorServiceBase
from wall_library.validator_base import Validator
from wall_library.classes.validation.validation_result import ValidationResult


class AsyncValidatorService(ValidatorServiceBase):
    """Async validator execution service."""

    async def validate(
        self, value: Any, validators: List[Validator], metadata: Dict[str, Any] = None
    ) -> List[ValidationResult]:
        """Async validate a value using validators.

        Args:
            value: Value to validate
            validators: List of validators to run
            metadata: Optional metadata

        Returns:
            List of validation results
        """
        metadata = metadata or {}

        # Run validators concurrently
        tasks = [validator.async_validate(value, metadata) for validator in validators]
        results = await asyncio.gather(*tasks)

        return list(results)

