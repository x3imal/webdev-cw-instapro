const personalKey = "x3im";
const baseHost = "https://webdev-hw-api.vercel.app";
const postsHost = `${baseHost}/api/v1/${personalKey}/instapro`;
const API_BASE = baseHost;

let _token = "";

export function setToken(token) {
    _token = token || "";
}

const buildAuthHeaders = (token) => {
    const h = {};
    if (token && typeof token === "string") h.Authorization = token;
    return h;
};

export async function request(
    path,
    {method = "GET", body = undefined, signal} = {}
) {
    const headers = {};
    if (_token) headers.Authorization = `Bearer ${_token}`;

    const res = await fetch(`${API_BASE}${path}`, {method, headers, body, signal});
    const text = await res.text();
    const json = text ? JSON.parse(text) : null;

    if (!res.ok) {
        const msg = json?.message || json?.error || `HTTP ${res.status}`;
        const err = new Error(msg);
        err.status = res.status;
        err.payload = json;
        throw err;
    }
    return json;
}

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

export function registerUser({login, password, name, imageUrl}) {
    return fetch(baseHost + "/api/user", {
        method: "POST",
        body: JSON.stringify({login, password, name, imageUrl}),
    }).then((response) => {
        if (response.status === 400) throw new Error("Такой пользователь уже существует");
        return response.json();
    });
}

export function loginUser({login, password}) {
    return fetch(baseHost + "/api/user/login", {
        method: "POST",
        body: JSON.stringify({login, password}),
    }).then((response) => {
        if (response.status === 400) throw new Error("Неверный логин или пароль");
        return response.json();
    });
}

export function uploadImage({file}) {
    const data = new FormData();
    data.append("file", file);
    return fetch(baseHost + "/api/upload/image", {
        method: "POST",
        body: data,
    }).then((response) => response.json());
}

export function addPost({description, imageUrl, token}) {
    return fetch(postsHost, {
        method: "POST",
        headers: buildAuthHeaders(token),
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
 * Загрузка постов пользователя:
 * — Сначала /user-posts/:userId (правильный путь для этого API).
 * — Если не получилось, пробуем ?userId=...
 * — 404 => возвращаем [], чтобы страница открывалась без падения.
 * — 401 => пробуем второй вариант, и только если оба дали 401 — бросаем «Нет авторизации».
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

    if (saw404 && !saw401) {
        return [];
    }

    if (saw401) {
        throw new Error("Нет авторизации");
    }

    throw new Error(lastMsg);
}

export async function toggleLike({ postId, isLiked, token }) {
    const headers = (function buildAuthHeaders(t) {
        const h = {};
        if (t && typeof t === "string") h.Authorization = t;
        return h;
    })(token);

    const endpoint = isLiked
        ? `${postsHost}/${postId}/dislike`
        : `${postsHost}/${postId}/like`;

    const res = await fetch(endpoint, { method: "POST", headers });

    if (!res.ok) {
        let msg = `Ошибка ${res.status}`;
        try {
            const data = await res.json();
            msg = data?.message || data?.error || msg;
        } catch {}
        throw new Error(msg);
    }

    try { return await res.json(); } catch { return null; }
}

