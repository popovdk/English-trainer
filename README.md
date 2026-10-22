# English Trainer

Интерактивные тренажёры британского английского. Vite + HTML5 + нативный JS, без фреймворков.

**Сайт:** https://popovdk.github.io/English-trainer/

## Тренажёры

| Тренажёр | Ссылка |
| --- | --- |
| Время по часам — двигаете стрелки, видите британский вариант, русский перевод и слушаете произношение | [`/time/`](https://popovdk.github.io/English-trainer/time/) |

Можно открыть тренажёр сразу с нужным временем: `/time/?t=14:40`.

## Разработка

```bash
npm install
npm run dev      # локальный сервер
npm test         # тесты логики перевода времени
npm run build    # сборка в dist/
```

### Структура

```
index.html                 главная
time/index.html            тренажёр «Время по часам»
src/app.js                 общая инициализация (шапка, service worker)
src/nav.js                 список тренажёров (главная + бургер-меню)
src/components/header.js   шапка и бургер-меню
src/trainers/time/         циферблат, перевод времени, озвучка
public/                    иконки, манифест, service worker
```

### Как добавить тренажёр

1. Создать `<name>/index.html` и `src/trainers/<name>/page.js` (вызвать `initPage('<name>')`).
2. Добавить страницу в `build.rolldownOptions.input` в `vite.config.js`.
3. Добавить запись в `trainers` в `src/nav.js` — карточка и пункт меню появятся сами.

### Иконки

PNG-иконки генерируются из `public/favicon.svg`: `node scripts/make-icons.mjs` (нужен Playwright с Chromium).

## Деплой

Каждый пуш в `main` собирается и публикуется на GitHub Pages через GitHub Actions
(`.github/workflows/deploy.yml`). В настройках репозитория: **Settings → Pages → Source: GitHub Actions**.
