import { loginUser, registerUser } from "../../api/auth.js";
import { renderHeaderComponent } from "../header/header-component.js";
import { renderUploadImageComponent } from "../shared/upload-image-component.js";

/**
 * Компонент страницы авторизации/регистрации.
 * @param {{ appEl: HTMLElement, setUser: (user:any)=>void }} params
 */
export function renderAuthPageComponent({ appEl, setUser }) {
    let isLoginMode = true; // true: вход; false: регистрация
    let imageUrl = "";

    const renderForm = () => {
        const appHtml = `
      <div class="page-container">
          <div class="header-container"></div>
          <div class="form">
              <h3 class="form-title">
                ${isLoginMode ? "Вход в&nbsp;Instapro" : "Регистрация в&nbsp;Instapro"}
              </h3>
              <div class="form-inputs">
                  ${
            !isLoginMode
                ? `
                      <div class="upload-image-container"></div>
                      <input type="text" id="name-input" class="input" placeholder="Имя" />
                      `
                : ""
        }
                  <input type="text" id="login-input" class="input" placeholder="Логин" />
                  <input type="password" id="password-input" class="input" placeholder="Пароль" />
                  <div class="form-error"></div>
                  <button class="button" id="login-button">
                    ${isLoginMode ? "Войти" : "Зарегистрироваться"}
                  </button>
              </div>
              <div class="form-footer">
                <p class="form-footer-title">
                  ${isLoginMode ? "Нет аккаунта?" : "Уже есть аккаунт?"}
                  <button class="link-button" id="toggle-button">
                    ${isLoginMode ? "Зарегистрироваться." : "Войти."}
                  </button>
                </p>
              </div>
          </div>
      </div>    
    `;

        appEl.innerHTML = appHtml;

        const setError = (message) => {
            appEl.querySelector(".form-error").textContent = message;
        };

        renderHeaderComponent({
            element: document.querySelector(".header-container"),
        });

        const uploadImageContainer = appEl.querySelector(".upload-image-container");
        if (uploadImageContainer) {
            renderUploadImageComponent({
                element: uploadImageContainer,
                onImageUrlChange(newImageUrl) {
                    imageUrl = newImageUrl;
                },
            });
        }

        document.getElementById("login-button").addEventListener("click", () => {
            setError("");

            if (isLoginMode) {
                const login = document.getElementById("login-input").value;
                const password = document.getElementById("password-input").value;

                if (!login) return alert("Введите логин");
                if (!password) return alert("Введите пароль");

                loginUser({ login, password })
                    .then((user) => setUser(user.user))
                    .catch((error) => {
                        console.warn(error);
                        setError(error.message);
                    });
            } else {
                const login = document.getElementById("login-input").value;
                const name = document.getElementById("name-input").value;
                const password = document.getElementById("password-input").value;

                if (!name) return alert("Введите имя");
                if (!login) return alert("Введите логин");
                if (!password) return alert("Введите пароль");
                if (!imageUrl) return alert("Не выбрана фотография");

                registerUser({ login, password, name, imageUrl })
                    .then((user) => setUser(user.user))
                    .catch((error) => {
                        console.warn(error);
                        setError(error.message);
                    });
            }
        });

        document.getElementById("toggle-button").addEventListener("click", () => {
            isLoginMode = !isLoginMode;
            renderForm();
        });
    };

    renderForm();
}
