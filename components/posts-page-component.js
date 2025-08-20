import { USER_POSTS_PAGE } from "../routes.js";
import { renderHeaderComponent } from "./header-component.js";
import { posts, goToPage, user} from "../index.js";

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
    const day = Math.floor(h / 24);
    return `${day} дн. назад`;
};

export function renderPostsPageComponent({ appEl }) {
    const listHtml = posts
        .map((post) => {
            const likeCount = Array.isArray(post.likes) ? post.likes.length : 0;
            const isLiked =
                typeof post.isLiked === "boolean"
                    ? post.isLiked
                    : Array.isArray(post.likes) && user ? post.likes.some((u) => u.id === user.id) : false;

            return `
        <li class="post" data-id="${post.id}">
          <div class="post-header" data-user-id="${post.user.id}">
            <img src="${post.user.imageUrl}" class="post-header__user-image" alt="${escapeHtml(post.user.name)}">
            <p class="post-header__user-name" data-user-id="${post.user.id}">${escapeHtml(post.user.name)}</p>
          </div>

          <div class="post-image-container">
            <img class="post-image" src="${post.imageUrl}" alt="post">
          </div>

          <div class="post-likes">
            <button data-post-id="${post.id}" class="like-button" aria-pressed="${isLiked ? "true" : "false"}" title="${isLiked ? "Убрать лайк" : "Поставить лайк"}">
              <img src="./assets/images/${isLiked ? "like-active.svg" : "like-not-active.svg"}" class="like-icon" alt="${isLiked ? "liked" : "not liked"}">
            </button>
            <p class="post-likes-text">
              Нравится: <strong>${likeCount}</strong>
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
    </div>`;

    appEl.innerHTML = appHtml;

    renderHeaderComponent({
        element: document.querySelector(".header-container"),
    });

    for (let userEl of document.querySelectorAll(".post-header, .post-header__user-name, .user-name")) {
        userEl.addEventListener("click", () => {
            const uid = userEl.dataset.userId;
            if (uid) {
                goToPage(USER_POSTS_PAGE, { userId: uid });
            }
        });
    }

    document.querySelectorAll(".like-button").forEach((btn) => {
        btn.addEventListener("click", () => {
            const postId = btn.dataset.postId;
            const ev = new CustomEvent("insta-like-click", { detail: { postId } });
            window.dispatchEvent(ev);
        });
    });
}