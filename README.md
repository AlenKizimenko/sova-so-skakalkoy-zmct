# event-platform

[![CI](https://github.com/vstu-sii/sova-so-skakalkoy-zmct/actions/workflows/ci.yml/badge.svg)](https://github.com/vstu-sii/sova-so-skakalkoy-zmct/actions/workflows/ci.yml)

Платформа для экспертов: один анонс — сайт мероприятия + пост во ВК + email-рассылка.

## О проекте

Эксперт пишет анонс мероприятия один раз. Система:

- извлекает из текста дату, место и цену (`services/extractor`);
- собирает страницу мероприятия из готовых блоков (`services/page-composer`);
- публикует пост в VK-группе эксперта (`services/vk-publisher`);
- делает email-рассылку по подписчикам (`services/mailer`).

Результат: эксперт не тратит часы на ручное размещение, данные о мероприятии на всех площадках совпадают, под каждую площадку форматирование подбирается индивидуально.

## Стек

- **Backend:** Python, FastAPI
- **Frontend:** JavaScript-фреймворк (выбор в процессе)
- **База данных:** PostgreSQL 16
- **ИИ:** LLM API
- **Инфраструктура:** Docker, Docker Compose
- **CI:** GitHub Actions

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
│   └── onboarding.md            # Гайд для новых участников
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
├── compose.dev.yml              # Docker Compose для dev-среды
├── Dockerfile                   # Сборка статики (Nginx)
├── CONTRIBUTING.md              # Правила веток и PR
├── README.md
└── compose.yml
```

### Требования

- Docker Desktop 24.0+
- Docker Compose 2.20+
- Git

### Роли

| Имя | GitHub | Роль |
|-----|--------|------|
| Анастасия Юмаева | @nestikkk | Product / VO |
| Кизименко Алёна | @AlenKizimenko | AI engineer |
| Ларина Татьяна | @Thanoss-blip | Delivery |
| Казакова Мария | @OVENAsHome | Quality & safety |

## Демо

Прод: https://event-platform-tanoss.amvera.io

### Запуск

```bash
git clone https://github.com/vstu-sii/sova-so-skakalkoy-zmct.git
cd sova-so-skakalkoy-zmct
docker compose up -d

