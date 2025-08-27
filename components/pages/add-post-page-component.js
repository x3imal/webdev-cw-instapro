import {renderHeaderComponent} from "../header/header-component.js";
import {renderUploadImageComponent} from "../shared/upload-image-component.js";
import {escapeHtml} from "../../lib/dom.js";

/**
 * Страница добавления поста.
 * @param {{ appEl: HTMLElement, onAddPostClick: (args:{description:string,imageUrl:string})=>Promise<void> }} params
 */
export function renderAddPostPageComponent({appEl, onAddPostClick}) {
    let imageUrl = "";
    let description = "";
    let isSubmitting = false;

    const render = () => {
        const appHtml = `
    <div class="page-container">
      <div class="header-container"></div>

      <div class="form form--narrow">
        <h3 class="form-title">Новый пост</h3>

        <div class="form-inputs form-inputs--spacious">
          <div class="upload-image-container"></div>

          <textarea
            id="description-input"
            class="input"
            rows="4"
            placeholder="Подпись к изображению"
            maxlength="1000"
          >${description ? escapeHtml(description) : ""}</textarea>

          <div class="form-error form-error--inline" id="add-form-error"></div>

          <button class="button" id="add-button" ${canSubmit() && !isSubmitting ? "" : "disabled"}>
            ${isSubmitting ? "Публикую..." : "Опубликовать"}
          </button>
        </div>
      </div>
    </div>
  `;

        appEl.innerHTML = appHtml;

        renderHeaderComponent({
            element: document.querySelector(".header-container"),
        });

        const uploadImageContainer = appEl.querySelector(".upload-image-container");
        renderUploadImageComponent({
            element: uploadImageContainer,
            onImageUrlChange(newUrl) {
                imageUrl = newUrl || "";
                updateSubmitState();
            },
        });

        const descEl = appEl.querySelector("#description-input");
        descEl.addEventListener("input", () => {
            description = descEl.value;
            updateSubmitState();
        });

        appEl.querySelector("#add-button").addEventListener("click", async () => {
            clearError();
            if (!canSubmit() || isSubmitting) return;

            isSubmitting = true;
            updateSubmitState();

            try {
                await onAddPostClick({
                    description: description.trim(),
                    imageUrl,
                });
                // Навигацию назад в ленту делает navigation.js после успешного addPost
            } catch (e) {
                showError(e?.message || "Не удалось добавить пост");
            } finally {
                isSubmitting = false;
                updateSubmitState();
            }
        });
    };

    function canSubmit() {
        return Boolean(imageUrl && description.trim());
    }

    function updateSubmitState() {
        const btn = appEl.querySelector("#add-button");
        if (!btn) return;
        btn.disabled = !(canSubmit() && !isSubmitting);
        btn.textContent = isSubmitting ? "Публикую..." : "Опубликовать";
    }

    function showError(msg) {
        const el = appEl.querySelector("#add-form-error");
        if (el) el.textContent = msg;
    }

    function clearError() {
        showError("");
    }

    render();
}
