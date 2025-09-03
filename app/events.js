import {toggleLike, deletePost, getPosts, getUserPosts} from "./api/posts.js";
import {getToken, state, setPosts} from "./state.js";
import {USER_POSTS_PAGE} from "./routes.js";
import {renderApp} from "./navigation.js";

/**
 * Глобальный слушатель лайков.
 * Централизуем обновление ленты после успешного запроса.
 */
window.addEventListener("insta-like-click", async (e) => {
    const {postId, isLiked} = e.detail || {};
    if (!postId) return;

    try {
        await toggleLike({postId, isLiked, token: getToken()});
        if (state.page === USER_POSTS_PAGE && state.currentUserId) {
            const newPosts = await getUserPosts({userId: state.currentUserId, token: getToken()});
            setPosts(newPosts);
        } else {
            const newPosts = await getPosts({token: getToken()});
            setPosts(newPosts);
        }
        renderApp();
    } catch (err) {
        alert(err.message || "Не удалось обновить лайк");
    }
});

/**
 * Глобальный слушатель удаления постов.
 * Блокируем кнопку, показываем спиннер, рефрешим ленту.
 */
window.addEventListener("insta-delete-click", async (e) => {
    const {postId} = e.detail || {};
    if (!postId) return;
    if (!state.user || !state.user.token) {
        alert("Войдите, чтобы удалить пост");
        return;
    }
    if (!confirm("Удалить пост без возможности восстановления?")) return;

    const btn = document.querySelector(`.post-header__delete-button[data-post-id="${postId}"]`);
    const originalHtml = btn?.innerHTML;
    if (btn) {
        btn.disabled = true;
        btn.classList.add("is-loading");
        btn.innerHTML = `<span class="spinner" aria-hidden="true"></span>Удаляю…`;
    }

    try {
        await deletePost({postId, token: getToken()});
        const newPosts = (state.page === USER_POSTS_PAGE && state.currentUserId)
            ? await getUserPosts({userId: state.currentUserId, token: getToken()})
            : await getPosts({token: getToken()});
        setPosts(newPosts);
        renderApp();
    } catch (err) {
        if (btn) {
            btn.disabled = false;
            btn.classList.remove("is-loading");
            btn.innerHTML = originalHtml ?? "Удалить";
        }
        alert(err.message || "Не удалось удалить пост");
    }
});
