import json
import pytest
import httpx
from ml.models.baseline import Baseline, ModelError, apply_changes, check_event, zero_usage, calendar_conflicts
from ml.contracts import EXTRACTION

EVENT = dict(title="Встреча", description="Обсуждение", date_start="2026-11-20", date_end=None,
             time_start="18:00", venue="Москва, ул. Мира, 5", price=1000,
             price_discount=None, registration="в личные сообщения")


@pytest.fixture
def local(monkeypatch):
    monkeypatch.setenv("LLM_PROVIDER", "ollama")
    monkeypatch.setenv("LLM_MODEL", "qwen2.5:3b")
    return Baseline()


async def test_invalid_json_retries_and_counts_both_attempts(local):
    calls = []
    async def request(messages, schema):
        calls.append(1)
        u = zero_usage() | dict(input_tokens=10, output_tokens=3, attempts=1, model_ids=["fake"])
        return ("oops" if len(calls) == 1 else json.dumps(dict(event=EVENT, issues=[]))), u
    local._request = request
    result = await local.extract("Встреча", "2026-10-29", "Europe/Moscow")
    assert result["usage"]["attempts"] == 2
    assert result["usage"]["input_tokens"] == 20
    assert len(calls) == 2


async def test_quota_not_retried(local):
    calls = []
    async def request(messages, schema):
        calls.append(1)
        response = httpx.Response(429, text='{"error":{"code":"insufficient_quota"}}', request=httpx.Request("POST", "http://localhost/"))
        raise httpx.HTTPStatusError("quota", request=response.request, response=response)
    local._request = request
    with pytest.raises(ModelError, match="QUOTA_EXHAUSTED"):
        await local.extract("Текст", "2026-10-29", "Europe/Moscow")
    assert len(calls) == 1


async def test_refusal_is_error(local):
    async def request(messages, schema):
        return None, zero_usage() | {"attempts": 1}
    local._request = request
    with pytest.raises(ModelError, match="REFUSAL"):
        await local.call("extract", "test", {}, EXTRACTION)


def test_patch_preserves_omitted_fields_and_checks_evidence():
    change = dict(field="time_start", operation="set", value="20:00", evidence="в 20:00")
    result = apply_changes(EVENT, [change], "Перенесём в 20:00")
    assert result == EVENT | {"time_start": "20:00"}
    assert EVENT["time_start"] == "18:00"
    with pytest.raises(ModelError):
        apply_changes(EVENT, [change, change], "в 20:00")
    with pytest.raises(ModelError):
        apply_changes(EVENT, [change], "Без изменений")
    with pytest.raises(ModelError):
        apply_changes(EVENT, [dict(field="venue", operation="clear", value=None, evidence="место то же")], "место то же")


def test_zero_is_known_price_and_calendar_checks():
    assert check_event(EVENT | {"price": 0}, "2026-10-29") == []
    codes = {x["code"] for x in check_event(EVENT | {"date_end": "2026-10-01"}, "2026-11-25")}
    assert {"PAST_DATE", "END_BEFORE_START"} <= codes


def test_explicit_weekday_conflict_does_not_change_year():
    assert calendar_conflicts("25 ноября 2026, вторник", "2026-10-29")[0]["code"] == "DATE_CONFLICT"
    assert calendar_conflicts("25 ноября, вторник", "2026-10-29")[0]["code"] == "DATE_CONFLICT"
    assert calendar_conflicts("25 ноября 2026, среда", "2026-10-29") == []
