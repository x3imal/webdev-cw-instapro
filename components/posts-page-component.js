import {USER_POSTS_PAGE} from "../routes.js";
import {renderHeaderComponent} from "./header-component.js";
import {posts, goToPage, user} from "../index.js";

const escapeHtml = (s = "") =>
    s.replace(/[&<>'"]/g, (c) => ({"&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;"}[c]));

const timeAgo = (iso) => {
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
};

// Нормализуем возможные варианты id
function getUserId(u) {
    if (!u) return "";
    if (u.id != null) return String(u.id);
    if (u._id != null) return String(u._id);
    if (u.user?.id != null) return String(u.user.id);
    if (u.user?._id != null) return String(u.user._id);
    return "";
}

// Единый мини‑CSS для action‑кнопок (втыкаем 1 раз)
function ensureActionStyles() {
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
    .danger-btn .icon { width:16px;height:16px;display:inline-block }
    .is-loading { pointer-events:none; }
    .spinner { width:14px;height:14px;border:2px solid currentColor;border-right-color:transparent;border-radius:50%;
               display:inline-block;animation:spin .8s linear infinite;vertical-align:-2px;margin-right:6px; }
    @keyframes spin { to { transform: rotate(360deg) } }
    .secondary-button {
      display:inline-flex;align-items:center;gap:6px;padding:6px 10px;font-size:14px;line-height:1;border-radius:8px;
      border:1px solid #d0d7de;background:#f6f8fa;color:#24292f;cursor:pointer;transition:background .15s ease,border-color .15s ease,transform .04s ease;
    }
    .secondary-button:hover { background:#eef2f6;border-color:#c0c7d0; }
    .secondary-button:active { transform:translateY(1px); }
    .secondary-button:disabled { opacity:.6; cursor:not-allowed; }
  `;
    document.head.appendChild(style);
}

export function renderPostsPageComponent({appEl}) {
    ensureActionStyles();

    const currentUserId = getUserId(user);

    const listHtml =
        posts.length === 0
            ? `<li class="post post--empty">У пользователя пока нет постов.</li>`
            : posts
                .map((post) => {
                    const isLiked = !!post.isLiked;
                    const postUser = post.user || {};
                    const postUserId = getUserId(postUser);
                    const isOwner = currentUserId && postUserId && postUserId === currentUserId;

                    return `
  <li class="post" data-id="${post.id}">
    <div class="post-header" data-user-id="${postUserId}">
      <img src="${postUser.imageUrl}" class="post-header__user-image" alt="${escapeHtml(postUser.name || "")}">
      <p class="post-header__user-name" data-user-id="${postUserId}">
        ${escapeHtml(postUser.name || "")}${isOwner ? " (я)" : ""}
      </p>
      ${isOwner ? `
        <button
          class="post-header__delete-button danger-btn"
          title="Удалить пост"
          data-post-id="${post.id}"
          style="margin-left:auto"
        >
          <svg class="icon" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="currentColor" d="M9 3h6a1 1 0 0 1 1 1v2h4v2h-1l-1.1 12.1A2 2 0 0 1 16.9 22H7.1a2 2 0 0 1-1.99-1.9L4 8H3V6h4V4a1 1 0 0 1 1-1Zm2 0v2h2V3h-2ZM6 8l1 12h10l1-12H6Zm4 3h2v7h-2v-7Zm4 0h2v7h-2v-7Zm-8 0h2v7H6v-7Z"/>
          </svg>
          Удалить
        </button>` : ""}
    </div>

    <div class="post-image-container">
      <img class="post-image" src="${post.imageUrl}" alt="post">
    </div>

    <div class="post-likes">
      <button
        data-post-id="${post.id}"
        class="like-button"
        aria-pressed="${isLiked ? "true" : "false"}"
        title="${isLiked ? "Убрать лайк" : "Поставить лайк"}"
      >
        <img
          src="./assets/images/${isLiked ? "like-active.svg" : "like-not-active.svg"}"
          class="like-icon"
          alt="${isLiked ? "liked" : "not liked"}"
        >
      </button>
      <p class="post-likes-text">
        Нравится: <strong>${post.likes.length}</strong>
      </p>
    </div>

    <p class="post-text">
      <span class="user-name" data-user-id="${postUserId}">${escapeHtml(postUser.name || "")}</span>
      ${escapeHtml(post.description || "")}
    </p>

    <p class="post-date">
      ${timeAgo(post.createdAt)}
    </p>
  </li>
`;
                })
                .join("");

    const appHtml = `
    <div class="page-container">
      <div class="header-container"></div>
      <ul class="posts">
        ${listHtml}
      </ul>
    </div>
  `;

    appEl.innerHTML = appHtml;

    renderHeaderComponent({
        element: appEl.querySelector(".header-container"),
    });

    appEl.querySelectorAll("[data-user-id]").forEach((userEl) => {
        userEl.addEventListener("click", () => {
            const uid = userEl.dataset.userId;
            if (uid) goToPage(USER_POSTS_PAGE, {userId: uid});
        });
    });

    appEl.querySelectorAll(".like-button").forEach((btn) => {
        btn.addEventListener("click", () => {
            const postId = btn.dataset.postId;
            const isLiked = btn.getAttribute("aria-pressed") === "true";
            const ev = new CustomEvent("insta-like-click", {detail: {postId, isLiked}});
            window.dispatchEvent(ev);
        });
    });

    appEl.querySelectorAll(".post-header__delete-button").forEach((btn) => {
        btn.addEventListener("click", (e) => {
            e.stopPropagation();
            const postId = btn.dataset.postId;
            const ev = new CustomEvent("insta-delete-click", {detail: {postId}});
            window.dispatchEvent(ev);
        });
    });
}
