import {postsHost, buildAuthHeaders, request} from "./client.js";

/**
 * Загружает общую ленту постов.
 * @param {{ token?: string }} params — Authorization (Bearer ...)
 * @returns {Promise<Array>} posts
 * @throws {Error} 401/прочие статусы
 */
export function getPosts({token}) {
    return fetch(postsHost, {
        method: "GET",
        headers: buildAuthHeaders(token),
    })
        .then((response) => {
            if (response.status === 401) throw new Error("Нет авторизации");
            return response.json();
        })
        .then((data) => data.posts);
}

/**
 * Добавляет пост с описанием и картинкой.
 * @param {{ description: string, imageUrl: string, token?: string }} params
 * @returns {Promise<object>} ответ API
 * @throws {Error} при не‑2xx
 */
export function addPost({description, imageUrl, token}) {
    return fetch(postsHost, {
        method: "POST",
        headers: {
            ...buildAuthHeaders(token),
        },
        body: JSON.stringify({description, imageUrl}),
    }).then(async (response) => {
        if (!response.ok) {
            let msg = `Ошибка ${response.status}`;
            try {
                const data = await response.json();
                if (data?.error) msg = data.error;
                if (data?.message) msg = data.message;
            } catch {
            }
            throw new Error(msg);
        }
        return response.json();
    });
}

/**
 * Загрузка постов конкретного пользователя.
 * Пробует несколько вариантов маршрута на бэке.
 * @param {{ userId: string, token?: string }} params
 * @returns {Promise<Array>} posts ([] если 404)
 * @throws {Error} при 401 или сетевой ошибке
 */
export async function getUserPosts({userId, token}) {
    const headers = buildAuthHeaders(token);
    const urls = [
        `${postsHost}/user-posts/${encodeURIComponent(userId)}`,
        `${postsHost}/user-posts?userId=${encodeURIComponent(userId)}`,
    ];

    let saw401 = false;
    let saw404 = false;
    let lastMsg = "Не удалось загрузить посты пользователя";

    for (const url of urls) {
        try {
            const res = await fetch(url, {method: "GET", headers});
            if (res.ok) {
                const data = await res.json();
                return data.posts || [];
            }
            if (res.status === 401) {
                saw401 = true;
                continue;
            }
            if (res.status === 404) {
                saw404 = true;
                continue;
            }
            try {
                const data = await res.json();
                lastMsg = data?.message || data?.error || `Ошибка ${res.status}`;
            } catch {
                lastMsg = `Ошибка ${res.status}`;
            }
        } catch (e) {
            lastMsg = e?.message || lastMsg;
        }
    }

    if (saw404 && !saw401) return [];
    if (saw401) throw new Error("Нет авторизации");
    throw new Error(lastMsg);
}

/**
 * Переключает лайк/дизлайк на посте.
 * @param {{ postId: string, isLiked: boolean, token?: string }} params
 * @returns {Promise<object|null>}
 * @throws {Error} при не‑2xx
 */
export async function toggleLike({postId, isLiked, token}) {
    const endpoint = isLiked
        ? `${postsHost}/${postId}/dislike`
        : `${postsHost}/${postId}/like`;

    const res = await fetch(endpoint, {
        method: "POST",
        headers: buildAuthHeaders(token),
    });

    if (!res.ok) {
        let msg = `Ошибка ${res.status}`;
        try {
            const data = await res.json();
            msg = data?.message || data?.error || msg;
        } catch {
        }
        throw new Error(msg);
    }

    try {
        return await res.json();
    } catch {
        return null;
    }
}

/**
 * Удаляет пост по id.
 * Требует Authorization; API может вернуть 401/404/500 — маппим в Error с сообщением сервера.
 * @param {{ postId: string, token?: string }} params
 * @returns {Promise<null|object>} Ответ API (если есть) или null
 * @throws {Error} при сетевой ошибке или не-2xx статусе
 */
export async function deletePost({postId, token}) {
    const url = `${postsHost}/${postId}`;
    const res = await fetch(url, {
        method: "DELETE",
        headers: buildAuthHeaders(token),
    });

    if (!res.ok) {
        let msg = `Ошибка ${res.status}`;
        try {
            const data = await res.json();
            msg = data?.message || data?.error || msg;
        } catch {
        }
        throw new Error(msg);
    }
    try {
        return await res.json();
    } catch {
        return null;
    }
}
