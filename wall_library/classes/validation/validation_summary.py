"""Validation summary class."""

from dataclasses import dataclass, field
from typing import Dict, List, Any

from wall_library.classes.validation.validation_result import ValidationResult


@dataclass
class ValidationSummary:
    """Summary of validation results."""

    passed: int = 0
    failed: int = 0
    total: int = 0
    results: List[ValidationResult] = field(default_factory=list)
    metadata: Dict[str, Any] = field(default_factory=dict)

    def add_result(self, result: ValidationResult) -> None:
        """Add a validation result."""
        self.results.append(result)
        self.total += 1
        if result.is_pass:
            self.passed += 1
        else:
            self.failed += 1

    @property
    def success_rate(self) -> float:
        """Calculate success rate."""
        if self.total == 0:
            return 0.0
        return self.passed / self.total

    def __repr__(self) -> str:
        return f"ValidationSummary(passed={self.passed}, failed={self.failed}, total={self.total})"

