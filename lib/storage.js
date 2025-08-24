/**
 * Сохраняет пользователя в localStorage.
 * @param {object|null} user
 */
export function saveUser(user) {
    window.localStorage.setItem("user", JSON.stringify(user));
}

/**
 * Возвращает пользователя из localStorage (или null).
 * @returns {object|null}
 */
export function loadUser() {
    try {
        return JSON.parse(window.localStorage.getItem("user"));
    } catch {
        return null;
    }
}

/**
 * Удаляет пользователя из localStorage.
 */
export function removeUser() {
    window.localStorage.removeItem("user");
}
