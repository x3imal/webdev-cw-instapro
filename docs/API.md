# API

Базовый хост: `https://webdev-hw-api.vercel.app`

- Лента: `GET /api/v1/:key/instapro`
- Добавить пост: `POST /api/v1/:key/instapro { description, imageUrl }` (Authorization)
- Лайк/дизлайк: `POST /api/v1/:key/instapro/:postId/(like|dislike)` (Authorization)
- Удалить: `DELETE /api/v1/:key/instapro/:postId` (Authorization)
- Посты пользователя: `GET /api/v1/:key/instapro/user-posts/:userId` (или `?userId=...`) (Authorization)
- Регистрация: `POST /api/user { login, password, name, imageUrl }`
- Логин: `POST /api/user/login { login, password }`
- Аплоад: `POST /api/upload/image (FormData file)`
