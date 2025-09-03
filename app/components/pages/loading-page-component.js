import { renderHeaderComponent } from "../header/header-component.js";

/**
 * Экран загрузки (со спиннером).
 * @param {{ appEl: HTMLElement, user?: any, goToPage: Function }} params
 */
export function renderLoadingPageComponent({ appEl, user, goToPage }) {
    const appHtml = `
    <div class="page-container">
      <div class="header-container"></div>
      <div class="loading-page">
        <div class="loader"><div></div><div></div><div></div></div>
      </div>
    </div>`;

    appEl.innerHTML = appHtml;

    renderHeaderComponent({
        user,
        element: document.querySelector(".header-container"),
        goToPage,
    });
}
