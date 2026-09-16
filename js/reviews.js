// ========== ОТЗЫВЫ (API) ==========

let _reviewsCache = [];

async function loadReviews() {
  const res = await API.get("/reviews");
  if (!res.ok) return [];
  _reviewsCache = res.data;
  return _reviewsCache;
}

function getReviews() {
  return _reviewsCache;
}

function getAverageRating() {
  if (!_reviewsCache.length) return "0.0";
  const sum = _reviewsCache.reduce((acc, r) => acc + Number(r.rating), 0);
  return (sum / _reviewsCache.length).toFixed(1);
}

function renderStars(rating) {
  const n = Math.round(Number(rating));
  return "★".repeat(n) + "☆".repeat(5 - n);
}

function escapeHtmlLocal(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function renderReviewCard(review) {
  const badge = accounts.getUserBadge(review.author);
  const badgeHtml = badge ? `<span class="user-badge">${badge}</span>` : "";
  const avatar = accounts.getUserAvatar(review.author);
  const displayName = accounts.getDisplayName(review.author);

  return `
    <div class="review-card" data-id="${review._id}">
      <div class="review-header">
        <div class="review-user">
          <div class="review-avatar">${avatar}</div>
          <div>
            <a href="user.html?u=${encodeURIComponent(review.author)}" class="review-author">${escapeHtmlLocal(displayName)}${badgeHtml}</a>
            <div class="review-date">${timeAgo(review.date)}</div>
          </div>
        </div>
        <div class="review-stars">${renderStars(review.rating)}</div>
      </div>
      <div class="review-text">${escapeHtmlLocal(review.text)}</div>
    </div>
  `;
}

// ===== ПРЕВЬЮ НА ГЛАВНОЙ =====
async function renderReviewsPreview() {
  const container = document.getElementById("reviewsPreview");
  if (!container) return;

  if (!_reviewsCache.length) await loadReviews();
  const trFunc = window.t || (k => k);

  if (!_reviewsCache.length) {
    container.innerHTML = `<div class="review-empty">${trFunc("reviews_empty_index")}</div>`;
    return;
  }

  // Подтягиваем юзеров для бейджей
  const logins = _reviewsCache.slice(0, 4).map(r => r.author);
  await accounts.loadUsersBatch(logins);

  container.innerHTML = _reviewsCache.slice(0, 4).map(renderReviewCard).join("");
}

// ===== СТАТИСТИКА =====
async function updateReviewsStats() {
  const countEl = document.getElementById("reviewsCount");
  const avgEl = document.getElementById("avgRating");
  if (!countEl || !avgEl) return;

  if (!_reviewsCache.length) await loadReviews();
  countEl.textContent = _reviewsCache.length;
  avgEl.textContent = _reviewsCache.length ? "★ " + getAverageRating() : "—";
}

// ===== ПЕРЕРИСОВКА ПРИ СМЕНЕ ЯЗЫКА =====
window.addEventListener("langChanged", () => {
  renderReviewsPreview();
  updateReviewsStats();
});