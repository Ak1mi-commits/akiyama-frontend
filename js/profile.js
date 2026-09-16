// ========== СТРАНИЦА ПРОФИЛЯ ==========

function tr(key, fallback) {
  if (window.t) {
    const v = window.t(key);
    if (v !== key) return v;
  }
  return fallback !== undefined ? fallback : key;
}

let selectedAvatar = null;

// ===== ЗАПОЛНИТЬ ПОЛЯ =====
function fillProfile() {
  const login = accounts.getCurrentLogin();
  const pageEl = document.getElementById("profilePage");
  const notLoggedEl = document.getElementById("profileNotLogged");

  if (!login) {
    pageEl.style.display = "none";
    notLoggedEl.style.display = "block";
    return;
  }

  pageEl.style.display = "block";
  notLoggedEl.style.display = "none";

  const user = accounts.getCurrentUser();
  if (!user) return;

  const rank = accounts.getRankByLogin(login);
  const pts = user.points || 0;
  const avatar = accounts.getUserAvatar(login);
  const displayName = user.displayName || login;
  const bio = user.bio || "";

  // Шапка
  document.getElementById("profilePageAvatar").textContent = avatar;
  document.getElementById("profilePageName").textContent = displayName;
  const rankName = (window.CURRENT_LANG === "en") ? (rank.name_en || rank.name_ru) : rank.name_ru;
document.getElementById("profilePageRank").textContent = rank.icon + " " + rankName;
  document.getElementById("profilePagePoints").textContent = "⚡ " + pts + " " + tr("shop_balance_points", "очков");

  // Выбор аватарки — отметить активный
  document.querySelectorAll(".avatar-option").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.emoji === avatar);
  });
  selectedAvatar = avatar;

  // Имя
  document.getElementById("inputDisplayName").value = displayName;

  // Bio
  document.getElementById("inputBio").value = bio;

  // Очищаем пароли
  document.getElementById("inputOldPassword").value = "";
  document.getElementById("inputNewPassword").value = "";
  document.getElementById("inputNewPassword2").value = "";

  // Ошибки
  document.getElementById("profileError").textContent = "";
}

// ===== ВЫБОР АВАТАРКИ =====
function initAvatarPicker() {
  // Показать корону только админам
  const login = accounts.getCurrentLogin();
  const user = accounts.getCurrentUser();
  const crownBtn = document.getElementById("crownOption");
  if (crownBtn && user && user.isAdmin) {
    crownBtn.style.display = "flex";
  }

  document.querySelectorAll(".avatar-option").forEach(btn => {
    btn.addEventListener("click", () => {
      selectedAvatar = btn.dataset.emoji;
      document.querySelectorAll(".avatar-option").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      document.getElementById("profilePageAvatar").textContent = selectedAvatar;
    });
  });
}

// ===== СОХРАНЕНИЕ =====
async function saveProfile() {
  const login = accounts.getCurrentLogin();
  if (!login) return;

  const errEl = document.getElementById("profileError");
  errEl.textContent = "";

  const displayName = document.getElementById("inputDisplayName").value.trim();
  const bio = document.getElementById("inputBio").value.trim();
  const oldPass = document.getElementById("inputOldPassword").value;
  const newPass = document.getElementById("inputNewPassword").value;
  const newPass2 = document.getElementById("inputNewPassword2").value;

  if (displayName.length < 2) {
    errEl.textContent = tr("profile_error_name", "Имя минимум 2 символа");
    return;
  }
  if (displayName.length > 20) {
    errEl.textContent = tr("profile_error_name_long", "Имя максимум 20 символов");
    return;
  }
  if (bio.length > 100) {
    errEl.textContent = tr("profile_error_bio", "Bio максимум 100 символов");
    return;
  }

  // Смена пароля (если введён старый)
  if (oldPass || newPass || newPass2) {
    if (!oldPass) {
      errEl.textContent = tr("profile_error_old_pass", "Введи старый пароль");
      return;
    }
    if (!newPass) {
      errEl.textContent = tr("profile_error_new_pass", "Введи новый пароль");
      return;
    }
    if (newPass.length < 4) {
      errEl.textContent = tr("profile_error_pass_short", "Пароль минимум 4 символа");
      return;
    }
    if (newPass !== newPass2) {
      errEl.textContent = tr("profile_error_pass_mismatch", "Пароли не совпадают");
      return;
    }

    // Проверка старого пароля
    const users = accounts.getUsers();
    const user = users[login];
    const oldHash = await accounts.hashPassword(oldPass);
    if (user.passwordHash !== oldHash) {
      errEl.textContent = tr("profile_error_wrong_pass", "Неверный старый пароль");
      return;
    }

    // Меняем пароль
    const newHash = await accounts.hashPassword(newPass);
    users[login].passwordHash = newHash;
    accounts.saveUsers(users);
  }

  // Сохраняем имя, био, аватар
  const users = accounts.getUsers();
  if (users[login]) {
    users[login].displayName = displayName;
    users[login].bio = bio;
    users[login].avatar = selectedAvatar;
    accounts.saveUsers(users);
  }

  // Тост
  let toast = document.getElementById("toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "toast";
    document.body.appendChild(toast);
  }
  toast.textContent = tr("profile_saved", "✅ Профиль сохранён!");
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2200);

  // Обновляем отображение
  fillProfile();

  // Обновляем кнопку в шапке
  const userName = document.getElementById("userName");
  if (userName) userName.textContent = displayName;
}

// ===== ЗАПУСК =====
async function initProfilePage() {
  // Ждём, пока main.js загрузит юзера
  if (!accounts.getCurrentUser() && window.getToken && window.getToken()) {
    await accounts.loadCurrentUser();
  }
  fillProfile();
  initAvatarPicker();

  document.getElementById("btnSaveProfile").addEventListener("click", saveProfile);
  document.getElementById("btnCancelProfile").addEventListener("click", () => {
    window.location.href = "index.html";
  });

  const loginBtn = document.getElementById("profileLoginBtn");
  if (loginBtn) {
    loginBtn.addEventListener("click", () => {
      document.getElementById("authModal").classList.add("open");
    });
  }
}

document.addEventListener("DOMContentLoaded", initProfilePage);
// ===== ПЕРЕРИСОВКА ПРИ СМЕНЕ ЯЗЫКА =====
window.addEventListener("langChanged", () => {
  fillProfile();
});