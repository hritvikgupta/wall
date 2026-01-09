"""RAIL schema parsing utilities."""

from typing import Any, Dict, List
from pathlib import Path
from lxml import etree as ET

from wall_library.logger import logger
from wall_library.classes.schema.processed_schema import ProcessedSchema
from wall_library.classes.validation.validator_reference import ValidatorReference
from wall_library.types.on_fail import OnFailAction
from wall_library.utils.xml_utils import xml_to_string
from wall_library.utils.regex_utils import split_on
from wall_library.validator_base import get_validator


def parse_on_fail_handlers(element: ET._Element) -> Dict[str, OnFailAction]:
    """Parse on-fail handlers from XML element.

    Args:
        element: XML element

    Returns:
        Dictionary mapping validator names to on-fail actions
    """
    on_fail_handlers: Dict[str, OnFailAction] = {}
    for key, value in element.attrib.items():
        key = xml_to_string(key) or ""
        if key.startswith("on-fail-"):
            on_fail_handler_name = key[len("on-fail-") :]
            try:
                on_fail_handler = OnFailAction(value)
                on_fail_handlers[on_fail_handler_name] = on_fail_handler
            except ValueError:
                logger.warning(f"Invalid on-fail action: {value}")
    return on_fail_handlers


def get_validators_from_element(element: ET._Element) -> List:
    """Get validators from XML element.

    Args:
        element: XML element

    Returns:
        List of validator classes
    """
    validators_string: str = xml_to_string(element.attrib.get("validators", "")) or ""
    validator_specs = split_on(validators_string, ";")
    on_fail_handlers = parse_on_fail_handlers(element)
    validators = []

    for v_spec in validator_specs:
        validator_cls = get_validator(v_spec.strip())
        if not validator_cls:
            continue
        on_fail = on_fail_handlers.get(
            validator_cls.rail_alias.replace("/", "_"), OnFailAction.NOOP
        )
        validators.append((validator_cls, on_fail))

    return validators


def rail_file_to_schema(rail_file: str) -> ProcessedSchema:
    """Parse RAIL file to processed schema.

    Args:
        rail_file: Path to RAIL file

    Returns:
        ProcessedSchema instance
    """
    path = Path(rail_file)
    if not path.exists():
        raise FileNotFoundError(f"RAIL file not found: {rail_file}")

    with open(path, "r") as f:
        rail_string = f.read()

    return rail_string_to_schema(rail_string)


def rail_string_to_schema(rail_string: str) -> ProcessedSchema:
    """Parse RAIL string to processed schema.

    Args:
        rail_string: RAIL specification string

    Returns:
        ProcessedSchema instance
    """
    try:
        parser = ET.XMLParser(remove_blank_text=True)
        root = ET.fromstring(rail_string.encode(), parser=parser)

        processed_schema = ProcessedSchema()

        # Extract output schema
        output_element = root.find(".//output")
        if output_element is not None:
            schema_dict = _element_to_schema_dict(output_element)
            processed_schema.schema = schema_dict

            # Extract validators
            validators = get_validators_from_element(output_element)
            for validator_cls, on_fail in validators:
                processed_schema.add_validator(
                    validator_cls(), on="output", on_fail=on_fail
                )

        return processed_schema

    except ET.XMLSyntaxError as e:
        logger.error(f"Invalid RAIL XML: {e}")
        raise ValueError(f"Invalid RAIL specification: {e}")


def _element_to_schema_dict(element: ET._Element) -> Dict[str, Any]:
    """Convert XML element to schema dictionary."""
    schema: Dict[str, Any] = {}

    # Get element tag as type
    tag = element.tag
    schema["type"] = tag

    # Get attributes
    for key, value in element.attrib.items():
        if key != "validators" and not key.startswith("on-fail-"):
            schema[key.replace("-", "_")] = value

    # Get children
    if element.getchildren():
        if tag in ["object", "dict"]:
            schema["properties"] = {}
            for child in element:
                child_name = child.get("name", child.tag)
                schema["properties"][child_name] = _element_to_schema_dict(child)
        elif tag in ["array", "list"]:
            if element.getchildren():
                schema["items"] = _element_to_schema_dict(element[0])

    return schema


def json_schema_to_rail_output(schema: Dict[str, Any]) -> str:
    """Convert JSON schema to RAIL output (simplified).

    Args:
        schema: JSON schema dictionary

    Returns:
        RAIL output string
    """
    # Simplified conversion - full implementation would be more complex
    rail_type = schema.get("type", "string")
    return f"<{rail_type}/>"


