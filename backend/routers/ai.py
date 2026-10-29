"""Lab 2 contract, durable owner-scoped state, version CAS and idempotency.

Teaching service: run ONE uvicorn worker. An asyncio lock serializes mutations
across provider awaits; SQLite persists successful operations across restarts.
Production requires shared reservations, tenant auth and a database migration.
"""
import asyncio
import copy
import hashlib
import json
import os
import secrets
import sqlite3
import time
from pathlib import Path
from uuid import UUID, uuid4
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

from fastapi import APIRouter, Request
from jsonschema import ValidationError

from ml.contracts import validate
from ml.models.baseline import Baseline, ModelError, zero_usage
from ml.tracing import tracer

router = APIRouter()


class ApiError(Exception):
    def __init__(self, status, code, message, retryable=False):
        self.status, self.code, self.message, self.retryable = status, code, message, retryable


class Store:
    def __init__(self, path):
        Path(path).parent.mkdir(parents=True, exist_ok=True)
        self.db = sqlite3.connect(path)
        self.db.execute("CREATE TABLE IF NOT EXISTS events (id TEXT PRIMARY KEY, owner TEXT, body TEXT)")
        self.db.execute("CREATE TABLE IF NOT EXISTS idem (key TEXT PRIMARY KEY, hash TEXT, body TEXT, created REAL)")
        self.db.commit()
        self.lock = asyncio.Lock()

    def get(self, event_id, owner):
        row = self.db.execute("SELECT body FROM events WHERE id=? AND owner=?", (event_id, owner)).fetchone()
        if row is None:
            raise ApiError(404, "NOT_FOUND", "Мероприятие не найдено")
        return json.loads(row[0])

    def save(self, event_id, owner, record):
        self.db.execute("INSERT OR REPLACE INTO events VALUES (?,?,?)", (event_id, owner, json.dumps(record)))


def owner(request):
    provided = request.headers.get("Authorization", "").removeprefix("Bearer ")
    tokens = json.loads(os.getenv("AI_API_TOKENS", "{}"))
    for token, tenant in tokens.items():
        if provided and secrets.compare_digest(token, provided):
            return tenant
    raise ApiError(401, "UNAUTHENTICATED", "Требуется Bearer token")


async def body(request, name):
    # Enforce byte limit before parsing JSON; chunked requests are bounded as well.
    raw = bytearray()
    async for chunk in request.stream():
        raw.extend(chunk)
        if len(raw) > 100000:
            raise ApiError(413, "PAYLOAD_TOO_LARGE", "Слишком большой запрос")
    try:
        data = json.loads(raw)
        validate(name, data)
        if "timezone" in data:
            ZoneInfo(data["timezone"])
        if "platforms" in data and len(set(data["platforms"])) != len(data["platforms"]):
            raise ValueError("duplicate platform")
        return data
    except (ValueError, ValidationError, ZoneInfoNotFoundError):
        raise ApiError(422, "VALIDATION_ERROR", "Запрос не соответствует контракту") from None


def candidate(result, version):
    return dict(candidate_id=str(uuid4()), base_version=version, event=result["event"],
        changes=result.get("changes", []), issues=result["issues"],
        status="needs_clarification" if any(x["blocking"] for x in result["issues"]) else "awaiting_confirmation")


def check_version(record, expected):
    if record["version"] != expected:
        raise ApiError(409, "CONFLICT", "Версия устарела")


