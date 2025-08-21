import { USER_POSTS_PAGE } from "../routes.js";
import { renderHeaderComponent } from "./header-component.js";
import { posts, goToPage, user } from "../index.js";

const escapeHtml = (s = "") =>
    s.replace(/[&<>'"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", "\"": "&quot;" }[c]));

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

export function renderPostsPageComponent({ appEl }) {
    const listHtml =
        posts.length === 0
            ? `<li class="post post--empty">У пользователя пока нет постов.</li>`
            : posts
                .map((post) => {
                    const isLiked = !!post.isLiked;
                    const you = user?.user?.id && post.user.id === user.user.id;
                    return `
          <li class="post" data-id="${post.id}">
            <div class="post-header" data-user-id="${post.user.id}">
              <img src="${post.user.imageUrl}" class="post-header__user-image" alt="${escapeHtml(post.user.name)}">
              <p class="post-header__user-name" data-user-id="${post.user.id}">
                ${escapeHtml(post.user.name)}${you ? " (я)" : ""}
              </p>
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
              <span class="user-name" data-user-id="${post.user.id}">${escapeHtml(post.user.name)}</span>
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
            if (uid) goToPage(USER_POSTS_PAGE, { userId: uid });
        });
    });

    appEl.querySelectorAll(".like-button").forEach((btn) => {
        btn.addEventListener("click", () => {
            const postId = btn.dataset.postId;
            const isLiked = btn.getAttribute("aria-pressed") === "true";
            const ev = new CustomEvent("insta-like-click", { detail: { postId, isLiked } });
            window.dispatchEvent(ev);
        });
    });
}
