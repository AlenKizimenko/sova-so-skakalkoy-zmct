from datetime import date
import pytest
from jsonschema import Draft202012Validator, FormatChecker
from ml.contracts import SCHEMAS, ROOT
from ml.dataset import load_dataset, expected_projection


def validate_dataset(path):
    rows = load_dataset(path)
    assert rows
    event_schema = dict(SCHEMAS["Event"])
    event_schema.pop("required")
    validator = Draft202012Validator(event_schema, format_checker=FormatChecker())
    for row in rows:
        date.fromisoformat(row["published_at"])
        assert row["input"]["text"].strip()
        expected, fields = expected_projection(row)
        validator.validate(expected)
        assert fields and set(fields) <= set(expected)
        assert row["split"] in ("dev", "test", "needs_context")
    return rows


def test_v2_schema_and_ci_splits():
    path = ROOT / "docs/quality/golden-dataset"
    assert len(validate_dataset(path / "v2.jsonl")) == 53
    mini = validate_dataset(path / "ci.jsonl")
    assert all(row["split"] == "dev" for row in mini)
    assert any(row.get("attack") for row in mini)


def test_broken_dataset_rejected(tmp_path):
    path = tmp_path / "bad.jsonl"
    path.write_text('{"id":"broken"}\n', encoding="utf-8")
    with pytest.raises((KeyError, AssertionError)):
        validate_dataset(path)
