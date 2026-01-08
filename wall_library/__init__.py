"""Wall Library - Professional LLM Validation & Context Management Library."""

from wall_library.guard import WallGuard
from wall_library.async_guard import AsyncGuard
from wall_library.types.on_fail import OnFailAction
from wall_library.validator_base import Validator, register_validator
from wall_library.classes.validation_outcome import ValidationOutcome
from wall_library.prompt import Prompt, Instructions, Messages
from wall_library.version import __version__
from wall_library.settings import settings
from wall_library.logging import WallLogger, LogScope

__version__ = __version__

__all__ = [
    "WallGuard",
    "AsyncGuard",
    "OnFailAction",
    "Validator",
    "register_validator",
    "ValidationOutcome",
    "Prompt",
    "Instructions",
    "Messages",
    "settings",
    "WallLogger",
    "LogScope",
    "__version__",
]

# Optional visualization import
try:
    from wall_library.visualization import WallVisualizer
    __all__.append("WallVisualizer")
except ImportError:
    pass

