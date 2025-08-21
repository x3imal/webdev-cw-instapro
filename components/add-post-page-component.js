import {renderHeaderComponent} from "./header-component.js";
import {renderUploadImageComponent} from "./upload-image-component.js";

export function renderAddPostPageComponent({appEl, onAddPostClick}) {
    let imageUrl = "";
    let description = "";
    let isSubmitting = false;

    const render = () => {

        const appHtml = `
      <div class="page-container">
        <div class="header-container"></div>

        <div class="form" style="max-width:640px;margin:0 auto;">
          <h3 class="form-title">Новый пост</h3>

          <div class="form-inputs" style="display:grid;gap:12px;">
            <div class="upload-image-container"></div>

            <textarea
              id="description-input"
              class="input"
              rows="3"
              placeholder="Подпись к изображению"
              maxlength="1000"
            >${description ? escapeHtml(description) : ""}</textarea>

            <div class="form-error" id="add-form-error" style="min-height:20px;color:#b00020;"></div>

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
                // Навигацию назад в ленту делает index.js после успешного addPost
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

    function escapeHtml(s = "") {
        return s.replace(/[&<>'"]/g, (c) => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            "'": "&#39;",
            "\"": "&quot;"
        }[c]));
    }

    render();
}
