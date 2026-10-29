# UI Prototype

Прототип ключевых экранов event-platform, сгенерированный агентом v0.

## Экраны

| Экран | Файл | Скриншот |
|---|---|---|
| Форма ввода анонса | `app/page.tsx` | `screenshots/announcement-form.png` |
| Дашборд эксперта | — | `screenshots/dashboard.png` |
| Публичная страница мероприятия | — | `screenshots/event-page.png` |
| Форма регистрации на мероприятие | — | `screenshots/register-form.png` |
| Личный кабинет эксперта | — | `screenshots/expert-cabinet.png` |

## Как посмотреть

### Способ 1. Скриншоты (быстро)

Открой папку `screenshots/` — там PNG-файлы каждого экрана. Ничего запускать не надо.

### Способ 2. Запустить локально

Требования:
- Node.js 18+

Шаги:

```bash
cd frontend/prototype
npm install
npm run dev
```

Открой http://localhost:3000 в браузере.

Остановить: `Ctrl+C` в терминале.

### Способ 3. Посмотреть в v0

Открой проект в https://v0.app — там вкладка **Preview** показывает живой прототип.

## Структура

```text
frontend/prototype/
├── app/                    # Страницы (Next.js App Router)
├── components/             # React-компоненты
│   ├── ui/                 # Базовые UI-компоненты (shadcn/ui)
│   └── ...                 # Компоненты экранов
├── lib/                    # Утилиты
├── public/                 # Статика
├── screenshots/            # Скриншоты экранов
├── package.json            # Зависимости
├── tailwind.config.ts      # Конфиг Tailwind
└── README.md
```

## Технологии

- **React** — UI-библиотека
- **Next.js** — фреймворк
- **Tailwind CSS** — стили
- **shadcn/ui** — готовые компоненты

## Что дальше

Это **прототип**, а не финальный код. Реальная реализация будет в `apps/site/`.

Прототип нужен для:
- Согласования дизайна с командой.
- Быстрой проверки идей.
- Основа для реальной вёрстки.