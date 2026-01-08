"""Pydantic schema conversion utilities."""

from typing import Any, Dict, List, Type, Union, get_origin, get_args
import json

try:
    from pydantic import BaseModel
    from pydantic._internal._config import ConfigWrapper
    from pydantic.fields import FieldInfo

    PYDANTIC_AVAILABLE = True
except ImportError:
    PYDANTIC_AVAILABLE = False
    BaseModel = None  # type: ignore

from wall_library.logger import logger
from wall_library.classes.schema.processed_schema import ProcessedSchema
from wall_library.classes.schema.model_schema import ModelSchema


def pydantic_model_to_schema(
    model: Union[Type[BaseModel], List[Type[BaseModel]]]
) -> Dict[str, Any]:
    """Convert Pydantic model to JSON schema.

    Args:
        model: Pydantic model class or list of models

    Returns:
        JSON schema dictionary
    """
    if not PYDANTIC_AVAILABLE:
        raise ImportError("Pydantic is required for this functionality")

    if isinstance(model, list):
        # Handle list of models
        if len(model) == 1:
            model = model[0]
        else:
            # Union or list of models
            schemas = [pydantic_model_to_schema(m) for m in model]
            return {"anyOf": schemas}

    if isinstance(model, type) and issubclass(model, BaseModel):
        try:
            # Use Pydantic's built-in schema generation
            schema = model.model_json_schema()
            return schema
        except Exception as e:
            logger.warning(f"Failed to generate schema from Pydantic model: {e}")
            # Fallback to basic schema
            return {
                "type": "object",
                "properties": {},
            }
    else:
        raise ValueError(f"Invalid Pydantic model: {model}")

