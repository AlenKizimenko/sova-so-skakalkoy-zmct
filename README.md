# event-platform

В ветке лабораторной 3 реализован локальный AI baseline на Qwen 2.5 3B:
FastAPI, Structured Outputs, ограниченные повторы и OpenTelemetry-трассировка.
Запуск: [lab3-setup](docs/experiments/lab3-setup.md).
Выбор локальной модели: [ADR-006](docs/adr/006-local-baseline-lab3.md).
Материалы незамерженной лабы 2 включены в ветку как зависимости.
Ветка `feature/quality_lab3` добавляет evals, CI и golden dataset v2 поверх AI-кода.

[![CI](https://github.com/vstu-sii/sova-so-skakalkoy-zmct/actions/workflows/ci.yml/badge.svg)](https://github.com/vstu-sii/sova-so-skakalkoy-zmct/actions/workflows/ci.yml)

Платформа для экспертов: один анонс — сайт мероприятия + пост во ВК + email-рассылка.

---

## О проекте

Эксперт составляет один анонс, а затем вручную адаптирует его для соцсетей, рассылки и страницы мероприятия. При переносе встречи приходится повторно редактировать каждый вариант. Это отнимает время и создаёт риск расхождения дат, адресов и цен.

**event-platform** превращает свободный текст анонса в структурированные данные мероприятия и готовит на их основе материалы для разных каналов.

### Целевой сценарий

1. Эксперт вводит анонс в свободной форме.
2. Модель извлекает дату, время, место, стоимость и другие поля в JSON.
3. Неясные или противоречивые данные уточняются у эксперта.
4. На основе проверенных данных формируются тексты для выбранных каналов.
5. При изменении условий обновляется общая карточка мероприятия, затем — связанные тексты.

### Что делает система

- извлекает из текста дату, место и цену (`services/extractor`);
- собирает страницу мероприятия из готовых блоков (`services/page-composer`);
- публикует пост в VK-группе эксперта (`services/vk-publisher`);
- делает email-рассылку по подписчикам (`services/mailer`).

**Результат:** эксперт не тратит часы на ручное размещение, данные о мероприятии на всех площадках совпадают, под каждую площадку форматирование подбирается индивидуально.

---

## Стек

- **Backend:** Python 3.12, FastAPI
- **Frontend:** Next.js, React, Tailwind CSS, shadcn/ui
- **База данных:** PostgreSQL 16
- **Кеш и очередь:** Redis 7
- **ИИ:** LLM API
- **Инфраструктура:** Docker, Docker Compose, Nginx (API Gateway)
- **CI:** GitHub Actions

---

## Быстрый старт

### Требования

- Docker Desktop 24.0+
- Docker Compose 2.20+
- Git

### Запуск

```bash
git clone https://github.com/vstu-sii/sova-so-skakalkoy-zmct.git
cd sova-so-skakalkoy-zmct
cp .env.example .env
docker compose up -d --build
```

### Миграция БД

```bash
Get-Content database\migrations\001_initial.sql | docker compose exec -T db psql -U event_platform -d event_platform
```

Фронтенд: http://localhost:3000
Extractor API: http://localhost:8001/docs

### Остановка

```bash
docker compose down
```

Удалить данные БД и Redis: `docker compose down -v`.

---

## Архитектура

### C4-диаграммы

Проект описан по методологии **C4** в PlantUML:

- [docs/architecture/context.puml](docs/architecture/context.puml) — Context-диаграмма (L1): роли, система, внешние сервисы.
- [docs/architecture/container.puml](docs/architecture/container.puml) — Container-диаграмма (L2): сервисы, БД, Gateway, ACL и Repo-слои.
- [docs/architecture/erd.puml](docs/architecture/erd.puml) — ERD: сущности БД и связи.

Смотреть: [plantuml.com/plantuml/uml](https://www.plantuml.com/plantuml/uml/) — вставить содержимое `.puml`.

### ADR (Architecture Decision Records)

| № | Решение | Файл |
|---|---|---|
| 001 | PostgreSQL как база данных | [docs/adr/001-postgresql.md](docs/adr/001-postgresql.md) |
| 002 | Микросервисная архитектура | [docs/adr/002-microservices.md](docs/adr/002-microservices.md) |
| 003 | Docker Compose для dev | [docs/adr/003-docker-compose.md](docs/adr/003-docker-compose.md) |
| 004 | PlantUML + C4 для диаграмм | [docs/adr/004-plantuml-c4.md](docs/adr/004-plantuml-c4.md) |
| 005 | AACT для контроля архитектуры | [docs/adr/005-aact.md](docs/adr/005-aact.md) |

### AACT — контроль архитектуры

В проекте настроен **AACT** — проверка архитектурных правил из диаграммы.

```bash
npx -y aact check
```

Ожидаемый результат: **0 violations**.

Конфиг: [aact.config.ts](aact.config.ts).

---

## Прототип UI

Ключевые экраны сгенерированы агентом **v0** и лежат в репозитории как код:

[`frontend/prototype/`](frontend/prototype/)

| Экран | Скриншот |
|---|---|
| Форма ввода анонса | [announcement.png](frontend/prototype/screenshots/announcement.png) |
| Дашборд эксперта | [events.png](frontend/prototype/screenshots/events.png) |
| Публичная страница мероприятия | [event.png](frontend/prototype/screenshots/event.png) |
| Форма регистрации | [register.png](frontend/prototype/screenshots/register.png) |
| Личный кабинет эксперта | [profile.png](frontend/prototype/screenshots/profile.png) |

Подробнее: [frontend/prototype/README_PROTOTYPE.md](frontend/prototype/README_PROTOTYPE.md).

---

## Схема данных

Схема БД описана в SQL и ERD:

- [database/schema.sql](database/schema.sql) — полная схема (актуальная версия).
- [database/migrations/001_initial.sql](database/migrations/001_initial.sql) — первая миграция.
- [docs/architecture/erd.puml](docs/architecture/erd.puml) — ERD в PlantUML.

**Таблицы:**

| Таблица | Назначение |
|---|---|
| `experts` | Эксперты платформы |
| `events` | Мероприятия |
| `pages` | Собранные страницы мероприятий |
| `publications` | Публикации (VK, email, site) |
| `subscribers` | Регистрации на мероприятия |

---

## Структура репозитория

```text
event-platform/
├── services/                    # Backend-сервисы
│   ├── extractor/
│   │   ├── main.py
│   │   ├── database.py
│   │   ├── requirements.txt
│   │   ├── Dockerfile
│   │   └── models/
│   ├── page-composer/
│   ├── vk-publisher/
│   └── mailer/
│
├── frontend/                    # Фронтенд (Next.js)
│   ├── app/
│   ├── components/
│   ├── lib/
│   ├── public/
│   ├── prototype/               # Прототип из лабы 2
│   ├── Dockerfile
│   └── package.json
│
├── database/
│   ├── schema.sql
│   ├── erd.puml
│   └── migrations/
│       └── 001_initial.sql
│
├── docs/
│   ├── architecture/
│   ├── adr/
│   ├── experiments/
│   ├── quality/
│   ├── agent-workflow.md
│   ├── deploy.md
│   └── onboarding.md
│
├── .github/
│   ├── ISSUE_TEMPLATE/
│   ├── workflows/ci.yml
│   └── PULL_REQUEST_TEMPLATE.md
│
├── .env.example
├── .gitignore
├── aact.config.ts
├── compose.dev.yml
├── compose.yml
├── CONTRIBUTING.md
└── README.md
```

---

## Документация

- [docs/deploy.md](docs/deploy.md) — инструкция по деплою
- [docs/onboarding.md](docs/onboarding.md) — гайд для новых участников
- [docs/agent-workflow.md](docs/agent-workflow.md) — отчёт агентной разработки
- [CONTRIBUTING.md](CONTRIBUTING.md) — правила веток и PR

---

## Команда

| Имя | GitHub | Роль |
|-----|--------|------|
| Анастасия Юмаева | [@nestikkk](https://github.com/nestikkk) | Product / VO |
| Алёна Кизименко | [@AlenKizimenko](https://github.com/AlenKizimenko) | AI Engineer |
| Татьяна Ларина | [@Thanoss-blip](https://github.com/Thanoss-blip) | Delivery |
| Мария Казакова | [@OVENAsHome](https://github.com/OVENAsHome) | Quality & Safety |

---

## Демо

Прод: https://tanya-lab.88-87-92-145.sslip.io/

Локально:
```bash
docker compose up -d --build
```
Фронтенд: http://localhost:3000
Extractor API: http://localhost:8001/docs

---

## Статус проекта

- [x] Каркас репозитория
- [x] Dev-окружение (Docker Compose)
- [x] CI-скелет
- [x] Hello-world в прод
- [x] C4-диаграммы и ADR
- [x] AACT-конфиг
- [x] Прототип UI
- [x] Схема данных (ERD + schema.sql)
- [x] Compose-скелет v2
- [x] Бэкенд и фронтенд (лаба 3)
- [x] БД с миграциями (лаба 3)
- [x] Compose всей системы (лаба 3)
- [x] Публичный деплой (сервер tanya-lab)

---

## Лицензия

TBD