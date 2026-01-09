"""Merge utilities."""

from typing import Any, Dict, List
from wall_library.classes.validation.validation_result import ValidationResult


def merge_validation_results(results: List[ValidationResult]) -> ValidationResult:
    """Merge multiple validation results.

    Args:
        results: List of validation results

    Returns:
        Merged validation result
    """
    from wall_library.classes.validation.validation_result import PassResult, FailResult

    if all(r.is_pass for r in results):
        return PassResult(metadata={"merged": True, "count": len(results)})
    else:
        fail_results = [r for r in results if r.is_fail]
        error_messages = [
            r.error_message for r in fail_results if hasattr(r, "error_message")
        ]
        return FailResult(
            error_message="; ".join(error_messages),
            metadata={"merged": True, "count": len(results)},
        )


def merge_configs(configs: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Merge multiple configuration dictionaries.

    Args:
        configs: List of configuration dictionaries

    Returns:
        Merged configuration dictionary
    """
    merged = {}
    for config in configs:
        merged.update(config)
    return merged


