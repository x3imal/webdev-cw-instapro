const personalKey = "x3imal";
const baseHost = "https://webdev-hw-api.vercel.app";
export const API_BASE = baseHost;
export const postsHost = `${baseHost}/api/v1/${personalKey}/instapro`;

let _token = "";

/**
 * Устанавливает токен авторизации для всех запросов (Bearer ...).
 * @param {string} token — токен без префикса Bearer
 */
export function setToken(token) {
    _token = token ? `Bearer ${token}` : "";
}

/**
 * Возвращает текущий токен (с префиксом Bearer) или пустую строку.
 * @returns {string}
 */
export function getAuthHeader() {
    return _token;
}

/**
 * Универсальный запрос к API.
 * Маппит не‑2xx ответы в Error с сообщением сервера (если есть).
 * @param {string} path — абсолютный путь после API_BASE
 * @param {{method?: string, body?: BodyInit, signal?: AbortSignal, headers?: Record<string,string>}} [options]
 * @returns {Promise<any>} JSON или null
 * @throws {Error} при не‑2xx статусе/сетевой ошибке
 */
export async function request(path, {method = "GET", body, signal, headers = {}} = {}) {
    const h = {...headers};
    if (_token) h.Authorization = _token;

    const res = await fetch(`${API_BASE}${path}`, {method, headers: h, body, signal});
    const text = await res.text();
    const json = text ? JSON.parse(text) : null;

    if (!res.ok) {
        const msg = json?.message || json?.error || `HTTP ${res.status}`;
        const err = new Error(msg);
        // @ts-ignore
        err.status = res.status;
        // @ts-ignore
        err.payload = json;
        throw err;
    }
    return json;
}

/**
 * Строит заголовки авторизации из raw‑токена.
 * @param {string|undefined} tokenRaw — уже с префиксом "Bearer "... либо undefined
 * @returns {Record<string,string>}
 */
export function buildAuthHeaders(tokenRaw) {
    const h = {};
    if (tokenRaw && typeof tokenRaw === "string") h.Authorization = tokenRaw;
    return h;
}
