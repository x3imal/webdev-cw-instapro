import { API_BASE } from "./client.js";

/**
 * Регистрирует пользователя.
 * @param {{ login: string, password: string, name: string, imageUrl: string }} params
 * @returns {Promise<{user: {token: string, name: string, imageUrl: string, id: string}}>}
 * @throws {Error} 400 — если пользователь уже существует
 */
export function registerUser({ login, password, name, imageUrl }) {
    return fetch(`${API_BASE}/api/user`, {
        method: "POST",
        body: JSON.stringify({ login, password, name, imageUrl }),
    }).then((response) => {
        if (response.status === 400) throw new Error("Такой пользователь уже существует");
        return response.json();
    });
}

/**
 * Логин пользователя.
 * @param {{ login: string, password: string }} params
 * @returns {Promise<{user: {token: string, name: string, imageUrl: string, id: string}}>}
 * @throws {Error} 400 — неверный логин/пароль
 */
export function loginUser({ login, password }) {
    return fetch(`${API_BASE}/api/user/login`, {
        method: "POST",
        body: JSON.stringify({ login, password }),
    }).then((response) => {
        if (response.status === 400) throw new Error("Неверный логин или пароль");
        return response.json();
    });
}

/**
 * Загружает изображение и возвращает URL.
 * @param {{ file: File }} params
 * @returns {Promise<{fileUrl: string}>}
 */
export function uploadImage({ file }) {
    const data = new FormData();
    data.append("file", file);
    return fetch(`${API_BASE}/api/upload/image`, {
        method: "POST",
        body: data,
    }).then((response) => response.json());
}
