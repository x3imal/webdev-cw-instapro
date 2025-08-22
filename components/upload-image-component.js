import {uploadImage} from "../api.js";

function ensureActionStyles() {
    if (document.getElementById("action-styles")) return; // уже вставлено постами
    const style = document.createElement("style");
    style.id = "action-styles";
    style.textContent = `
    .danger-btn {
      display:inline-flex;align-items:center;gap:6px;
      padding:6px 10px;font-size:14px;border-radius:8px;border:1px solid #e57373;background:#fff;color:#d32f2f;
      cursor:pointer;transition:background .15s ease,border-color .15s ease,opacity .15s ease,transform .04s ease;
    }
    .danger-btn:hover { background:#ffebee;border-color:#ef5350; }
    .danger-btn:active { transform:translateY(1px); }
    .danger-btn:disabled { opacity:.6; cursor:not-allowed; }
    .danger-btn .icon { width:16px;height:16px;display:inline-block }

    .secondary-button {
      display:inline-flex;align-items:center;gap:6px;padding:6px 10px;font-size:14px;border-radius:8px;
      border:1px solid #d0d7de;background:#f6f8fa;color:#24292f;cursor:pointer;transition:background .15s ease,border-color .15s ease,transform .04s ease;
    }
    .secondary-button:hover { background:#eef2f6;border-color:#c0c7d0; }
    .secondary-button:active { transform:translateY(1px); }
    .secondary-button:disabled { opacity:.6; cursor:not-allowed; }

    .spinner { width:14px;height:14px;border:2px solid currentColor;border-right-color:transparent;border-radius:50%;
               display:inline-block;animation:spin .8s linear infinite;vertical-align:-2px;margin-right:6px; }
    @keyframes spin { to { transform: rotate(360deg) } }
  `;
    document.head.appendChild(style);
}

/**
 * Компонент загрузки изображения (опрятные кнопки + спиннер).
 */
export function renderUploadImageComponent({element, onImageUrlChange}) {
    ensureActionStyles();

    let imageUrl = "";
    let isUploading = false;

    const render = () => {
        element.innerHTML = `
      <div class="upload-image" style="display:grid;gap:8px;">
        ${
            imageUrl
                ? `
              <div class="file-upload-image-container" style="display:grid;gap:8px;">
                <img class="file-upload-image" src="${imageUrl}" alt="Загруженное изображение" style="max-width:100%;border-radius:8px;">
                <div style="display:flex;gap:8px;">
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
                <input type="file" class="file-upload-input" style="display:none" ${isUploading ? "disabled" : ""} />
              </div>
            `
                : `
              <label class="file-upload-label secondary-button" style="display:inline-flex;align-items:center;gap:6px;cursor:pointer;">
                <input type="file" class="file-upload-input" style="display:none" ${isUploading ? "disabled" : ""}/>
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

        element.querySelector(".file-upload-label")?.addEventListener("click", (e) => {
            if (isUploading) {
                e.preventDefault();
                e.stopPropagation();
            }
        });
    };

    render();
}
