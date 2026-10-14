# event-platform

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
- **Frontend:** JavaScript-фреймворк (выбор в процессе)
- **База данных:** PostgreSQL 16
- **ИИ:** LLM API
- **Инфраструктура:** Docker, Docker Compose
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

Удалить данные БД: `docker compose down -v`.

---

## Структура репозитория

```text
event-platform/
├── apps/
│   └── site/                    # Фронтенд
│       ├── public/              # Статика (index.html)
│       └── src/                 # Исходники
│           ├── api/             # Клиент к backend-сервисам
│           ├── components/      # Переиспользуемые компоненты
│           ├── hooks/           # React-хуки
│           ├── pages/           # Страницы (дашборд, страница мероприятия)
│           ├── renderer/        # Рендер блоков страницы
│           └── styles/          # Стили
│
├── services/                    # Backend-сервисы
│   ├── extractor/               # Извлечение даты/места/цены из анонса
│   ├── page-composer/           # Сборка страницы из блоков
│   ├── vk-publisher/            # Публикация поста в VK
│   └── mailer/                  # Email-рассылка
│
├── libs/
│   └── shared-types/            # Общие типы данных (Event, Block)
│
├── docs/
│   ├── deploy.md                # Инструкция по деплою
│   ├── onboarding.md            # Гайд для новых участников
│   ├── research.md              # Исследование: проблема, аудитория, аналоги
│   ├── model-candidates.md      # Сравнение LLM-моделей и инфраструктуры
│   └── experiments/             # Эксперименты и отчёты
│       ├── lab1.md
│       ├── lab1-experiments.ipynb
│       ├── examples.md
│       └── prompts.md
│
├── scripts/                     # Вспомогательные скрипты
│
├── .github/
│   ├── ISSUE_TEMPLATE/          # Шаблоны issue
│   ├── workflows/ci.yml         # CI: линт, проверки, тесты
│   └── PULL_REQUEST_TEMPLATE.md # Шаблон PR
│
├── .env.example                 # Шаблон переменных окружения
├── .gitignore
├── compose.yml                  # Default entrypoint (include → compose.dev.yml)
├── compose.dev.yml              # Docker Compose для dev-среды
├── Dockerfile                   # Сборка статики (Nginx)
├── CONTRIBUTING.md              # Правила веток и PR
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
- [ ] C4-диаграммы и ADR
- [ ] AACT-конфиг
- [ ] Прототип UI
- [ ] Схема данных (ERD + schema.sql)
- [ ] Compose-скелет v2
- [ ] Реализация сервисов

---

## Лицензия

TBD
