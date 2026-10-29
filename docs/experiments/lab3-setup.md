# Лабораторная 3: воспроизводимый запуск

Python 3.12. Ветки каждой роли основаны на main; нужные материалы незамерженных
веток лабы 2 включены как документированные зависимости, без слияния их веток целиком.

```powershell
python -m venv .venv
.venv/Scripts/Activate.ps1
pip install -r requirements-ai.txt
ollama pull qwen2.5:3b
```

Ollama должен быть запущен (`ollama serve` в отдельном терминале).
Создать локальный `.env` из этих значений; секреты не коммитить:

```dotenv
LLM_PROVIDER=ollama
LLM_MODEL=qwen2.5:3b
OLLAMA_BASE_URL=http://127.0.0.1:11434
AI_CALL_TIMEOUT=120
AI_DEADLINE=245
AI_OPERATION_TIMEOUT=600
AI_TRACE_CONTENT=false
AI_API_TOKENS={"replace-with-local-random-token":"expert-1"}
```

```powershell
python -m pytest -q
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --workers 1
```

Swagger: http://127.0.0.1:8000/docs. Передать Bearer token и отдельный
`Idempotency-Key` для каждой операции. Запрос:

```json
{"text":"Вебинар «Границы» 20 ноября 2026 в 18:00. Онлайн в Zoom. Бесплатно. Запись в личные сообщения.","reference_date":"2026-10-29","timezone":"Europe/Moscow"}
```

Порядок: POST `/v1/ai/extractions` → при отсутствии blocking issues POST
`/v1/events/{id}/confirm` с candidate_id и expected_version=1 → POST
`/v1/events/{id}/ai/generations` с expected_version=2, platforms,
tone и preferred_mode. Для правки — `/v1/events/{id}/ai/patches`, затем подтверждение.
Неизменённые поля сохраняются; старые версии отвергаются 409.
Результаты всегда черновики: публикационных методов в сервисе нет.

SQLite (`data/ai.sqlite`) хранит карточки и ключи идемпотентности. Для учебного
сервиса нужен один worker; глобальный asyncio lock сериализует операции, включая
ожидание LLM. Для нескольких workers нужно заменить это общим хранилищем резервов.
Неизвестный владелец получает 404. Bearer token mapping — локальная заглушка
авторизации Delivery, не production identity provider.

Полный эксперимент:

```powershell
python -m ml.experiment --dataset docs/golden-dataset/v1.jsonl --split all --repeats 3 --generate --output docs/experiments/lab3-run
```

JSONL содержит ответ каждого запроса, CSV — latency и токены, run.json — версии,
хэш датасета и параметры. Только синтетические учебные данные можно коммитить.
Данные из test split открываются только для итогового прогона; обращения фиксируются
в отчёте. Для разработки использовать `--split dev`.
