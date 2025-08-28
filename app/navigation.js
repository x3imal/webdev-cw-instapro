import { ADD_POSTS_PAGE, AUTH_PAGE, LOADING_PAGE, POSTS_PAGE, USER_POSTS_PAGE } from "./routes.js";
import { state, getToken, setPage, setPosts, setUser, setCurrentUserId, clearAuth } from "./state.js";
import { getPosts, getUserPosts, addPost } from "../api/posts.js";
import { renderPostsPageComponent } from "../components/pages/posts-page-component.js";
import { renderLoadingPageComponent } from "../components/pages/loading-page-component.js";
import { renderAuthPageComponent } from "../components/pages/auth-page-component.js";
import { renderAddPostPageComponent } from "../components/pages/add-post-page-component.js";
import "./events.js";

/**
 * Переход на страницу приложения + загрузка данных при необходимости.
 * @param {string} newPage
 * @param {{userId?: string}} [data]
 */
export function goToPage(newPage, data) {
    if (![POSTS_PAGE, AUTH_PAGE, ADD_POSTS_PAGE, USER_POSTS_PAGE, LOADING_PAGE].includes(newPage)) {
        throw new Error("страницы не существует");
    }

    if (newPage === ADD_POSTS_PAGE) {
        setPage(state.user ? ADD_POSTS_PAGE : AUTH_PAGE);
        return renderApp();
    }

    if (newPage === USER_POSTS_PAGE) {
        setPage(LOADING_PAGE);
        renderApp();

        setCurrentUserId(data?.userId ?? null);
        return getUserPosts({ userId: state.currentUserId, token: getToken() })
            .then((newPosts) => {
                setPage(USER_POSTS_PAGE);
                setPosts(newPosts);
                renderApp();
            })
            .catch((error) => {
                console.error(error);
                goToPage(POSTS_PAGE);
            });
    }

    if (newPage === POSTS_PAGE) {
        setPage(LOADING_PAGE);
        renderApp();

        return getPosts({ token: getToken() })
            .then((newPosts) => {
                setPosts(newPosts);
                setPage(POSTS_PAGE);
                renderApp();
            })
            .catch((error) => {
                console.error(error);
                setPosts([]);
                setPage(POSTS_PAGE);
                renderApp();
            });
    }

    setPage(newPage);
    renderApp();
}

/**
 * Рендерит текущее состояние на #app.
 */
export function renderApp() {
    const appEl = document.getElementById("app");

    if (state.page === LOADING_PAGE) {
        return renderLoadingPageComponent({ appEl, user: state.user, goToPage });
    }

    if (state.page === AUTH_PAGE) {
        return renderAuthPageComponent({
            appEl,
            setUser: (newUser) => {
                setUser(newUser);
                goToPage(POSTS_PAGE);
            },
            user: state.user,
            goToPage,
        });
    }

    if (state.page === ADD_POSTS_PAGE) {
        return renderAddPostPageComponent({
            appEl,
            async onAddPostClick({ description, imageUrl }) {
                try {
                    await addPost({ description, imageUrl, token: getToken() });
                    goToPage(POSTS_PAGE);
                } catch (e) {
                    alert(e.message || "Не удалось добавить пост");
                }
            },
        });
    }

    if (state.page === POSTS_PAGE || state.page === USER_POSTS_PAGE) {
        return renderPostsPageComponent({ appEl });
    }
}

/**
 * Выход пользователя: чистим auth и переходим в ленту.
 */
export function logout() {
    clearAuth();
    goToPage(POSTS_PAGE);
}

goToPage(POSTS_PAGE);
