import copy
import json
import pytest
from fastapi.testclient import TestClient
from backend.main import app
from ml.contracts import validate
from ml.models.baseline import zero_usage
from tests.test_baseline import EVENT


class FakeModel:
    calls = 0

    async def extract(self, **kwargs):
        self.calls += 1
        return dict(event=copy.deepcopy(EVENT), issues=[], usage=zero_usage())

    async def close(self):
        pass


@pytest.fixture
def client(tmp_path, monkeypatch):
    monkeypatch.setenv("AI_DB_PATH", str(tmp_path / "ai.sqlite"))
    monkeypatch.setenv("AI_API_TOKENS", json.dumps({"test-a": "owner-a", "test-b": "owner-b"}))
    with TestClient(app) as c:
        app.state.model = FakeModel()
        yield c


HEADERS = {"Authorization": "Bearer test-a", "Idempotency-Key": "extraction-1"}
BODY = dict(text="Тест", reference_date="2026-10-29", timezone="Europe/Moscow")


def test_auth_validation_and_no_model_call(client):
    assert client.post("/v1/ai/extractions", json=BODY).status_code == 401
    assert client.post("/v1/ai/extractions", json=BODY | {"timezone": "wrong"}, headers=HEADERS).status_code == 422
    assert client.post("/v1/ai/extractions", json=BODY | {"extra": 1}, headers=HEADERS).status_code == 422
    assert app.state.model.calls == 0


def test_idempotency_owner_and_confirm_cas(client):
    first = client.post("/v1/ai/extractions", json=BODY, headers=HEADERS).json()
    validate("ExtractionResponse", first)
    again = client.post("/v1/ai/extractions", json=BODY, headers=HEADERS).json()
    assert first["event_id"] == again["event_id"]
    assert first["request_id"] != again["request_id"]
    assert again["usage"]["cache_hit"] is True
    assert app.state.model.calls == 1
    assert client.post("/v1/ai/extractions", json=BODY | {"text": "Другой"}, headers=HEADERS).status_code == 409
    event_path = "/v1/events/" + first["event_id"]
    assert client.get(event_path, headers={"Authorization": "Bearer test-b"}).status_code == 404
    generation = dict(expected_version=1, platforms=["vk"], tone="", preferred_mode="standard")
    assert client.post(event_path + "/ai/generations", json=generation, headers=HEADERS).status_code == 422
    confirm = dict(candidate_id=first["candidate"]["candidate_id"], expected_version=1)
    response = client.post(event_path + "/confirm", json=confirm, headers=HEADERS)
    assert response.status_code == 200
    validate("EventRecord", response.json())
    assert response.json()["version"] == 2
    assert client.post(event_path + "/confirm", json=confirm, headers=HEADERS | {"Idempotency-Key": "new"}).status_code == 409
