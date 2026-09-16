// ========== ФОРМАТИРОВАНИЕ ВРЕМЕНИ ==========
function timeAgo(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diff = Math.floor((now - date) / 1000);
  const en = window.CURRENT_LANG === "en";

  if (diff < 0) return en ? "just now" : "только что";
  if (diff < 60) return en ? "just now" : "только что";
  if (diff < 3600) return en ? Math.floor(diff / 60) + " min ago" : Math.floor(diff / 60) + " мин назад";
  if (diff < 86400) return en ? Math.floor(diff / 3600) + " h ago" : Math.floor(diff / 3600) + " ч назад";
  if (diff < 172800) return en ? "yesterday" : "вчера";
  if (diff < 604800) return en ? Math.floor(diff / 86400) + " d ago" : Math.floor(diff / 86400) + " дн назад";

  return date.toLocaleDateString(en ? "en-US" : "ru-RU", { day: "numeric", month: "long" });
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function tr(key, fallback) {
  if (window.t) {
    const v = window.t(key);
    if (v !== key) return v;
  }
  return fallback !== undefined ? fallback : key;
}

function showToast(msg) {
  let toast = document.getElementById("toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "toast";
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add("show");
  clearTimeout(toast._t);
  toast._t = setTimeout(() => toast.classList.remove("show"), 2200);
}

// ========== КОММЕНТЫ (загружаются с сервера) ==========
const _commentsCache = {}; // postId -> массив комментов

async function loadComments(postId) {
  const res = await API.get(`/posts/${postId}/comments`);
  if (res.ok) _commentsCache[postId] = res.data;
  return _commentsCache[postId] || [];
}

function renderComments(postId) {
  const comments = _commentsCache[postId] || [];
  if (!comments.length) {
    return `<div class="comments-empty">${tr("comment_empty", "Комментов пока нет. Будь первым!")}</div>`;
  }
  return comments.map(c => {
    const badge = accounts.getUserBadge(c.author);
    const badgeHtml = badge ? `<span class="user-badge">${badge}</span>` : "";
    const avatar = accounts.getUserAvatar(c.author);
    const displayName = accounts.getDisplayName(c.author);
    return `
      <div class="comment">
        <div class="comment-avatar">${avatar}</div>
        <div class="comment-body">
          <div class="comment-head">
            <a href="user.html?u=${encodeURIComponent(c.author)}" class="comment-author">${escapeHtml(displayName)}${badgeHtml}</a>
            <span class="comment-time">${timeAgo(c.date)}</span>
          </div>
          <div class="comment-text">${escapeHtml(c.text)}</div>
        </div>
      </div>
    `;
  }).join("");
}

// ========== РЕНДЕР ПОСТА ==========
function localizePost(post) {
  const en = window.CURRENT_LANG === "en";
  const text = en
    ? (post.text_en || post.text_ru || post.text || "")
    : (post.text_ru || post.text || "");
  const tags = en
    ? (post.tags_en || post.tags_ru || post.tags || [])
    : (post.tags_ru || post.tags || []);
  return { ...post, text, tags };
}

function renderPost(post) {
  post = localizePost(post);
  const login = accounts.getCurrentLogin();
  const likers = post.likes || [];
  const liked = login ? likers.includes(login) : false;
  const comments = _commentsCache[post._id] || [];
  const commentsCount = comments.length;
  const realLikes = likers.length;

  let tagsHtml = "";
  if (post.tags && post.tags.length) {
    tagsHtml = '<div class="post-tags">' +
      post.tags.map(t => `<span class="post-tag">#${t}</span>`).join("") +
      '</div>';
  }

  const editBtn = accounts.isAdmin()
    ? `<button class="post-edit-btn" data-id="${post._id}" title="✏️">✏️</button>`
    : "";

  return `
    <article class="post" id="post-${post._id}" data-id="${post._id}">
      <div class="post-header">
        <div class="post-avatar">👑</div>
        <div class="post-user">
          <div class="post-name">Akiyama</div>
          <div class="post-time">${timeAgo(post.date)}</div>
        </div>
        ${editBtn}
      </div>
      <div class="post-text">${escapeHtml(post.text)}</div>
      ${tagsHtml}
      <div class="post-actions">
        <div class="post-action like-btn ${liked ? "liked" : ""}" data-id="${post._id}">
          <span class="like-icon">${liked ? "❤️" : "🤍"}</span>
          <span class="like-count">${realLikes}</span>
        </div>
        <div class="post-action comment-toggle" data-id="${post._id}">
          💬 <span class="comment-count">${commentsCount}</span>
        </div>
        <div class="post-action share-btn" data-id="${post._id}">
          ${tr("post_share", "🔗 Поделиться")}
        </div>
      </div>

      <div class="comments-block" id="comments-${post._id}" style="display:none;">
        <div class="comments-list" id="comments-list-${post._id}">
          ${renderComments(post._id)}
        </div>
        <form class="comment-form" data-id="${post._id}">
          <input type="text" class="comment-input" placeholder="${tr("comment_placeholder", "Написать коммент...")}" maxlength="300" required>
          <button type="submit" class="comment-submit">➤</button>
        </form>
      </div>
    </article>
  `;
}

// ========== ЗАГРУЗКА ПОСТОВ ==========
let allPosts = [];
let shownPosts = 0;
const POSTS_PER_PAGE = 5;

async function loadPosts() {
  const feed = document.getElementById("feed");
  const loadMoreBtn = document.getElementById("loadMore");
  if (!feed) return;

  // Первый раз — грузим с сервера
  if (!allPosts.length) {
    const res = await API.get("/posts");
    if (!res.ok) {
      feed.innerHTML = `<div class="review-empty">Ошибка загрузки постов</div>`;
      return;
    }
    allPosts = res.data;

    // Предзагружаем комменты ко всем постам
    for (const p of allPosts) {
      await loadComments(p._id);
    }

    // Подтягиваем инфу о юзерах для комментов
    const allLogins = [];
    Object.values(_commentsCache).forEach(arr => arr.forEach(c => allLogins.push(c.author)));
    if (allLogins.length) await accounts.loadUsersBatch(allLogins);
  }

  const nextPosts = allPosts.slice(shownPosts, shownPosts + POSTS_PER_PAGE);
  nextPosts.forEach(post => {
    feed.insertAdjacentHTML("beforeend", renderPost(post));
  });
  shownPosts += nextPosts.length;

  if (shownPosts >= allPosts.length && loadMoreBtn) {
    loadMoreBtn.style.display = "none";
  }

  attachHandlers();
}

// ========== ОБРАБОТЧИКИ ==========
function attachHandlers() {
  document.querySelectorAll(".like-btn").forEach(btn => {
    if (btn.dataset.bound === "1") return;
    btn.dataset.bound = "1";

    btn.addEventListener("click", async function () {
      const id = this.dataset.id;
      const login = accounts.getCurrentLogin();
      if (!login) {
        alert(tr("comment_need_login", "Сначала войди через кнопку сверху 👆"));
        return;
      }

      const countEl = this.querySelector(".like-count");
      const iconEl = this.querySelector(".like-icon");

      const res = await API.post(`/posts/${id}/like`);
      if (!res.ok) {
        showToast("❌ " + res.error);
        return;
      }

      const likers = res.data.likes;
      const liked = likers.includes(login);
      this.classList.toggle("liked", liked);
      iconEl.textContent = liked ? "❤️" : "🤍";
      countEl.textContent = likers.length;

      // Обновляем локальный пост
      const post = allPosts.find(p => p._id === id);
      if (post) post.likes = likers;
    });
  });

  document.querySelectorAll(".comment-toggle").forEach(btn => {
    if (btn.dataset.bound === "1") return;
    btn.dataset.bound = "1";

    btn.addEventListener("click", function () {
      const id = this.dataset.id;
      const block = document.getElementById("comments-" + id);
      if (!block) return;
      const isOpen = block.style.display !== "none";
      block.style.display = isOpen ? "none" : "block";
      if (!isOpen) {
        const input = block.querySelector(".comment-input");
        if (input) input.focus();
      }
    });
  });

  document.querySelectorAll(".comment-form").forEach(form => {
    if (form.dataset.bound === "1") return;
    form.dataset.bound = "1";

    form.addEventListener("submit", async function (e) {
      e.preventDefault();
      const id = this.dataset.id;
      const input = this.querySelector(".comment-input");
      const text = input.value.trim();
      if (!text) return;

      const current = accounts.getCurrentLogin();
      if (!current) {
        alert(tr("comment_need_login", "Сначала войди через кнопку сверху 👆"));
        return;
      }

      const res = await API.post(`/posts/${id}/comments`, { text });
      if (!res.ok) {
        showToast("❌ " + res.error);
        return;
      }

      // Обновляем кэш и рендерим
      if (!_commentsCache[id]) _commentsCache[id] = [];
      _commentsCache[id].push(res.data);

      // Обновляем свой профиль (очки)
      await accounts.loadCurrentUser();
      if (window.__refreshMenuHeader) window.__refreshMenuHeader();

      input.value = "";
      const list = document.getElementById("comments-list-" + id);
      if (list) list.innerHTML = renderComments(id);

      const countEl = document.querySelector(`.comment-toggle[data-id="${id}"] .comment-count`);
      if (countEl) countEl.textContent = _commentsCache[id].length;
    });
  });

  document.querySelectorAll(".share-btn").forEach(btn => {
    if (btn.dataset.bound === "1") return;
    btn.dataset.bound = "1";

    btn.addEventListener("click", async function () {
      const id = this.dataset.id;
      const url = window.location.origin + window.location.pathname + "#post-" + id;
      try {
        await navigator.clipboard.writeText(url);
        this.innerHTML = tr("post_share_copied", "✅ Скопировано");
        setTimeout(() => { this.innerHTML = tr("post_share", "🔗 Поделиться"); }, 1500);
      } catch (e) {
        prompt("Скопируй ссылку:", url);
      }
    });
  });

  document.querySelectorAll(".post-edit-btn").forEach(btn => {
    if (btn.dataset.bound === "1") return;
    btn.dataset.bound = "1";
    btn.addEventListener("click", () => {
      const id = btn.dataset.id;
      const post = allPosts.find(p => p._id === id);
      if (post) openPostEditor(post);
    });
  });
}

// ========== АДМИН-ПАНЕЛЬ ПОСТОВ ==========
function initAdminPanel() {
  const feedSection = document.querySelector(".feed-section .container");
  if (!feedSection) return;
  const old = document.getElementById("adminPostForm");
  if (old) old.remove();
  if (!accounts.isAdmin()) return;

  const form = document.createElement("div");
  form.id = "adminPostForm";
  form.className = "admin-post-form";
  form.innerHTML = `
    <h3 class="admin-post-title">${tr("admin_create_post", "⚡ Создать пост (админ)")}</h3>
    <textarea id="newPostText" placeholder="${tr("admin_post_ph", "Что нового?")}" maxlength="1000"></textarea>
    <input type="text" id="newPostTags" placeholder="${tr("admin_post_tags_ph", "Теги через запятую")}">
    <button id="newPostBtn" class="admin-post-btn">${tr("admin_post_publish", "📤 Опубликовать")}</button>
    <div class="admin-post-error" id="newPostError"></div>
  `;
  const h2 = feedSection.querySelector(".section-title");
  if (h2) h2.insertAdjacentElement("afterend", form);

  document.getElementById("newPostBtn").addEventListener("click", async () => {
    const textEl = document.getElementById("newPostText");
    const tagsEl = document.getElementById("newPostTags");
    const errEl = document.getElementById("newPostError");
    const text = textEl.value.trim();
    const tagsRaw = tagsEl.value.trim();
    errEl.textContent = "";

    if (text.length < 5) {
      errEl.textContent = tr("admin_post_error_text", "Текст минимум 5 символов");
      return;
    }
    const tags = tagsRaw ? tagsRaw.split(",").map(t => t.trim()).filter(Boolean) : [];

    const res = await API.post("/posts", { text, tags });
    if (!res.ok) {
      errEl.textContent = "❌ " + res.error;
      return;
    }

    textEl.value = "";
    tagsEl.value = "";

    // Перезагружаем все посты
    allPosts = [];
    shownPosts = 0;
    const feed = document.getElementById("feed");
    if (feed) feed.innerHTML = "";
    loadPosts();
    window.scrollTo({ top: 0, behavior: "smooth" });
    showToast(tr("admin_post_added", "✅ Пост опубликован!"));
  });
}

// ========== РЕДАКТОР ПОСТА ==========
function openPostEditor(post) {
  let modal = document.getElementById("postEditorModal");
  if (modal) modal.remove();

  modal = document.createElement("div");
  modal.id = "postEditorModal";
  modal.className = "modal open";
  modal.innerHTML = `
    <div class="modal-content" style="max-width: 560px;">
      <button class="modal-close" id="postEditClose">✕</button>
      <h2 class="modal-title">✏️ ${tr("admin_edit_post", "Редактировать пост")}</h2>
      <label class="modal-label">
        <span>${tr("admin_post_text", "Текст")}</span>
        <textarea id="editPostText" class="modal-input" style="min-height:140px; resize:vertical;" maxlength="1000">${escapeHtml(post.text)}</textarea>
      </label>
      <label class="modal-label">
        <span>${tr("admin_post_tags", "Теги через запятую")}</span>
        <input type="text" id="editPostTags" class="modal-input" value="${escapeHtml((post.tags || []).join(", "))}">
      </label>
      <div class="modal-error" id="postEditError"></div>
      <div style="display:flex; gap:10px; margin-top:8px;">
        <button class="admin-post-btn" id="postEditSave" style="flex:1;">💾 ${tr("profile_save", "Сохранить")}</button>
        <button class="settings-action-btn danger" id="postEditDelete" style="flex:1;">🗑️ ${tr("delete", "Удалить")}</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  const close = () => modal.remove();
  document.getElementById("postEditClose").addEventListener("click", close);
  modal.addEventListener("click", (e) => { if (e.target === modal) close(); });

  document.getElementById("postEditSave").addEventListener("click", async () => {
    const text = document.getElementById("editPostText").value.trim();
    const tagsRaw = document.getElementById("editPostTags").value.trim();
    const errEl = document.getElementById("postEditError");
    errEl.textContent = "";
    if (text.length < 5) { errEl.textContent = tr("admin_post_error_text", "Текст минимум 5 символов"); return; }

    const tags = tagsRaw ? tagsRaw.split(",").map(t => t.trim()).filter(Boolean) : [];
    const res = await API.put(`/posts/${post._id}`, { text, tags });
    if (!res.ok) { errEl.textContent = "❌ " + res.error; return; }

    close();
    allPosts = [];
    shownPosts = 0;
    const feed = document.getElementById("feed");
    if (feed) feed.innerHTML = "";
    loadPosts();
    showToast(tr("admin_post_updated", "✅ Пост обновлён!"));
  });

  document.getElementById("postEditDelete").addEventListener("click", async () => {
    if (!confirm(tr("admin_post_confirm_delete", "Удалить пост?"))) return;
    const res = await API.del(`/posts/${post._id}`);
    if (!res.ok) { showToast("❌ " + res.error); return; }
    close();
    allPosts = [];
    shownPosts = 0;
    const feed = document.getElementById("feed");
    if (feed) feed.innerHTML = "";
    loadPosts();
    showToast(tr("admin_post_deleted", "🗑️ Пост удалён"));
  });
}

// ========== СКРОЛЛ К ПОСТУ ==========
function scrollToHashPost() {
  const hash = window.location.hash;
  if (!hash || !hash.startsWith("#post-")) return;
  const el = document.querySelector(hash);
  if (!el) return;
  setTimeout(() => {
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    el.classList.add("highlight");
    setTimeout(() => el.classList.remove("highlight"), 3000);
  }, 300);
}

// ========== БУРГЕР ==========
function initBurger() {
  const burger = document.getElementById("burger");
  const nav = document.getElementById("nav");
  if (!burger || !nav) return;
  burger.addEventListener("click", () => nav.classList.toggle("open"));
  document.querySelectorAll(".nav-link").forEach(link => {
    link.addEventListener("click", () => nav.classList.remove("open"));
  });
}

// ========== АКТИВНАЯ ВКЛАДКА ==========
function initActiveNav() {
  const path = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav .nav-link").forEach(link => {
    const href = link.getAttribute("href");
    if (!href) return;
    link.classList.toggle("active", href === path);
  });
}

// ========== АВТОРИЗАЦИЯ + МЕНЮ ==========
function initAuthModal() {
  const userBtn = document.getElementById("userBtn");
  const modal = document.getElementById("authModal");
  const closeBtn = document.getElementById("modalClose");
  if (!userBtn || !modal) return;

  const userIcon = document.getElementById("userIcon");
  const userName = document.getElementById("userName");
  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");
  const loginError = document.getElementById("loginError");
  const regError = document.getElementById("regError");
  const tabs = document.querySelectorAll(".modal-tab");

  let userMenu = document.getElementById("userMenu");

  function buildUserMenu() {
    const old = document.getElementById("userMenu");
    if (old) old.remove();
    const wrap = document.createElement("div");
    wrap.className = "user-menu-wrap";
    wrap.innerHTML = `
      <div class="user-menu" id="userMenu">
        <div class="user-menu-header" id="userMenuHeader"></div>
        <button class="user-menu-item" id="menuProfile">
          <span class="menu-icon">👤</span>
          <span data-i18n="menu_profile">Настройки профиля</span>
        </button>
        <button class="user-menu-item danger" id="menuLogout">
          <span class="menu-icon">🚪</span>
          <span data-i18n="menu_logout">Выйти</span>
        </button>
      </div>
    `;
    userBtn.parentNode.insertBefore(wrap, userBtn);
    wrap.appendChild(userBtn);
    userMenu = document.getElementById("userMenu");

    document.getElementById("menuProfile").addEventListener("click", () => {
      window.location.href = "profile.html";
    });
    document.getElementById("menuLogout").addEventListener("click", () => {
      accounts.logoutUser();
      location.reload();
    });
    if (window.t) {
      wrap.querySelectorAll("[data-i18n]").forEach(el => {
        const v = window.t(el.dataset.i18n);
        if (v !== el.dataset.i18n) el.textContent = v;
      });
    }
  }

  function refreshMenuHeader() {
    const header = document.getElementById("userMenuHeader");
    if (!header) return;
    const login = accounts.getCurrentLogin();
    if (!login) return;
    const rank = accounts.getRankByLogin(login);
    const user = accounts.getCurrentUser();
    const pts = user ? (user.points || 0) : 0;
    const prog = accounts.getRankProgress(pts);
    const en = window.CURRENT_LANG === "en";
    const rankName = en ? (rank.name_en || rank.name_ru) : rank.name_ru;

    let progressHtml = "";
    if (prog.next) {
      const nextName = en ? (prog.next.name_en || prog.next.name_ru) : prog.next.name_ru;
      progressHtml = `
        <div class="user-menu-progress">
          <div class="user-menu-progress-bar" style="width:${prog.percent}%"></div>
        </div>
        <div class="user-menu-progress-text">${pts} / ${prog.next.min} → ${prog.next.icon} ${nextName}</div>
      `;
    } else {
      progressHtml = `
        <div class="user-menu-progress"><div class="user-menu-progress-bar" style="width:100%"></div></div>
        <div class="user-menu-progress-text">MAX 🏆</div>
      `;
    }

    header.innerHTML = `
      <div class="user-menu-name">👤 ${login}</div>
      <div class="user-menu-rank">${rank.icon} ${rankName}</div>
      <div class="user-menu-points">⚡ ${pts} ${tr("shop_balance_points", "очков")}</div>
      ${progressHtml}
    `;
  }

  function refreshUserBtn() {
    const login = accounts.getCurrentLogin();
    if (login) {
      const name = accounts.getDisplayName(login);
      userName.textContent = name;
      userIcon.textContent = "👤";
      userBtn.classList.add("logged-in");
    } else {
      userName.textContent = tr("login", "Войти");
      userIcon.textContent = "👤";
      userBtn.classList.remove("logged-in");
    }
  }

  function refreshMenuLang() {
    const menuProfile = document.getElementById("menuProfile");
    const menuLogout = document.getElementById("menuLogout");
    if (menuProfile) {
      const span = menuProfile.querySelector("span:last-child");
      if (span) span.textContent = tr("menu_profile", "Настройки профиля");
    }
    if (menuLogout) {
      const span = menuLogout.querySelector("span:last-child");
      if (span) span.textContent = tr("menu_logout", "Выйти");
    }
  }

  function closeMenu() { if (userMenu) userMenu.classList.remove("open"); }

  document.addEventListener("click", (e) => {
    if (!userMenu) return;
    if (userMenu.classList.contains("open")) {
      if (!userMenu.contains(e.target) && !userBtn.contains(e.target)) closeMenu();
    }
  });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeMenu(); });

  buildUserMenu();

  userBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    const login = accounts.getCurrentLogin();
    if (login) {
      refreshMenuHeader();
      userMenu.classList.toggle("open");
    } else {
      modal.classList.add("open");
    }
  });

  closeBtn.addEventListener("click", () => modal.classList.remove("open"));
  modal.addEventListener("click", (e) => { if (e.target === modal) modal.classList.remove("open"); });

  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      tabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      const target = tab.dataset.tab;
      document.querySelectorAll(".modal-form").forEach(f => f.classList.remove("active"));
      if (target === "login") loginForm.classList.add("active");
      else registerForm.classList.add("active");
    });
  });

  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    regError.textContent = "";
    const u = document.getElementById("regUsername").value.trim();
    const p = document.getElementById("regPassword").value;
    const p2 = document.getElementById("regPassword2").value;
    if (p !== p2) return (regError.textContent = "Пароли не совпадают");

    const result = await accounts.registerUser(u, p);
    if (!result.ok) return (regError.textContent = result.error);

    modal.classList.remove("open");
    registerForm.reset();
    location.reload();
  });

  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    loginError.textContent = "";
    const u = document.getElementById("loginUsername").value.trim();
    const p = document.getElementById("loginPassword").value;
    const result = await accounts.loginUser(u, p);
    if (!result.ok) return (loginError.textContent = result.error);
    modal.classList.remove("open");
    loginForm.reset();
    location.reload();
  });

  refreshUserBtn();
  window.__refreshMenuLang = refreshMenuLang;
  window.__refreshUserBtn = refreshUserBtn;
  window.__refreshMenuHeader = refreshMenuHeader;
}

// ========== ДОСТИЖЕНИЕ ==========
function initProjectsAchievement() {
  const card = document.getElementById("projectsAchievement");
  const details = document.getElementById("projectsDetails");
  if (!card || !details) return;
  card.addEventListener("click", () => {
    details.classList.toggle("open");
    const hint = card.querySelector(".achievement-hint");
    if (hint) {
      hint.textContent = details.classList.contains("open")
        ? tr("ach_projects_hint_open", "нажми чтобы скрыть ▴")
        : tr("ach_projects_hint", "нажми чтобы раскрыть ▾");
    }
  });
}

// ========== ДНИ В РАБОТЕ ==========
function initWorkDays() {
  const daysEl = document.getElementById("workDays");
  const sinceEl = document.getElementById("workSince");
  if (!daysEl || !sinceEl) return;
  const start = new Date("2026-09-06T00:00:00");
  const now = new Date();
  const days = Math.max(1, Math.floor((now - start) / 86400000));
  const en = window.CURRENT_LANG === "en";
  daysEl.textContent = days;
  sinceEl.textContent = tr("ach_work_since", "с") + " " + start.toLocaleDateString(en ? "en-US" : "ru-RU", {
    day: "numeric", month: "long", year: "numeric"
  });
}

// ========== АВТООБНОВЛЕНИЕ ДОСТИЖЕНИЙ ==========
async function updateProjectsAchievement() {
  const detailList = document.getElementById("projectsDetails");
  if (!detailList) return;
  const nums = document.querySelectorAll("#projectsAchievement .big-num");
  if (!nums.length) return;

  const res = await API.get("/projects");
  if (!res.ok) return;
  const projects = res.data;
  const hard = projects.filter(p => p.difficulty === "hard");
  const easy = projects.filter(p => p.difficulty === "easy");

  nums[0].textContent = hard.length;
  if (nums[1]) nums[1].textContent = easy.length;

  let html = "";
  hard.forEach(p => {
    html += `<div class="detail-item">
      <span class="detail-badge hard">${tr("detail_hard", "СЛОЖНЫЙ")}</span>
      <span class="detail-name">${escapeHtml(p.title)}</span>
      <span class="detail-desc">${escapeHtml(p.subtitle || "")}</span>
    </div>`;
  });
  easy.forEach(p => {
    html += `<div class="detail-item">
      <span class="detail-badge easy">${tr("detail_easy", "ПРОСТОЙ")}</span>
      <span class="detail-name">${escapeHtml(p.title)}</span>
      <span class="detail-desc">${escapeHtml(p.subtitle || "")}</span>
    </div>`;
  });
  if (!html) html = `<div class="detail-empty">${tr("detail_empty", "Пока пусто")}</div>`;
  detailList.innerHTML = html;
}

// ========== ФОН ==========
function initBackground() {
  const canvas = document.getElementById("bgCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  let w, h;
  function resize() { w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight; }
  resize();
  window.addEventListener("resize", resize);

  const particles = [];
  const COUNT = Math.min(90, Math.floor(window.innerWidth / 18));
  for (let i = 0; i < COUNT; i++) {
    particles.push({
      x: Math.random() * w, y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.4,
      r: Math.random() * 1.8 + 0.6
    });
  }
  let mouseX = w / 2, mouseY = h / 2;
  window.addEventListener("mousemove", (e) => { mouseX = e.clientX; mouseY = e.clientY; });

  function draw() {
    ctx.fillStyle = "rgba(10, 14, 26, 0.35)";
    ctx.fillRect(0, 0, w, h);
    particles.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > w) p.vx *= -1;
      if (p.y < 0 || p.y > h) p.vy *= -1;
      const dx = mouseX - p.x, dy = mouseY - p.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 180) { p.x += dx * 0.002; p.y += dy * 0.002; }
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(0, 255, 136, 0.7)";
      ctx.shadowColor = "#00ff88";
      ctx.shadowBlur = 8;
      ctx.fill();
      ctx.shadowBlur = 0;
    });
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i], b = particles[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < 130) {
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(0, 255, 136, ${0.15 * (1 - d / 130)})`;
          ctx.lineWidth = 0.7;
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(draw);
  }
  draw();
}

function initPreloader() {
  // Ничего не делаем — прелоадер скроется после загрузки постов
}

function hidePreloader() {
  const p = document.getElementById("preloader");
  if (p) p.classList.add("hide");
}
function initScrollTop() {
  if (document.getElementById("scrollTop")) return;
  const btn = document.createElement("button");
  btn.id = "scrollTop";
  btn.textContent = "↑";
  btn.title = "Наверх";
  document.body.appendChild(btn);
  window.addEventListener("scroll", () => btn.classList.toggle("show", window.scrollY > 400));
  btn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
}

function initCursorGlow() {
  document.addEventListener("mousemove", (e) => {
    document.body.style.setProperty("--mouse-x", e.clientX + "px");
    document.body.style.setProperty("--mouse-y", e.clientY + "px");
  });
}

// ========== ПЕРЕРИСОВКА ПРИ СМЕНЕ ЯЗЫКА ==========
window.addEventListener("langChanged", () => {
  const feed = document.getElementById("feed");
  if (feed) {
    feed.innerHTML = "";
    shownPosts = 0;
    loadPosts();
  }
  const login = accounts.getCurrentLogin();
  const userName = document.getElementById("userName");
  if (userName) {
    userName.textContent = login ? accounts.getDisplayName(login) : tr("login", "Войти");
  }
  if (window.__refreshMenuLang) window.__refreshMenuLang();
  updateProjectsAchievement();
  initWorkDays();
});

// ========== ЗАПУСК ==========
document.addEventListener("DOMContentLoaded", async function () {
  // Сначала загружаем юзера (если токен есть)
  await accounts.loadCurrentUser();

  initBurger();
  initAuthModal();
  initProjectsAchievement();
  initWorkDays();
  updateProjectsAchievement();
  initBackground();
  initPreloader();
  initScrollTop();
  initCursorGlow();

   loadPosts().then(() => {
    initAdminPanel();
    initActiveNav();
    scrollToHashPost();
    hidePreloader();
  });

  if (typeof renderReviewsPreview === "function") renderReviewsPreview();
  if (typeof updateReviewsStats === "function") updateReviewsStats();

  const loadMoreBtn = document.getElementById("loadMore");
  if (loadMoreBtn) loadMoreBtn.addEventListener("click", loadPosts);

  window.addEventListener("hashchange", scrollToHashPost);
});