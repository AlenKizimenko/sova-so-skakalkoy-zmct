# Деплой

## Платформа
Amvera (https://amvera.ru)

## Прод URL
https://event-platform-tanoss.amvera.io

## Как задеплоить

### Первоначальная настройка (один раз)
1. Создать проект в панели Amvera.
2. Подключить Git-репозиторий Amvera:
   ```text
   git remote add amvera https://git.msk0.amvera.ru/tanoss/event-platform
   ```

### Обновление кода
1. Убедиться, что всё закоммичено:
   ```text
   git status
   ```
2. Запушить ветку в `master` Amvera:
   ```text
   git push amvera feature/delivery_larina:master
   ```
3. Amvera автоматически обнаружит изменения и начнёт сборку.

## Как откатить
1. Панель Amvera → проект → **«История деплоев»**.
2. Выбрать предыдущий успешный деплой.
3. Нажать **«Откатить»**.

## Где смотреть логи
- **Сборка:** панель Amvera → «Логи сборки».
- **Работа приложения:** панель Amvera → «Логи приложения».

## Технические детали
- **Окружение:** Docker + Nginx.
- **Dockerfile:** в корне репозитория.
- **Порт:** 80.
- **Статика:** `apps/site/public/` копируется в `/usr/share/nginx/html/`.

## Проблемы и решения
- **`npm error ENOENT: package.json`** — Amvera пытается собрать Node.js-проект. Решение: использовать `Dockerfile` с Nginx, а не `amvera.yml` с `environment: node`.
- **`rejected — non-fast-forward`** — Amvera добавила свои коммиты. Решение: `git fetch amvera && git rebase amvera/master && git push amvera feature/delivery:master`.
