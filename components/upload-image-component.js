import {uploadImage} from "../api.js";

/**
 * Компонент загрузки изображения.
 * Этот компонент позволяет пользователю загружать изображение и отображать его превью.
 * Если изображение уже загружено, пользователь может заменить его.
 *
 * @param {HTMLElement} params.element - HTML-элемент, в который будет рендериться компонент.
 * @param {Function} params.onImageUrlChange - Функция, вызываемая при изменении URL изображения.
 *                                            Принимает один аргумент - новый URL изображения или пустую строку.
 */
export function renderUploadImageComponent({element, onImageUrlChange}) {
    /**
     * URL текущего изображения.
     * Изначально пуст, пока пользователь не загрузит изображение.
     * @type {string}
     */
    let imageUrl = "";
    let isUploading = false;

    /**
     * Функция рендеринга компонента.
     * Отображает интерфейс компонента в зависимости от состояния:
     * либо форма выбора файла, либо превью загруженного изображения с кнопкой замены.
     */
    const render = () => {
        element.innerHTML = `
      <div class="upload-image" style="display:grid;gap:8px;">
        ${
            imageUrl
                ? `
              <div class="file-upload-image-container" style="display:grid;gap:8px;">
                <img class="file-upload-image" src="${imageUrl}" alt="Загруженное изображение" style="max-width:100%;border-radius:8px;">
                <div style="display:flex;gap:8px;">
                  <button class="file-upload-replace-button secondary-button">${isUploading ? "Загрузка..." : "Заменить фото"}</button>
                  <button class="file-upload-remove-button button-outline" ${isUploading ? "disabled" : ""}>Удалить</button>
                </div>
                <input type="file" class="file-upload-input" style="display:none" ${isUploading ? "disabled" : ""} />
              </div>
            `
                : `
              <label class="file-upload-label secondary-button" style="display:inline-block;cursor:pointer;">
                <input type="file" class="file-upload-input" style="display:none" ${isUploading ? "disabled" : ""}/>
                ${isUploading ? "Загрузка..." : "Выберите фото"}
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

        element.querySelector(".file-upload-label")?.addEventListener("click", (e) => {
            if (isUploading) {
                e.preventDefault();
                e.stopPropagation();
            }
        });
    };

    render();
}