/**
 * Экранирует HTML‑спецсимволы.
 * @param {string} s
 * @returns {string}
 */
export function escapeHtml(s = "") {
    return s.replace(/[&<>'"]/g, (c) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "'": "&#39;",
        '"': "&quot;",
    }[c]));
}

/**
 * Форматирует относительное время "X мин/ч/дн назад".
 * @param {string} iso — ISO дата
 * @returns {string}
 */
export function timeAgo(iso) {
    const d = new Date(iso);
    if (isNaN(d)) return "";
    const diffMs = Date.now() - d.getTime();
    const m = Math.floor(diffMs / 60000);
    if (m < 1) return "только что";
    if (m < 60) return `${m} мин. назад`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h} ч. назад`;
    const days = Math.floor(h / 24);
    if (days < 7) return `${days} дн. назад`;
    return d.toLocaleDateString();
}
