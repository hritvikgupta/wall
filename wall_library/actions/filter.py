"""Filter action implementation."""

from typing import Any, List

from wall_library.classes.validation.validation_result import FailResult, ValidationResult


class Filter:
    """Filter action for handling validation failures."""

    @staticmethod
    def apply(value: Any, fail_result: FailResult) -> Optional[Any]:
        """Filter out invalid values.

        Args:
            value: Value that failed validation
            fail_result: Failure result

        Returns:
            None (filters out invalid value)
        """
        return None

    @staticmethod
    def apply_to_list(values: List[Any], fail_results: List[FailResult]) -> List[Any]:
        """Filter invalid values from a list.

        Args:
            values: List of values
            fail_results: List of failure results

        Returns:
            Filtered list with only valid values
        """
        filtered = []
        for i, (value, result) in enumerate(zip(values, fail_results)):
            if result.is_pass:
                filtered.append(value)
        return filtered


