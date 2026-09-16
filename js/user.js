// ========== СТРАНИЦА ПОЛЬЗОВАТЕЛЯ (API) ==========

function tr(key, fallback) {
  if (window.t) {
    const v = window.t(key);
    if (v !== key) return v;
  }
  return fallback !== undefined ? fallback : key;
}

function getUserLoginFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("u");
}

async function renderUserPage() {
  const login = getUserLoginFromUrl();
  const pageEl = document.getElementById("userPage");
  const notFoundEl = document.getElementById("userNotFound");

  if (!login) {
    pageEl.style.display = "none";
    notFoundEl.style.display = "flex";
    return;
  }

  const res = await API.get(`/users/${encodeURIComponent(login)}`);
  if (!res.ok) {
    pageEl.style.display = "none";
    notFoundEl.style.display = "flex";
    return;
  }

  const user = res.data;
  pageEl.style.display = "block";
  notFoundEl.style.display = "none";

  const rank = accounts.getRankByLogin(login);
  const pts = user.points || 0;
  const avatar = user.avatar || accounts.DEFAULT_AVATAR;
  const displayName = user.displayName || login;
  const bio = user.bio || "";

  document.getElementById("userPageAvatar").textContent = avatar;
  document.getElementById("userPageName").textContent = displayName;
  document.getElementById("userPageRank").textContent = rank.icon + " " + rank.name_ru;
  document.getElementById("userPagePoints").textContent = "⚡ " + pts + " " + tr("shop_balance_points", "очков");

  if (user.createdAt) {
    const d = new Date(user.createdAt);
    document.getElementById("userPageDate").textContent =
      "📅 " + tr("user_registered", "Зарегистрирован") + ": " + d.toLocaleDateString("ru-RU", {
        day: "numeric", month: "long", year: "numeric"
      });
  } else {
    document.getElementById("userPageDate").textContent = "";
  }

  const bioBlock = document.getElementById("userBioBlock");
  if (bio && bio.trim().length) {
    bioBlock.style.display = "block";
    document.getElementById("userPageBio").textContent = bio;
  } else {
    bioBlock.style.display = "none";
  }

  renderUserComments(login);
  renderUserReviews(login);

  document.title = displayName + " — Akiyama";
}

// ===== КОММЕНТЫ ЮЗЕРА =====
async function renderUserComments(login) {
  const container = document.getElementById("userCommentsList");
  if (!container) return;

  // Загружаем все посты и все комменты к ним
  const postsRes = await API.get("/posts");
  if (!postsRes.ok) { container.innerHTML = ""; return; }

  const allComments = [];
  for (const post of postsRes.data) {
    const res = await API.get(`/posts/${post._id}/comments`);
    if (res.ok) {
      res.data.forEach(c => {
        if (c.author === login) {
          allComments.push({ ...c, postId: post._id });
        }
      });
    }
  }

  if (!allComments.length) {
    container.innerHTML = `<div class="review-empty">${tr("user_no_comments", "Комментариев пока нет")}</div>`;
    return;
  }

  allComments.sort((a, b) => new Date(b.date) - new Date(a.date));
  const latest = allComments.slice(0, 5);

  container.innerHTML = latest.map(c => `
    <div class="user-comment-item">
      <div class="user-comment-text">${escapeHtml(c.text)}</div>
      <div class="user-comment-meta">
        <a href="index.html#post-${c.postId}" class="user-comment-link">
          → ${tr("user_to_post", "к посту")}
        </a>
        <span class="user-comment-time">${timeAgo(c.date)}</span>
      </div>
    </div>
  `).join("");
}

// ===== ОТЗЫВЫ ЮЗЕРА =====
async function renderUserReviews(login) {
  const container = document.getElementById("userReviewsList");
  if (!container) return;

  const res = await API.get("/reviews");
  if (!res.ok) { container.innerHTML = ""; return; }

  const userReviews = res.data.filter(r => r.author === login);

  if (!userReviews.length) {
    container.innerHTML = `<div class="review-empty">${tr("user_no_reviews", "Отзывов пока нет")}</div>`;
    return;
  }

  userReviews.sort((a, b) => new Date(b.date) - new Date(a.date));
  const latest = userReviews.slice(0, 5);

  container.innerHTML = latest.map(r => `
    <div class="user-review-item">
      <div class="user-review-stars">${"★".repeat(Math.round(Number(r.rating)))}${"☆".repeat(5 - Math.round(Number(r.rating)))}</div>
      <div class="user-review-text">${escapeHtml(r.text)}</div>
      <div class="user-review-time">${timeAgo(r.date)}</div>
    </div>
  `).join("");
}

document.addEventListener("DOMContentLoaded", async () => {
  if (!accounts.getCurrentUser() && window.getToken && window.getToken()) {
    await accounts.loadCurrentUser();
  }
  renderUserPage();
});

window.addEventListener("langChanged", () => {
  renderUserPage();
});