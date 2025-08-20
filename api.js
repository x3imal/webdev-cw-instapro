const personalKey = "x3im";
const baseHost = "https://webdev-hw-api.vercel.app";
const postsHost = `${baseHost}/api/v1/${personalKey}/instapro`;

export function getPosts({ token }) {
  return fetch(postsHost, {
    method: "GET",
    headers: {
      Authorization: token,
    },
  })
    .then((response) => {
      if (response.status === 401) {
        throw new Error("Нет авторизации");
      }

      return response.json();
    })
    .then((data) => {
      return data.posts;
    });
}

export function registerUser({ login, password, name, imageUrl }) {
  return fetch(baseHost + "/api/user", {
    method: "POST",
    body: JSON.stringify({
      login,
      password,
      name,
      imageUrl,
    }),
  }).then((response) => {
    if (response.status === 400) {
      throw new Error("Такой пользователь уже существует");
    }
    return response.json();
  });
}

export function loginUser({ login, password }) {
  return fetch(baseHost + "/api/user/login", {
    method: "POST",
    body: JSON.stringify({
      login,
      password,
    }),
  }).then((response) => {
    if (response.status === 400) {
      throw new Error("Неверный логин или пароль");
    }
    return response.json();
  });
}

// Загружает картинку в облако, возвращает url загруженной картинки
export function uploadImage({ file }) {
  const data = new FormData();
  data.append("file", file);

  return fetch(baseHost + "/api/upload/image", {
    method: "POST",
    body: data,
  }).then((response) => {
    return response.json();
  });
}

export function addPost({ description, imageUrl, token }) {
    return fetch(postsHost, {
        method: "POST",
        headers: {
            Authorization: token,
        },
        body: JSON.stringify({ description, imageUrl }),
    }).then(async (response) => {
        if (!response.ok) {
            let msg = `Ошибка ${response.status}`;
            try {
                const data = await response.json();
                if (data?.error) msg = data.error;
                if (data?.message) msg = data.message;
            } catch {}
            throw new Error(msg);
        }
        return response.json();
    });
}

export function getUserPosts({ userId, token }) {
    const url = `${postsHost}/user-posts?userId=${encodeURIComponent(userId)}`;
    return fetch(url, {
        method: "GET",
        headers: { Authorization: token },
    })
        .then((response) => {
            if (response.status === 401) throw new Error("Нет авторизации");
            return response.json();
        })
        .then((data) => data.posts);
}

export function toggleLike({ postId, token }) {
    const url = `${postsHost}/${postId}/like`;
    return fetch(url, {
        method: "POST",
        headers: { Authorization: token },
    }).then(async (response) => {
        if (!response.ok) {
            let msg = `Ошибка ${response.status}`;
            try {
                const data = await response.json();
                if (data?.error) msg = data.error;
                if (data?.message) msg = data.message;
            } catch {}
            throw new Error(msg);
        }
        return response.json().catch(() => null);
    });
}
