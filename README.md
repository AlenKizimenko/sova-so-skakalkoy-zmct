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

- **Backend:** Python, FastAPI
- **Frontend:** Next.js, React, Tailwind CSS, shadcn/ui (прототип)
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
docker compose up -d
```

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

**Стек:** Next.js, React, Tailwind CSS, shadcn/ui.

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
├── apps/
│   └── site/                    # Фронтенд
│       ├── public/              # Статика (index.html)
│       └── src/
│           ├── api/
│           ├── components/
│           ├── hooks/
│           ├── pages/
│           ├── renderer/
│           └── styles/
│
├── services/                    # Backend-сервисы
│   ├── extractor/               # Извлечение даты/места/цены
│   ├── page-composer/           # Сборка страницы из блоков
│   ├── vk-publisher/            # Публикация в VK
│   └── mailer/                  # Email-рассылка
│
├── libs/
│   └── shared-types/            # Общие типы (Event, Block)
│
├── frontend/                    # Прототип UI
│   └── prototype/               # Next.js-прототип (v0)
│       ├── app/                 # Страницы (expert, public)
│       ├── components/          # Компоненты экранов
│       ├── lib/                 # Утилиты
│       ├── public/              # Статика прототипа
│       └── screenshots/         # Скриншоты экранов
│
├── database/                    # Схема БД
│   ├── schema.sql
│   └── migrations/
│       └── 001_initial.sql
│
├── docs/
│   ├── architecture/            # C4-диаграммы
│   │   ├── context.puml
│   │   ├── container.puml
│   │   └── erd.puml
│   ├── adr/                     # Architecture Decision Records
│   │   ├── 001-postgresql.md
│   │   ├── 002-microservices.md
│   │   ├── 003-docker-compose.md
│   │   ├── 004-plantuml-c4.md
│   │   └── 005-aact.md
│   ├── experiments/             # Эксперименты и отчёты
│   │   ├── lab1.md
│   │   ├── lab1-experiments.ipynb
│   │   ├── examples.md
│   │   └── prompts.md
│   ├── quality/                 # Quality & Safety
│   │   ├── dod-draft.md
│   │   ├── golden-dataset-plan.md
│   │   ├── success-criteria.md
│   │   └── v0.1-draft.jsonl
│   ├── brief.md
│   ├── deploy.md
│   ├── glossary.md
│   ├── hypotheses.md
│   ├── insights.md
│   ├── model-candidates.md
│   ├── onboarding.md
│   ├── prd.md
│   └── research.md
│
├── scripts/                     # Вспомогательные скрипты
│
├── .github/
│   ├── ISSUE_TEMPLATE/
│   ├── workflows/ci.yml
│   └── PULL_REQUEST_TEMPLATE.md
│
├── .env.example
├── .gitignore
├── aact.config.ts               # Конфиг AACT
├── compose.yml                  # Default entrypoint (include → compose.dev.yml)
├── compose.dev.yml              # Docker Compose для dev-среды
├── Dockerfile
├── CONTRIBUTING.md
└── README.md
```

---

## Документация

### Инфраструктура и правила

- [docs/deploy.md](docs/deploy.md) — инструкция по деплою
- [docs/onboarding.md](docs/onboarding.md) — гайд для новых участников
- [CONTRIBUTING.md](CONTRIBUTING.md) — правила веток и PR

### Исследование

| Материал | Содержание |
| --- | --- |
| [docs/research.md](docs/research.md) | Проблема, аудитория, аналоги, подходы и ограничения |
| [docs/model-candidates.md](docs/model-candidates.md) | Сравнение моделей, оценка токен-бюджета и варианты инфраструктуры |
| [docs/experiments/lab1.md](docs/experiments/lab1.md) | Методология, примеры ответов, ограничения и предварительные выводы |
| [docs/experiments/lab1-experiments.ipynb](docs/experiments/lab1-experiments.ipynb) | Код пробных API-вызовов и расчёт задержки и стоимости |
| [docs/experiments/examples.md](docs/experiments/examples.md) | Четыре сценария для проверки |
| [docs/experiments/prompts.md](docs/experiments/prompts.md) | Шаблоны извлечения данных и генерации текстов |

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

Прод: https://event-platform-tanoss.amvera.io

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
- [ ] Реализация сервисов

---

## Лицензия

TBD