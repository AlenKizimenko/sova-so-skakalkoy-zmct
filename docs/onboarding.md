# Onboarding: как начать работу в проекте

Краткая инструкция для новых участников команды.

## 1. Установка и настройка Git

Установи Git: <https://git-scm.com/downloads>

Настрой один раз (имя и email — твои):

```bash
git config --global user.name "Твоё Имя"
git config --global user.email "твоя@почта.com"
```

## 2. Клонирование репозитория

```bash
git clone https://github.com/vstu-sii/sova-so-skakalkoy-zmct.git
cd sova-so-skakalkoy-zmct
```

## 3. Переключение на рабочую ветку

Если нужна не `main`, а другая ветка:

```bash
git checkout feature/repo-skeleton
```

Посмотреть все ветки (локальные и удалённые):

```bash
git branch -a
```

## 4. Настройка окружения

Подними окружение:

```bash
docker compose up -d
```

Проверь, что работает: <http://localhost:8080>

## 5. Ежедневный workflow

### Перед началом работы — забрать свежее

```bash
git fetch origin
git pull
```

### Создать ветку под задачу

```bash
git checkout -b feature/название-задачи
```

Префиксы: `feature/`, `fix/`, `docs/`, `chore/`.

### Работать, коммитить, пушить

```bash
git add .
git commit -m "feat: что сделал"
git push -u origin feature/название-задачи
```

### Если пуш отклонили (`rejected — fetch first`)

```bash
git fetch origin
git rebase origin/имя-твоей-ветки
git push
```

## 6. Создание Pull Request

1. Открой репозиторий на GitHub.
2. Нажми **Compare & pull request** рядом со свежей веткой.
3. Убедись: **base:** `main`, **compare:** твоя ветка.
4. Заполни шаблон PR.
5. Дождись минимум 1 approval и зелёного CI.
6. **Squash and merge**.
7. Удали ветку после мержа.

## 7. Правила

- В `main` **нельзя пушить напрямую** — только через PR.
- Ветки: `feature/`, `fix/`, `docs/`, `chore/`.
- Коммиты: `feat:`, `fix:`, `docs:`, `chore:`, `ci:`.
- Один PR — одна задача.
- Ветка живёт 2–3 дня максимум.
- Секреты (`.env`, токены) не коммитить.

## 8. Полезные команды

| Команда | Что делает |
|---|---|
| `git status` | Что изменилось |
| `git branch` | Список локальных веток |
| `git checkout main` | Перейти на main |
| `git checkout -b feature/xxx` | Создать ветку и перейти в неё |
| `git pull` | Скачать свежие изменения |
| `git log --oneline` | История коммитов |
| `git fetch origin` | Узнать, что нового на GitHub (не трогая файлы) |
| `git rebase origin/main` | Переставить свои коммиты поверх свежего main |

## 9. Если что-то не работает

- **`fatal: not a git repository`** — не в той папке. Проверь `pwd`.
- **`rejected — fetch first`** — сначала `git fetch origin` и `git rebase`.
- **`Authentication failed`** — нужен Personal Access Token, не пароль.
- **`Permission denied`** — нет доступа. Попроси владельца добавить тебя в коллабораторы.

Подробнее — в [CONTRIBUTING.md](../CONTRIBUTING.md).
