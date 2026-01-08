"""Base validator service class."""

from abc import ABC, abstractmethod
from typing import List, Dict, Any

from wall_library.validator_base import Validator
from wall_library.classes.validation.validation_result import ValidationResult


class ValidatorServiceBase(ABC):
    """Base class for validator services."""

    @abstractmethod
    def validate(
        self, value: Any, validators: List[Validator], metadata: Dict[str, Any] = None
    ) -> List[ValidationResult]:
        """Validate a value using validators."""
        pass

