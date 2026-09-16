// ========== API ==========
// Адрес сервера. Локально — localhost. На проде поменяем на Render.
const API_URL = "https://akiyama-site.onrender.com/api";

// Токен хранится в localStorage под ключом akiyama_token
function getToken() {
  return localStorage.getItem("akiyama_token");
}

function setToken(token) {
  localStorage.setItem("akiyama_token", token);
}

function clearToken() {
  localStorage.removeItem("akiyama_token");
}

// Универсальная функция запроса
async function apiFetch(path, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {})
  };

  const token = getToken();
  if (token) headers["Authorization"] = "Bearer " + token;

  const res = await fetch(API_URL + path, {
    ...options,
    headers
  });

  let data = null;
  try { data = await res.json(); } catch (e) {}

  if (!res.ok) {
    return { ok: false, error: (data && data.error) || "Ошибка сети" };
  }
  return { ok: true, data };
}

// Обёртки
const API = {
  get: (path) => apiFetch(path),
  post: (path, body) => apiFetch(path, { method: "POST", body: JSON.stringify(body) }),
  put: (path, body) => apiFetch(path, { method: "PUT", body: JSON.stringify(body) }),
  del: (path) => apiFetch(path, { method: "DELETE" })
};

window.API = API;
window.getToken = getToken;
window.setToken = setToken;
window.clearToken = clearToken;
window.API_URL = API_URL;