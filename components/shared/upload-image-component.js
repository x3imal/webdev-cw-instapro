import {uploadImage} from "../../api/auth.js";
import {ensureActionStyles} from "../../lib/dom.js";

/**
 * Компонент загрузки изображения (опрятные кнопки + спиннер).
 * @param {{ element: HTMLElement, onImageUrlChange: (url:string)=>void }} params
 */
export function renderUploadImageComponent({element, onImageUrlChange}) {
    ensureActionStyles();

    let imageUrl = "";
    let isUploading = false;

    const render = () => {
        element.innerHTML = `
    <div class="upload-image">
      ${
            imageUrl
                ? `
        <div class="file-upload-image-container">
          <img class="file-upload-image" src="${imageUrl}" alt="Загруженное изображение">
          <div class="file-upload-buttons">
            <button class="file-upload-replace-button secondary-button"${isUploading ? " disabled" : ""}>
              ${isUploading ? `<span class="spinner" aria-hidden="true"></span>Загрузка…` : "Заменить фото"}
            </button>
            <button class="file-upload-remove-button danger-btn"${isUploading ? " disabled" : ""} title="Удалить фото">
              <svg class="icon" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="currentColor" d="M9 3h6a1 1 0 0 1 1 1v2h4v2h-1l-1.1 12.1A2 2 0 0 1 16.9 22H7.1a2 2 0 0 1-1.99-1.9L4 8H3V6h4V4a1 1 0 0 1 1-1Zm2 0v2h2V3h-2ZM6 8l1 12h10l1-12H6Zm4 3h2v7h-2v-7Zm4 0h2v7h-2v-7Zm-8 0h2v7H6v-7Z"/>
              </svg>
              Удалить
            </button>
          </div>
          <input type="file" class="file-upload-input" ${isUploading ? "disabled" : ""} />
        </div>
      `
                : `
        <label class="file-upload-label secondary-button">
          <input type="file" class="file-upload-input" ${isUploading ? "disabled" : ""}/>
          ${isUploading ? `<span class="spinner" aria-hidden="true"></span>Загрузка…` : "Выберите фото"}
        </label>
      `
        }
    </div>
  `;

    const fileInput = element.querySelector(".file-upload-input");

        fileInput?.addEventListener("change", async () => {
            const file = fileInput.files?.[0];
            if (!file) return;

            isUploading = true;
            render();

            try {
                const {fileUrl} = await uploadImage({file});
                imageUrl = fileUrl || "";
                onImageUrlChange(imageUrl);
            } catch (e) {
                alert(e?.message || "Не удалось загрузить изображение");
                imageUrl = "";
                onImageUrlChange("");
            } finally {
                isUploading = false;
                render();
            }
        });

        element.querySelector(".file-upload-replace-button")?.addEventListener("click", () => {
            if (isUploading) return;
            element.querySelector(".file-upload-input")?.click();
        });

        element.querySelector(".file-upload-remove-button")?.addEventListener("click", () => {
            if (isUploading) return;
            imageUrl = "";
            onImageUrlChange("");
            render();
        });

        // Защита от клика по label во время аплоада
        element.querySelector(".file-upload-label")?.addEventListener("click", (e) => {
            if (isUploading) {
                e.preventDefault();
                e.stopPropagation();
            }
        });
    };

    render();
}
