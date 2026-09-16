// ========== СИСТЕМА АККАУНТОВ (API) ==========

const ADMIN_LOGIN = "Akimi";
const DEFAULT_AVATAR = "😎";

// Локальный кэш юзера (для скорости, чтобы не дёргать API каждый раз)
let _currentUser = null;

// ===== РАНГИ =====
const RANKS = [
  { min: 0,    name_ru: "Новичок",       name_en: "Newbie",       icon: "🐣", color: "#7a8a9a" },
  { min: 10,   name_ru: "Участник",      name_en: "Member",       icon: "👤", color: "#8aa0b0" },
  { min: 30,   name_ru: "Писатель",      name_en: "Writer",       icon: "✍️", color: "#00cc66" },
  { min: 60,   name_ru: "Активный",      name_en: "Active",       icon: "🔥", color: "#00ff88" },
  { min: 120,  name_ru: "Опытный",       name_en: "Experienced",  icon: "⭐", color: "#ffcc00" },
  { min: 200,  name_ru: "Ветеран",       name_en: "Veteran",      icon: "💎", color: "#4dd0e1" },
  { min: 350,  name_ru: "Профи",         name_en: "Pro",          icon: "🚀", color: "#ff6b35" },
  { min: 550,  name_ru: "Легенда",       name_en: "Legend",       icon: "👑", color: "#ff00ff" },
  { min: 900,  name_ru: "Гуру",          name_en: "Guru",         icon: "🌟", color: "#ffcc00" },
  { min: 1500, name_ru: "Грандмастер",   name_en: "Grandmaster",  icon: "🏆", color: "#ff3366" }
];

function getRank(points) {
  let rank = RANKS[0];
  for (const r of RANKS) if (points >= r.min) rank = r;
  return rank;
}

function getRankByLogin(login) {
  if (login === ADMIN_LOGIN) {
    return { name_ru: "Создатель", name_en: "Creator", icon: "⚡", color: "#00ff88", min: 9999 };
  }
  const user = _currentUser && _currentUser.login === login ? _currentUser : null;
  return getRank(user ? user.points || 0 : 0);
}

function getRankProgress(points) {
  const current = getRank(points);
  const idx = RANKS.indexOf(current);
  const next = RANKS[idx + 1];
  if (!next) return { current, next: null, percent: 100 };
  const range = next.min - current.min;
  const done = points - current.min;
  return { current, next, percent: Math.min(100, Math.round((done / range) * 100)) };
}

// ===== ТЕКУЩИЙ ЮЗЕР =====
function getCurrentLogin() {
  return _currentUser ? _currentUser.login : null;
}

function getCurrentUser() {
  return _currentUser;
}

function isAdmin() {
  return _currentUser && _currentUser.isAdmin === true;
}

// Загрузить юзера с сервера (по токену). Вызывается один раз при загрузке страницы.
async function loadCurrentUser() {
  const token = window.getToken && window.getToken();
  if (!token) { _currentUser = null; return null; }
  const res = await API.get("/me");
  if (!res.ok) {
    window.clearToken();
    _currentUser = null;
    return null;
  }
  _currentUser = res.data;
  return _currentUser;
}

// Установить кэш вручную (после логина/регистрации)
function setCurrentUser(user) {
  _currentUser = user;
}

// ===== АВАТАРКА / НИК / БЕЙДЖ =====
function getUserAvatar(login) {
  if (!login) return DEFAULT_AVATAR;
  // Если это текущий юзер — из кэша
  if (_currentUser && _currentUser.login === login) {
    return _currentUser.avatar || DEFAULT_AVATAR;
  }
  // Иначе из временного кэша (кто-то другой)
  return _userAvatarCache[login] || DEFAULT_AVATAR;
}

function getDisplayName(login) {
  if (!login) return "?";
  if (_currentUser && _currentUser.login === login) {
    return _currentUser.displayName || login;
  }
  return _userDisplayNameCache[login] || login;
}

function getUserBadge(login) {
  if (!login) return null;
  if (_currentUser && _currentUser.login === login) {
    return _currentUser.activeBadge || null;
  }
  return _userBadgeCache[login] || null;
}

// Кэш чужих юзеров (подтягивается batch-запросом)
const _userAvatarCache = {};
const _userDisplayNameCache = {};
const _userBadgeCache = {};

// Загрузить пачку юзеров по логинам (для комментов, отзывов)
async function loadUsersBatch(logins) {
  const unique = [...new Set(logins)].filter(l => l && !(l === getCurrentLogin()));
  if (!unique.length) return;
  const res = await API.post("/users/batch", { logins: unique });
  if (!res.ok) return;
  Object.values(res.data).forEach(u => {
    _userAvatarCache[u.login] = u.avatar;
    _userDisplayNameCache[u.login] = u.displayName;
    _userBadgeCache[u.login] = u.activeBadge || null;
  });
}

// ===== РЕГИСТРАЦИЯ =====
async function registerUser(login, password) {
  const res = await API.post("/register", { login, password });
  if (!res.ok) return { ok: false, error: res.error };
  window.setToken(res.data.token);
  setCurrentUser(res.data.user);
  return { ok: true };
}

// ===== ВХОД =====
async function loginUser(login, password) {
  const res = await API.post("/login", { login, password });
  if (!res.ok) return { ok: false, error: res.error };
  window.setToken(res.data.token);
  setCurrentUser(res.data.user);
  return { ok: true, isAdmin: res.data.user.isAdmin };
}

// ===== ВЫХОД =====
function logoutUser() {
  window.clearToken();
  _currentUser = null;
}

// ===== СМЕНА ПАРОЛЯ =====
async function changePassword(oldPassword, newPassword) {
  const res = await API.put("/me/password", { oldPassword, newPassword });
  return res;
}

// ===== ОБНОВЛЕНИЕ ПРОФИЛЯ =====
async function updateProfile(data) {
  const res = await API.put("/me", data);
  if (res.ok) setCurrentUser(res.data);
  return res;
}

// ===== ЭКСПОРТ =====
window.accounts = {
  ADMIN_LOGIN,
  DEFAULT_AVATAR,
  getRank,
  getRankByLogin,
  getRankProgress,
  getCurrentLogin,
  getCurrentUser,
  isAdmin,
  loadCurrentUser,
  setCurrentUser,
  getUserAvatar,
  getDisplayName,
  getUserBadge,
  loadUsersBatch,
  registerUser,
  loginUser,
  logoutUser,
  changePassword,
  updateProfile
};