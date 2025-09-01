# Архитектура фронтенда

## Цели
- Минимальный, но **прозрачный** слойный дизайн без фреймворков.
- Разделение ответственности: **API ↔ State ↔ Navigation ↔ Render**.
- Лёгкая расширяемость страниц/компонентов.

## Слои

### 1) `api/`
- `client.js` — единая точка HTTP:
  - Добавляет `Authorization` из `state.getToken()`.
  - Бросает единый `ApiError` с `status`/`message`.
  - Умеет `GET/POST/DELETE` и `multipart` через `FormData`.
- `auth.js` — `loginUser`, `registerUser`, `uploadImage`.
- `posts.js` — `getPosts`, `getUserPosts`, `addPost`, `deletePost`, `toggleLike`.

> Важно: **никаких** операций с DOM. Только сетевые вызовы и парсинг.

### 2) `app/`
- `state.js`
  - `user`, `token`, `posts`, `currentPage`, `currentUserId`.
  - Сеттеры/геттеры (инкапсуляция), селекторы.
  - (Опц.) интеграция с `localStorage` через `lib/storage.js`.
- `routes.js` — набор констант страниц.
- `navigation.js`
  - `goToPage(page, params)` → меняет `state.currentPage`.
  - `renderApp()` — единая функция отрисовки:
    - решает, какой `page component` вызвать;
    - прокидывает данные;
    - монтирует результат в `#app`.
- `events.js`
  - Делегирование событий на документ/контейнеры.
  - Обработчики: лайк/удаление поста, сабмиты форм, ссылки-кнопки навигации.
  - Никакого рендера — только вызовы `api` и `goToPage()`.

### 3) `components/`
- `header/header-component.js` — рендер хедера (авторизация/выход, ссылки).
- `pages/*` — одна страница = один модуль:
  - `posts-page-component.js`
  - `add-post-page-component.js`
  - `auth-page-component.js`
  - `loading-page-component.js`
- `shared/upload-image-component.js` — компонент выбора и превью картинки.

> Компоненты — **чистые**: принимают данные, возвращают строку/DOM. В компоненте допустимо локальное поведение (например, превью картинки), но **без** сетевых вызовов и без глобальных сайд-эффектов.

### 4) `lib/`
- `dom.js` — утилиты:
  - `qs`, `qsa`, `mount`, `html` (template to node),
  - `escapeHtml(s)` — защита от XSS,
  - `timeAgo(iso)` — «5 мин назад»,
  - `ensureActionStyles()` — динамическая подгрузка стилей действий (если нужна).
- `storage.js` — обёртка над `localStorage` (get/save/remove user/token).

## Поток данных

- **Из UI** мы инициируем действие (клик/submit).
- **events.js** вызывает нужный метод **api**.
- По результату — обновляет **state**.
- Затем дергаем **`renderApp()`** для консистентной перерисовки.

## Навигация

- Простой стор-роутер: `state.currentPage` + `renderApp()`.
- Переходы только через `goToPage(PAGE, params)`.
- (Опц.) можно привязать к `location.hash` для истории.

## Ошибки и загрузка

- Единый лоадер-экран (`LOADING_PAGE`) для долгих операций.
- Ошибки из `api` приводим к одному виду (`ApiError`), показываем тост/блок ошибки на странице.

## Безопасность

- **XSS**: весь пользовательский ввод — через `escapeHtml` или `textContent`.
- **Файлы**: загрузка через `FormData`, `Content-Type` **не** ставим вручную.
- **Токен**: только в памяти (или локалке через `storage.js`, если требуется).

## Тестируемость

- `api/*` изолирован — легко мокать.
- Компоненты — функции → снапшоты/юнит-тесты на чистый рендер.

## Расширение

- Новая страница = новый файл в `components/pages` + константа в `routes.js` + ветка в `renderApp()`.
- Новая сущность API = новый модуль в `api/*` + вызовы из `events.js`.