async def mutation(request, schema_name, response_name, operation):
    tenant = owner(request)
    data = await body(request, schema_name)
    key = request.headers.get("Idempotency-Key", "")
    if not 1 <= len(key) <= 128:
        raise ApiError(422, "VALIDATION_ERROR", "Нужен Idempotency-Key длиной 1..128")
    store = request.app.state.store
    digest = hashlib.sha256(json.dumps(data, sort_keys=True).encode()).hexdigest()
    scope = json.dumps([tenant, request.url.path, key])
    async with store.lock:
        store.db.execute("DELETE FROM idem WHERE created < ?", (time.time() - 86400,))
        row = store.db.execute("SELECT hash,body FROM idem WHERE key=?", (scope,)).fetchone()
        if row:
            if row[0] != digest:
                raise ApiError(409, "CONFLICT", "Ключ повторно использован с другим запросом")
            response = json.loads(row[1])
            response["request_id"] = request.state.request_id
            if "usage" in response:
                response["usage"] = zero_usage() | {"cache_hit": True}
            return response
        try:
            async with asyncio.timeout(float(os.getenv("AI_OPERATION_TIMEOUT", "60"))):
                with tracer.start_as_current_span("api-operation") as span:
                    span.set_attribute("request_id", request.state.request_id)
                    response = await operation(tenant, data, store)
            validate(response_name, response)
            store.db.execute("INSERT INTO idem VALUES (?,?,?,?)", (scope, digest, json.dumps(response), time.time()))
            store.db.commit()
            return response
        except TimeoutError:
            store.db.rollback()
            raise ApiError(503, "DEADLINE_EXCEEDED", "Превышен срок операции", True) from None
        except ModelError as exc:
            store.db.rollback()
            raise ApiError(503, "MODEL_UNAVAILABLE", exc.code, exc.retryable) from None
        except Exception:
            store.db.rollback()
            raise


@router.post("/v1/ai/extractions")
async def extract(request: Request):
    async def operation(tenant, data, store):
        result = await request.app.state.model.extract(**data)
        event_id = str(uuid4())
        proposal = candidate(result, 1)
        record = dict(event=result["event"], version=1, status="draft", candidate=proposal, created=time.time())
        store.save(event_id, tenant, record)
        return dict(request_id=request.state.request_id, event_id=event_id, event_version=1,
                    mode="standard", candidate=proposal, usage=result["usage"])
    return await mutation(request, "ExtractionRequest", "ExtractionResponse", operation)


@router.post("/v1/events/{event_id}/ai/patches")
async def patch(event_id: UUID, request: Request):
    async def operation(tenant, data, store):
        record = store.get(str(event_id), tenant)
        check_version(record, data["expected_version"])
        result = await request.app.state.model.patch(record["event"], data["text"], data["reference_date"], data["timezone"])
        proposal = candidate(result, record["version"])
        record.update(candidate=proposal, created=time.time())
        store.save(str(event_id), tenant, record)
        return dict(request_id=request.state.request_id, event_id=str(event_id), mode="standard",
                    candidate=proposal, usage=result["usage"])
    return await mutation(request, "PatchRequest", "PatchResponse", operation)


@router.post("/v1/events/{event_id}/confirm")
async def confirm(event_id: UUID, request: Request):
    async def operation(tenant, data, store):
        record = store.get(str(event_id), tenant)
        check_version(record, data["expected_version"])
        proposal = record["candidate"]
        if proposal is None or proposal["candidate_id"] != data["candidate_id"] or time.time() - record["created"] > 86400:
            raise ApiError(409, "CONFLICT", "Кандидат устарел")
        if proposal["status"] != "awaiting_confirmation":
            raise ApiError(422, "VALIDATION_ERROR", "Сначала уточните обязательные поля")
        record.update(event=proposal["event"], version=record["version"] + 1, status="confirmed", candidate=None)
        store.save(str(event_id), tenant, record)
        return dict(request_id=request.state.request_id, event_id=str(event_id),
                    version=record["version"], event=record["event"], status=record["status"])
    return await mutation(request, "ConfirmRequest", "EventRecord", operation)


@router.post("/v1/events/{event_id}/ai/generations")
async def generate(event_id: UUID, request: Request):
    async def operation(tenant, data, store):
        record = store.get(str(event_id), tenant)
        check_version(record, data["expected_version"])
        if record["status"] != "confirmed":
            raise ApiError(422, "VALIDATION_ERROR", "Требуется подтверждённая карточка")
        result = await request.app.state.model.generate(record["event"], data["platforms"], data["tone"], data["preferred_mode"])
        return dict(request_id=request.state.request_id, event_id=str(event_id), event_version=record["version"],
                    status="draft_content", **result)
    return await mutation(request, "GenerateRequest", "GenerateResponse", operation)


@router.get("/v1/events/{event_id}")
async def get_event(event_id: UUID, request: Request):
    tenant = owner(request)
    record = request.app.state.store.get(str(event_id), tenant)
    return dict(request_id=request.state.request_id, event_id=str(event_id), version=record["version"],
                event=record["event"], status=record["status"])
