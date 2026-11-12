"""The Lab 2 OpenAPI file is the single source of public schemas."""
import json
from pathlib import Path
from jsonschema import Draft202012Validator, FormatChecker

ROOT = Path(__file__).resolve().parents[1]
CONTRACT = json.loads((ROOT / "api/openapi.yaml").read_text(encoding="utf-8-sig"))
SCHEMAS = CONTRACT["components"]["schemas"]


def validate(name, value):
    schema = {"$ref": f"#/components/schemas/{name}", "components": CONTRACT["components"]}
    Draft202012Validator(schema, format_checker=FormatChecker()).validate(value)
    return value


def inline(schema):
    """Resolve local refs for provider Structured Outputs."""
    if isinstance(schema, list):
        return [inline(x) for x in schema]
    if not isinstance(schema, dict):
        return schema
    if "$ref" in schema:
        return inline(SCHEMAS[schema["$ref"].split("/")[-1]])
    return {k: inline(v) for k, v in schema.items()}


def object_schema(properties):
    return {"type": "object", "properties": properties,
            "required": list(properties), "additionalProperties": False}


EXTRACTION = object_schema({"event": inline(SCHEMAS["Event"]), "issues": {
    "type": "array", "items": inline(SCHEMAS["Issue"])}})
PATCH = object_schema({"changes": {"type": "array", "items": inline(SCHEMAS["Change"])},
                       "issues": {"type": "array", "items": inline(SCHEMAS["Issue"])}})
PROSE = object_schema({"intro": {"type": "string", "maxLength": 800}})
