# Agent Workflow

Отчёт по агентной разработке (лаба 3).

## Что генерировал агент

| Что | Агент | Результат |
|---|---|---|
| Прототип UI (5 экранов) | v0 | `frontend/prototype/` |
| Подключение форм к API | Claude | `frontend/lib/api.ts`, `frontend/lib/adapters.ts` |
| Бэкенд (4 FastAPI-сервиса) | Claude | `services/extractor/`, `services/page-composer/`, `services/vk-publisher/`, `services/mailer/` |

## Что чинил вручную

| Проблема | Что было | Что сделал |
|---|---|---|
| CORS | Бэкенд не пускал фронт | Добавил `CORSMiddleware` во все `main.py` |
| Форматы данных | Фронт ждёт `{day, time}`, бэк отдаёт ISO | Написал `adapters.ts` |
| Env | `VITE_API_URL` от старого фронта | Заменил на `NEXT_PUBLIC_*`, объединил `.env.example` |
| Модели БД | Моделей не было | Создал 5 моделей SQLAlchemy |
| Сохранение | `POST /extract` не писал в БД | Добавил `db.add(event)` + `commit()` |
| Dockerfile | `frontend/Dockerfile` отсутствовал | Создал multi-stage сборку |
| Amvera | `Dockerfile` был под Nginx | Переписал под Next.js, добавил `amvera.yml` |

## Выводы

- Агент генерирует каркас быстро, но **не знает контекста** (форматы данных, структура проекта).
- Переходник (`adapters.ts`) — ключ к связке фронтенда и бэкенда.
- Ревью обязательно: ~30% кода требует правок (CORS, валидация, форматы).
- Для БД модели и миграции **лучше писать вручную** — агент путается в связях.