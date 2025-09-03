import { loadUser, saveUser, removeUser } from "./lib/storage.js";

/**
 * Глобальное состояние приложения (простой in‑memory стор).
 * Никакого реактивного фреймворка — всё вручную.
 */
export const state = {
    user: loadUser(),
    page: null,
    posts: [],
    currentUserId: null,
};

/**
 * Возвращает Authorization заголовок вида "Bearer ...", если пользователь есть.
 * @returns {string|undefined}
 */
export function getToken() {
    return state.user ? `Bearer ${state.user.token}` : undefined;
}

/**
 * Устанавливает текущего пользователя и синхронизирует localStorage.
 * @param {object|null} user
 */
export function setUser(user) {
    state.user = user || null;
    if (state.user) saveUser(state.user);
    else removeUser();
}

/**
 * Устанавливает текущую страницу.
 * @param {string|null} page
 */
export function setPage(page) {
    state.page = page;
}

/**
 * Сетаем текущее множество постов.
 * @param {Array} posts
 */
export function setPosts(posts) {
    state.posts = Array.isArray(posts) ? posts : [];
}

/**
 * Сетаем id пользователя, чьи посты сейчас смотрим (для USER_POSTS_PAGE).
 * @param {string|null} id
 */
export function setCurrentUserId(id) {
    state.currentUserId = id || null;
}

/**
 * Полный сброс авторизации.
 * (Навигация — в navigation.logout)
 */
export function clearAuth() {
    setUser(null);
}
