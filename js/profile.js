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
  if (typeof accounts === 'undefined') return;

  const login = accounts.getCurrentLogin ? accounts.getCurrentLogin() : null;
  const pageEl = document.getElementById("profilePage");
  const notLoggedEl = document.getElementById("profileNotLogged");

  if (!login) {
    if (pageEl) pageEl.style.display = "none";
    if (notLoggedEl) notLoggedEl.style.display = "block";
    return;
  }

  if (pageEl) pageEl.style.display = "block";
  if (notLoggedEl) notLoggedEl.style.display = "none";

  const user = accounts.getCurrentUser ? accounts.getCurrentUser() : null;
  if (!user) return;

  const rank = accounts.getRankByLogin ? accounts.getRankByLogin(login) : { name_ru: "Новичок", name_en: "Novice", icon: "👤" };
  const pts = user.points || 0;
  const avatar = user.avatar || (accounts.DEFAULT_AVATAR || "👤");
  const displayName = user.displayName || login;
  const bio = user.bio || "";

  const avatarEl = document.getElementById("profilePageAvatar");
  const nameEl = document.getElementById("profilePageName");
  const rankEl = document.getElementById("profilePageRank");
  const pointsEl = document.getElementById("profilePagePoints");

  if (avatarEl) avatarEl.textContent = avatar;
  if (nameEl) nameEl.textContent = displayName;

  if (rankEl) {
    const rankName = (window.CURRENT_LANG === "en") ? (rank.name_en || rank.name_ru) : rank.name_ru;
    rankEl.textContent = rank.icon + " " + rankName;
  }

  if (pointsEl) pointsEl.textContent = "⚡ " + pts + " " + tr("shop_balance_points", "очков");

  document.querySelectorAll(".avatar-option").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.emoji === avatar);
  });
  selectedAvatar = avatar;

  const nameInput = document.getElementById("inputDisplayName");
  const bioInput = document.getElementById("inputBio");
  const oldPassInput = document.getElementById("inputOldPassword");
  const newPassInput = document.getElementById("inputNewPassword");
  const newPass2Input = document.getElementById("inputNewPassword2");
  const errorEl = document.getElementById("profileError");

  if (nameInput) nameInput.value = displayName;
  if (bioInput) bioInput.value = bio;
  if (oldPassInput) oldPassInput.value = "";
  if (newPassInput) newPassInput.value = "";
  if (newPass2Input) newPass2Input.value = "";
  if (errorEl) errorEl.textContent = "";
}

// ===== ВЫБОР АВАТАРКИ =====
function initAvatarPicker() {
  if (typeof accounts === 'undefined') return;

  const user = accounts.getCurrentUser ? accounts.getCurrentUser() : null;
  const crownBtn = document.getElementById("crownOption");
  if (crownBtn && user && user.isAdmin) {
    crownBtn.style.display = "flex";
  }

  document.querySelectorAll(".avatar-option").forEach(btn => {
    btn.addEventListener("click", () => {
      selectedAvatar = btn.dataset.emoji;
      document.querySelectorAll(".avatar-option").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const avatarEl = document.getElementById("profilePageAvatar");
      if (avatarEl) avatarEl.textContent = selectedAvatar;
    });
  });
}

// ===== СОХРАНЕНИЕ =====
async function saveProfile() {
  if (typeof accounts === 'undefined') {
    alert("Ошибка: система аккаунтов не загружена");
    return;
  }

  const login = accounts.getCurrentLogin();
  if (!login) return;

  const errEl = document.getElementById("profileError");
  if (errEl) errEl.textContent = "";

  const displayName = document.getElementById("inputDisplayName").value.trim();
  const bio = document.getElementById("inputBio").value.trim();
  const oldPass = document.getElementById("inputOldPassword").value;
  const newPass = document.getElementById("inputNewPassword").value;
  const newPass2 = document.getElementById("inputNewPassword2").value;

  // Валидация
  if (displayName.length < 2) { if (errEl) errEl.textContent = tr("profile_error_name", "Имя минимум 2 символа"); return; }
  if (displayName.length > 20) { if (errEl) errEl.textContent = tr("profile_error_name_long", "Имя максимум 20 символов"); return; }
  if (bio.length > 100) { if (errEl) errEl.textContent = tr("profile_error_bio", "Bio максимум 100 символов"); return; }

  // Смена пароля
  if (oldPass || newPass || newPass2) {
    if (!oldPass) { if (errEl) errEl.textContent = tr("profile_error_old_pass", "Введи старый пароль"); return; }
    if (!newPass) { if (errEl) errEl.textContent = tr("profile_error_new_pass", "Введи новый пароль"); return; }
    if (newPass.length < 4) { if (errEl) errEl.textContent = tr("profile_error_pass_short", "Пароль минимум 4 символа"); return; }
    if (newPass !== newPass2) { if (errEl) errEl.textContent = tr("profile_error_pass_mismatch", "Пароли не совпадают"); return; }

    const res = await accounts.changePassword(oldPass, newPass);
    if (!res.ok) { if (errEl) errEl.textContent = "❌ " + res.error; return; }
  }

  // Сохранение имени, био, аватара
  const res = await accounts.updateProfile({ displayName, bio, avatar: selectedAvatar });
  if (!res.ok) { if (errEl) errEl.textContent = "❌ " + res.error; return; }

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

  fillProfile();

  const userName = document.getElementById("userName");
  if (userName) userName.textContent = displayName;

  if (window.__refreshUserBtn) window.__refreshUserBtn();
}

// ===== ЗАПУСК =====
async function initProfilePage() {
  if (typeof accounts === 'undefined') return;

  if (!accounts.getCurrentUser() && window.getToken && window.getToken()) {
    await accounts.loadCurrentUser();
  }

  fillProfile();
  initAvatarPicker();

  const saveBtn = document.getElementById("btnSaveProfile");
  const cancelBtn = document.getElementById("btnCancelProfile");
  const loginBtn = document.getElementById("profileLoginBtn");

  if (saveBtn) saveBtn.addEventListener("click", saveProfile);
  if (cancelBtn) {
    cancelBtn.addEventListener("click", () => {
      window.location.href = "index.html";
    });
  }
  if (loginBtn) {
    loginBtn.addEventListener("click", () => {
      const authModal = document.getElementById("authModal");
      if (authModal) authModal.classList.add("open");
    });
  }
}

document.addEventListener("DOMContentLoaded", initProfilePage);

window.addEventListener("langChanged", () => {
  fillProfile();
});