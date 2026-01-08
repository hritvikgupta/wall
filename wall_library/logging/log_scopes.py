"""Logging scope definitions."""

from enum import Enum


class LogScope(str, Enum):
    """Logging scope definitions."""
    
    LLM_CALLS = "llm_calls"
    VALIDATIONS = "validations"
    RAG = "rag"
    SCORING = "scoring"
    MONITORING = "monitoring"
    ERRORS = "errors"
    ALL = "all"
    
    @classmethod
    def is_enabled(cls, scope: str, enabled_scopes: list) -> bool:
        """Check if a scope is enabled.
        
        Args:
            scope: Scope to check
            enabled_scopes: List of enabled scopes
            
        Returns:
            True if scope is enabled
        """
        if cls.ALL.value in enabled_scopes:
            return True
        return scope in enabled_scopes

