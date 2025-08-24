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

/**
 * Глобальный мини‑CSS для action‑кнопок/спиннера.
 * Включается ровно один раз.
 */
export function ensureActionStyles() {
    if (document.getElementById("action-styles")) return;
    const style = document.createElement("style");
    style.id = "action-styles";
    style.textContent = `
    .danger-btn {
      display:inline-flex;align-items:center;gap:6px;
      padding:6px 10px;font-size:14px;line-height:1;
      border-radius:8px;border:1px solid #e57373;background:#fff;color:#d32f2f;
      cursor:pointer;transition:background .15s ease,border-color .15s ease,opacity .15s ease,transform .04s ease;
    }
    .danger-btn:hover { background:#ffebee;border-color:#ef5350; }
    .danger-btn:active { transform:translateY(1px); }
    .danger-btn:disabled { opacity:.6; cursor:not-allowed; }

    .secondary-button {
      display:inline-flex;align-items:center;gap:6px;padding:6px 10px;font-size:14px;line-height:1;border-radius:8px;
      border:1px solid #d0d7de;background:#f6f8fa;color:#24292f;cursor:pointer;transition:background .15s ease,border-color .15s ease,transform .04s ease;
    }
    .secondary-button:hover { background:#eef2f6;border-color:#c0c7d0; }
    .secondary-button:active { transform:translateY(1px); }
    .secondary-button:disabled { opacity:.6; cursor:not-allowed; }

    .spinner { width:14px;height:14px;border:2px solid currentColor;border-right-color:transparent;border-radius:50%;
               display:inline-block;animation:spin .8s linear infinite;vertical-align:-2px;margin-right:6px; }
    @keyframes spin { to { transform: rotate(360deg) } }
  `;
    document.head.appendChild(style);
}
