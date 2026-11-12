import asyncio
from unittest.mock import AsyncMock

import pytest

from ml.prompts_v2 import ExtractionCache
from ml.tools import invoke


@pytest.mark.asyncio
async def test_calendar_checks_permission_before_execution(monkeypatch):
    resolver = AsyncMock(return_value="2025-11-15")
    monkeypatch.setattr("ml.tools.resolve_weekday", resolver)
    response = await invoke("resolve_weekday", {}, allowed=set())
    assert response == {"status": "denied", "date": None}
    resolver.assert_not_awaited()


@pytest.mark.asyncio
async def test_calendar_date_and_timeout(monkeypatch):
    arguments = dict(reference_date="2025-11-14", timezone="Europe/Moscow", weekday="субботу")
    allowed = {"resolve_weekday"}
    assert await invoke("resolve_weekday", arguments, allowed=allowed) == {
        "status": "ok", "date": "2025-11-15"
    }

    async def slow(**kwargs):
        await asyncio.sleep(1)

    monkeypatch.setattr("ml.tools.resolve_weekday", slow)
    assert await invoke("resolve_weekday", arguments, allowed=allowed, timeout=0.001) == {
        "status": "timeout", "date": None
    }


@pytest.mark.asyncio
async def test_cache_isolation_and_zero_provider_usage():
    class Model:
        provider = "ollama"
        model = "qwen2.5:3b"
        extract = AsyncMock(side_effect=lambda *args: {"event": {"title": "Лекция"}, "usage": {}})

    model = Model()
    cache = ExtractionCache(model)
    args = dict(text="Лекция", reference_date="2025-11-14", timezone="Europe/Moscow")
    first = await cache.extract(scope="owner-a", **args)
    first["event"]["title"] = "Изменено после чтения"
    hit = await cache.extract(scope="owner-a", **args)
    assert hit["event"]["title"] == "Лекция"
    assert hit["usage"]["cache_hit"] and hit["usage"]["attempts"] == 0
    await cache.extract(scope="owner-b", **args)
    await cache.extract(scope="owner-a", **(args | {"reference_date": "2025-11-15"}))
    assert model.extract.await_count == 3
