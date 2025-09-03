import { USER_POSTS_PAGE } from "../../routes.js";
import { renderHeaderComponent } from "../header/header-component.js";
import { state } from "../../state.js";
import { escapeHtml, timeAgo } from "../../lib/dom.js";

/**
 * Возвращает строковый id пользователя (пытается подобрать из разных полей).
 * @param {any} u
 * @returns {string}
 */
function getUserId(u) {
    if (!u) return "";
    if (u.id != null) return String(u.id);
    if (u._id != null) return String(u._id);
    if (u.user?.id != null) return String(u.user.id);
    if (u.user?._id != null) return String(u.user._id);
    return "";
}

/**
 * Страница ленты постов и постов пользователя.
 * @param {{ appEl: HTMLElement }} params
 */
export function renderPostsPageComponent({ appEl }) {
    const currentUserId = getUserId(state.user);

    const listHtml =
        state.posts.length === 0
            ? `<li class="post post--empty">Пока нет ни одного поста.</li>`
            : state.posts
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
      ${
                        isOwner
                            ? `
        <button
          class="post-header__delete-button danger-btn"
          title="Удалить пост"
          data-post-id="${post.id}"
        >
          <svg class="icon" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="currentColor" d="M9 3h6a1 1 0 0 1 1 1v2h4v2h-1l-1.1 12.1A2 2 0 0 1 16.9 22H7.1a2 2 0 0 1-1.99-1.9L4 8H3V6h4V4a1 1 0 0 1 1-1Zm2 0v2h2V3h-2ZM6 8l1 12h10l1-12H6Zm4 3h2v7h-2v-7Zm4 0h2v7h-2v-7Zm-8 0h2v7H6v-7Z"/>
          </svg>
          Удалить
        </button>`
                            : ""
                    }
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
            if (!uid) return;
            const ev = new CustomEvent("insta-navigate-user", { detail: { userId: uid } });
            window.dispatchEvent(ev);
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

    appEl.querySelectorAll(".post-header__delete-button").forEach((btn) => {
        btn.addEventListener("click", (e) => {
            e.stopPropagation();
            const postId = btn.dataset.postId;
            const ev = new CustomEvent("insta-delete-click", { detail: { postId } });
            window.dispatchEvent(ev);
        });
    });

    window.addEventListener(
        "insta-navigate-user",
        (e) => {
            const { userId } = e.detail || {};
            if (!userId) return;
            import("../../navigation.js").then(({ goToPage }) => {
                goToPage(USER_POSTS_PAGE, { userId });
            });
        },
        { once: true },
    );
}
