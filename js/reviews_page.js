// ========== ЛОГИКА СТРАНИЦЫ ОТЗЫВОВ (API) ==========

let currentRating = 0;

function tr(key, fallback) {
  if (window.t) {
    const v = window.t(key);
    if (v !== key) return v;
  }
  return fallback !== undefined ? fallback : key;
}

function initRatingStars() {
  const stars = document.querySelectorAll(".rating-star");
  const input = document.getElementById("ratingInput");
  if (!stars.length || !input) return;

  function paint(value) {
    stars.forEach(s => s.classList.toggle("active", Number(s.dataset.value) <= value));
  }

  stars.forEach(star => {
    star.addEventListener("click", () => {
      currentRating = Number(star.dataset.value);
      paint(currentRating);
    });
    star.addEventListener("mouseenter", () => paint(Number(star.dataset.value)));
  });

  input.addEventListener("mouseleave", () => paint(currentRating));
}

async function renderReviewsList() {
  const list = document.getElementById("reviewsList");
  if (!list) return;

  if (!_reviewsCache.length) await loadReviews();

  if (!_reviewsCache.length) {
    list.innerHTML = `<div class="review-empty">${tr("reviews_none", "Отзывов пока нет. Будь первым!")}</div>`;
    return;
  }

  // Подтягиваем юзеров для бейджей
  const logins = _reviewsCache.map(r => r.author);
  await accounts.loadUsersBatch(logins);

  list.innerHTML = _reviewsCache.map(renderReviewCard).join("");
}

function renderReviewsStatsPage() {
  const stats = document.getElementById("reviewsStats");
  if (!stats) return;
  if (!_reviewsCache.length) { stats.innerHTML = ""; return; }

  stats.innerHTML = `
    <div class="reviews-stats-inner">
      <div class="stats-item">
        <span class="stats-num">${_reviewsCache.length}</span>
        <span class="stats-label">${tr("reviews_stats_count", "отзывов")}</span>
      </div>
      <div class="stats-item">
        <span class="stats-num">${getAverageRating()}</span>
        <span class="stats-label">${tr("reviews_stats_avg", "средняя оценка")}</span>
      </div>
    </div>
  `;
}

function showToast(message) {
  let toast = document.getElementById("toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "toast";
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toast._t);
  toast._t = setTimeout(() => toast.classList.remove("show"), 2500);
}

function initReviewForm() {
  const form = document.getElementById("reviewForm");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const textEl = document.getElementById("reviewText");
    const errorEl = document.getElementById("reviewError");
    const text = textEl.value.trim();
    errorEl.textContent = "";

    if (!currentRating) return (errorEl.textContent = tr("reviews_error_rating", "Поставь оценку"));
    if (text.length < 5) return (errorEl.textContent = tr("reviews_error_text", "Отзыв минимум 5 символов"));

    const res = await API.post("/reviews", { rating: currentRating, text });
    if (!res.ok) return (errorEl.textContent = "❌ " + res.error);

    // Перезагружаем с сервера
    await loadReviews();
    await renderReviewsList();
    renderReviewsStatsPage();

    // Обновляем свои очки
    await accounts.loadCurrentUser();
    if (window.__refreshMenuHeader) window.__refreshMenuHeader();

    form.reset();
    currentRating = 0;
    document.querySelectorAll(".rating-star").forEach(s => s.classList.remove("active"));

    const list = document.getElementById("reviewsList");
    if (list) {
      setTimeout(() => {
        list.scrollIntoView({ behavior: "smooth", block: "start" });
        const first = list.querySelector(".review-card");
        if (first) {
          first.classList.add("just-added");
          setTimeout(() => first.classList.remove("just-added"), 3000);
        }
      }, 100);
    }

    showToast(tr("reviews_added", "✅ Отзыв добавлен!"));
  });
}

// Автор отзыва — твой логин, не вводи вручную
function prefillAuthor() {
  const authorEl = document.getElementById("reviewAuthor");
  if (!authorEl) return;
  const login = accounts.getCurrentLogin();
  if (login) {
    authorEl.value = accounts.getDisplayName(login);
    authorEl.readOnly = true;
  } else {
    authorEl.value = "";
    authorEl.readOnly = false;
  }
}

window.addEventListener("langChanged", () => {
  renderReviewsList();
  renderReviewsStatsPage();
});

document.addEventListener("DOMContentLoaded", async () => {
  if (!accounts.getCurrentUser() && window.getToken && window.getToken()) {
    await accounts.loadCurrentUser();
  }
  await loadReviews();
  initRatingStars();
  await renderReviewsList();
  renderReviewsStatsPage();
  initReviewForm();
  prefillAuthor();
});