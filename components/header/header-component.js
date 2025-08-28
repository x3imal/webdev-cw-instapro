import { goToPage, logout } from "../../app/navigation.js";
import { state } from "../../app/state.js";
import { ADD_POSTS_PAGE, AUTH_PAGE, POSTS_PAGE } from "../../app/routes.js";

/**
 * Компонент заголовка (логотип, добавить/войти, выйти).
 * @param {{ element: HTMLElement }} params
 * @returns {HTMLElement}
 */
export function renderHeaderComponent({ element }) {
    element.innerHTML = `
  <div class="page-header">
      <h1 class="logo">instapro</h1>
      <button class="header-button add-or-login-button">
      ${
        state.user
            ? `<div title="Добавить пост" class="add-post-sign"></div>`
            : "Войти"
    }
      </button>
      ${
        state.user
            ? `<button title="${state.user.name}" class="header-button logout-button">Выйти</button>`
            : ""
    }  
  </div>
  `;

    element.querySelector(".add-or-login-button").addEventListener("click", () => {
        if (state.user) goToPage(ADD_POSTS_PAGE);
        else goToPage(AUTH_PAGE);
    });

    element.querySelector(".logo").addEventListener("click", () => {
        goToPage(POSTS_PAGE);
    });

    element.querySelector(".logout-button")?.addEventListener("click", logout);

    return element;
}
