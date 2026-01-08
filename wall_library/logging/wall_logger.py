"""Wall Logger - Comprehensive logging for Wall Library."""

import logging
import functools
import time
from contextlib import contextmanager
from typing import Any, Dict, List, Optional, Callable
from datetime import datetime

from wall_library.logging.log_scopes import LogScope
from wall_library.logging.log_formatters import JSONFormatter, HumanFormatter
from wall_library.logging.log_handlers import create_console_handler, create_file_handler


class WallLogger:
    """Comprehensive logger for Wall Library operations."""
    
    def __init__(
        self,
        level: str = "INFO",
        scopes: List[str] = None,
        output: str = "console",  # "console", "file", "both"
        format: str = "human",    # "json", "human", "both"
        log_file: Optional[str] = None,
        max_bytes: int = 10 * 1024 * 1024,  # 10MB
        backup_count: int = 5,
    ):
        """Initialize Wall Logger.
        
        Args:
            level: Log level (DEBUG, INFO, WARNING, ERROR)
            scopes: List of scopes to log (default: ["all"])
            output: Output destination ("console", "file", "both")
            format: Log format ("json", "human", "both")
            log_file: Path to log file (required if output includes "file")
            max_bytes: Maximum file size before rotation
            backup_count: Number of backup files to keep
        """
        self.level = getattr(logging, level.upper(), logging.INFO)
        self.scopes = scopes or [LogScope.ALL.value]
        self.output = output
        self.format = format
        self.log_file = log_file
        
        # Initialize formatters
        self.json_formatter = JSONFormatter()
        self.human_formatter = HumanFormatter()
        
        # Initialize handlers
        self.handlers = []
        
        if output in ["console", "both"]:
            handler = create_console_handler(level=self.level)
            self.handlers.append(handler)
        
        if output in ["file", "both"]:
            if not log_file:
                raise ValueError("log_file is required when output includes 'file'")
            handler = create_file_handler(
                log_file=log_file,
                level=self.level,
                max_bytes=max_bytes,
                backup_count=backup_count,
            )
            if handler:
                self.handlers.append(handler)
    
    def _should_log(self, scope: str) -> bool:
        """Check if a scope should be logged.
        
        Args:
            scope: Scope to check
            
        Returns:
            True if should log
        """
        return LogScope.is_enabled(scope, self.scopes)
    
    def _write_log(
        self,
        level: str,
        scope: str,
        message: str,
        metadata: Optional[Dict[str, Any]] = None,
    ):
        """Write log entry.
        
        Args:
            level: Log level
            scope: Logging scope
            message: Log message
            metadata: Optional metadata
        """
        if not self._should_log(scope):
            return
        
        # Format log entry
        log_entries = []
        
        if self.format in ["json", "both"]:
            log_entries.append(
                self.json_formatter.format(level, scope, message, metadata)
            )
        
        if self.format in ["human", "both"]:
            log_entries.append(
                self.human_formatter.format(level, scope, message, metadata)
            )
        
        # Write to all handlers
        for handler in self.handlers:
            for entry in log_entries:
                try:
                    if hasattr(handler, 'stream'):
                        handler.stream.write(entry + "\n")
                        handler.stream.flush()
                    else:
                        # For file handlers, use emit
                        record = logging.LogRecord(
                            name="wall_logger",
                            level=getattr(logging, level.upper(), logging.INFO),
                            pathname="",
                            lineno=0,
                            msg=entry,
                            args=(),
                            exc_info=None,
                        )
                        handler.emit(record)
                except Exception:
                    # Silently fail if handler has issues
                    pass
    
    def log_llm_call(
        self,
        input_data: Any,
        output: str,
        metadata: Optional[Dict[str, Any]] = None,
        latency: Optional[float] = None,
    ):
        """Log LLM call.
        
        Args:
            input_data: Input to LLM
            output: Output from LLM
            metadata: Optional metadata
            latency: Optional latency in seconds
        """
        log_metadata = {
            "input": str(input_data)[:500],  # Truncate long inputs
            "output": output[:500],  # Truncate long outputs
            "output_length": len(output),
            **(metadata or {}),
        }
        
        if latency is not None:
            log_metadata["latency_seconds"] = latency
        
        self._write_log(
            level="INFO",
            scope=LogScope.LLM_CALLS.value,
            message="LLM call completed",
            metadata=log_metadata,
        )
    
    def log_validation(
        self,
        value: Any,
        result: Any,
        validator_name: str,
        metadata: Optional[Dict[str, Any]] = None,
    ):
        """Log validation operation.
        
        Args:
            value: Value being validated
            result: Validation result
            validator_name: Name of validator
            metadata: Optional metadata
        """
        validation_passed = getattr(result, "validation_passed", None)
        if validation_passed is None:
            validation_passed = getattr(result, "is_pass", False)
        
        log_metadata = {
            "validator": validator_name,
            "value_length": len(str(value)),
            "validation_passed": validation_passed,
            **(metadata or {}),
        }
        
        level = "INFO" if validation_passed else "WARNING"
        message = "Validation passed" if validation_passed else "Validation failed"
        
        self._write_log(
            level=level,
            scope=LogScope.VALIDATIONS.value,
            message=message,
            metadata=log_metadata,
        )
    
    def log_rag_retrieval(
        self,
        query: str,
        retrieved_docs: List[Dict[str, Any]],
        metadata: Optional[Dict[str, Any]] = None,
    ):
        """Log RAG retrieval operation.
        
        Args:
            query: Query string
            retrieved_docs: Retrieved documents
            metadata: Optional metadata
        """
        log_metadata = {
            "query": query[:200],  # Truncate long queries
            "num_retrieved": len(retrieved_docs),
            "top_doc": retrieved_docs[0]["document"][:200] if retrieved_docs else None,
            **(metadata or {}),
        }
        
        self._write_log(
            level="INFO",
            scope=LogScope.RAG.value,
            message=f"RAG retrieval completed: {len(retrieved_docs)} documents",
            metadata=log_metadata,
        )
    
    def log_scoring(
        self,
        response: str,
        scores: Dict[str, float],
        metadata: Optional[Dict[str, Any]] = None,
    ):
        """Log scoring operation.
        
        Args:
            response: Response being scored
            scores: Dictionary of scores
            metadata: Optional metadata
        """
        log_metadata = {
            "response_length": len(response),
            "scores": scores,
            "num_metrics": len(scores),
            **(metadata or {}),
        }
        
        self._write_log(
            level="INFO",
            scope=LogScope.SCORING.value,
            message=f"Scoring completed: {len(scores)} metrics",
            metadata=log_metadata,
        )
    
    def log_error(
        self,
        error: Exception,
        context: Optional[Dict[str, Any]] = None,
    ):
        """Log error.
        
        Args:
            error: Exception that occurred
            context: Optional context information
        """
        log_metadata = {
            "error_type": type(error).__name__,
            "error_message": str(error),
            **(context or {}),
        }
        
        self._write_log(
            level="ERROR",
            scope=LogScope.ERRORS.value,
            message=f"Error occurred: {type(error).__name__}",
            metadata=log_metadata,
        )
    
    @contextmanager
    def log_context(self, operation_name: str, **kwargs):
        """Context manager for automatic operation logging.
        
        Args:
            operation_name: Name of operation
            **kwargs: Additional context metadata
        """
        start_time = time.time()
        self._write_log(
            level="DEBUG",
            scope=LogScope.ALL.value,
            message=f"Operation started: {operation_name}",
            metadata=kwargs,
        )
        
        try:
            yield
            elapsed = time.time() - start_time
            self._write_log(
                level="DEBUG",
                scope=LogScope.ALL.value,
                message=f"Operation completed: {operation_name}",
                metadata={**kwargs, "elapsed_seconds": elapsed},
            )
        except Exception as e:
            elapsed = time.time() - start_time
            self.log_error(e, context={**kwargs, "operation": operation_name, "elapsed_seconds": elapsed})
            raise
    
    def auto_log(self, scope: Optional[str] = None):
        """Decorator for automatic function logging.
        
        Args:
            scope: Optional scope override
            
        Returns:
            Decorator function
        """
        def decorator(func: Callable) -> Callable:
            @functools.wraps(func)
            def wrapper(*args, **kwargs):
                func_scope = scope or LogScope.ALL.value
                func_name = func.__name__
                
                with self.log_context(f"{func_name}", **kwargs):
                    try:
                        result = func(*args, **kwargs)
                        return result
                    except Exception as e:
                        self.log_error(e, context={"function": func_name, "args": str(args)[:200]})
                        raise
            
            return wrapper
        return decorator

