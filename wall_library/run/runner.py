"""Runner for synchronous LLM execution."""

from typing import Any, Callable, Dict, List, Optional

from wall_library.classes.execution.guard_execution_options import GuardExecutionOptions
from wall_library.classes.output_type import OutputTypes
from wall_library.types.validator import ValidatorMap
from wall_library.llm_providers import PromptCallableBase


class Runner:
    """Runner class for synchronous LLM execution with validation."""

    def __init__(
        self,
        api: Optional[PromptCallableBase] = None,
        output_schema: Optional[Dict[str, Any]] = None,
        validation_map: Optional[ValidatorMap] = None,
        num_reasks: int = 0,
        exec_options: Optional[GuardExecutionOptions] = None,
    ):
        """Initialize runner.

        Args:
            api: LLM API callable
            output_schema: Output schema
            validation_map: Validator map
            num_reasks: Maximum number of re-asks
            exec_options: Execution options
        """
        self.api = api
        self.output_schema = output_schema or {}
        self.validation_map = validation_map or {}
        self.num_reasks = num_reasks
        self.exec_options = exec_options or GuardExecutionOptions(num_reasks=num_reasks)

    def run(self, prompt: str, **kwargs) -> str:
        """Run LLM with prompt and return output.

        Args:
            prompt: Prompt to use
            **kwargs: Additional arguments

        Returns:
            LLM output string
        """
        if self.api is None:
            raise ValueError("LLM API not provided")

        # Call LLM API
        output = self.api(prompt, **kwargs)

        # Validate output (simplified - would integrate with validators)
        if isinstance(output, str):
            return output
        if hasattr(output, "content"):
            return str(output.content)
        return str(output)

    def __call__(self, prompt: str, **kwargs) -> str:
        """Call runner with prompt."""
        return self.run(prompt, **kwargs)

