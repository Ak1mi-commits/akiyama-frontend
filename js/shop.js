// ========== МАГАЗИН (API) ==========

function tr(key, fallback) {
  if (window.t) {
    const v = window.t(key);
    if (v !== key) return v;
  }
  return fallback !== undefined ? fallback : key;
}

const SHOP_ITEMS = [
  { id: "badge_star",    type: "badge", name_ru: "Звёздочка",    name_en: "Star",      icon: "⭐", desc_ru: "Значок рядом с ником",              desc_en: "Badge next to your name",   price: 30,   value: "⭐" },
  { id: "badge_fire",    type: "badge", name_ru: "Огонёк",       name_en: "Fire",      icon: "🔥", desc_ru: "Значок активности",                  desc_en: "Activity badge",           price: 60,   value: "🔥" },
  { id: "badge_heart",   type: "badge", name_ru: "Сердечко",     name_en: "Heart",     icon: "💖", desc_ru: "Для добрых и отзывчивых",            desc_en: "For kind people",          price: 80,   value: "💖" },
  { id: "badge_rocket",  type: "badge", name_ru: "Ракета",       name_en: "Rocket",    icon: "🚀", desc_ru: "Для тех, кто движется вперёд",       desc_en: "For go-getters",           price: 120,  value: "🚀" },
  { id: "badge_crown",   type: "badge", name_ru: "Корона",       name_en: "Crown",     icon: "👑", desc_ru: "Для избранных",                      desc_en: "For the chosen ones",      price: 300,  value: "👑" },
  { id: "badge_skull",   type: "badge", name_ru: "Череп",        name_en: "Skull",     icon: "💀", desc_ru: "Для тех, кто не боится",             desc_en: "For the fearless",         price: 500,  value: "💀" },
  { id: "badge_diamond", type: "badge", name_ru: "Алмаз",        name_en: "Diamond",   icon: "💎", desc_ru: "Редкий значок. Только для легенд",   desc_en: "Rare badge. Legends only", price: 800,  value: "💎" },
  { id: "badge_alien",   type: "badge", name_ru: "Пришелец",     name_en: "Alien",     icon: "👽", desc_ru: "Ты не из этой планеты",              desc_en: "Not from this planet",     price: 1000, value: "👽" }
];

function itemName(item) { return window.CURRENT_LANG === "en" ? item.name_en : item.name_ru; }
function itemDesc(item) { return window.CURRENT_LANG === "en" ? item.desc_en : item.desc_ru; }

let shopState = {
  sort: "default",
  filter: "all"
};

function getVisibleItems(ownedList) {
  let items = [...SHOP_ITEMS];

  if (shopState.filter === "owned") {
    items = items.filter(i => ownedList.includes(i.id));
  } else if (shopState.filter === "not_owned") {
    items = items.filter(i => !ownedList.includes(i.id));
  }

  if (shopState.sort === "cheap") items.sort((a, b) => a.price - b.price);
  else if (shopState.sort === "expensive") items.sort((a, b) => b.price - a.price);

  return items;
}

async function renderShop() {
  const grid = document.getElementById("shopGrid");
  const balanceEl = document.getElementById("shopBalance");
  if (!grid) return;

  const login = accounts.getCurrentLogin();
  const user = login ? accounts.getCurrentUser() : null;
  const owned = user ? (user.ownedBadges || []) : [];
  const active = user ? user.activeBadge : null;
  const pts = user ? (user.points || 0) : 0;

  if (balanceEl) {
    balanceEl.innerHTML = login
      ? `${tr("shop_balance", "⚡ Твой баланс:")} <b>${pts}</b> ${tr("shop_balance_points", "очков")}`
      : tr("shop_need_login", "Войди в аккаунт, чтобы покупать");
  }

  const items = getVisibleItems(owned);

  if (!items.length) {
    grid.innerHTML = `<div class="review-empty">${tr("shop_filter_empty", "Ничего не найдено")}</div>`;
    return;
  }

  grid.innerHTML = items.map(item => {
    const isOwned = owned.includes(item.id);
    const isActive = active === item.value;
    const canBuy = login && pts >= item.price && !isOwned;

    let btnText = "";
    let btnClass = "";

    if (isActive) {
      btnText = tr("shop_active", "✅ Активно");
      btnClass = "shop-btn active";
    } else if (isOwned) {
      btnText = tr("shop_apply", "🎯 Применить");
      btnClass = "shop-btn apply";
    } else if (canBuy) {
      btnText = `💰 ${tr("shop_buy", "Купить за")} ${item.price}`;
      btnClass = "shop-btn buy";
    } else {
      btnText = `🔒 ${item.price}`;
      btnClass = "shop-btn locked";
    }

    return `
      <div class="shop-card ${isOwned ? 'owned' : ''} ${isActive ? 'is-active' : ''}" data-id="${item.id}">
        <div class="shop-icon">${item.icon}</div>
        <div class="shop-name">${itemName(item)}</div>
        <div class="shop-desc">${itemDesc(item)}</div>
        <div class="shop-price">${item.price} ⚡</div>
        <button class="${btnClass}" data-id="${item.id}" data-value="${item.value}">
          ${btnText}
        </button>
      </div>
    `;
  }).join("");

  document.querySelectorAll(".shop-btn").forEach(btn => {
    btn.addEventListener("click", () => handleShopClick(btn));
  });
}

async function handleShopClick(btn) {
  const item = SHOP_ITEMS.find(i => i.id === btn.dataset.id);
  if (!item) return;

  const login = accounts.getCurrentLogin();
  if (!login) {
    alert(tr("shop_error_login", "Войди в аккаунт чтобы покупать 👆"));
    return;
  }

  const user = accounts.getCurrentUser();
  const owned = user ? (user.ownedBadges || []) : [];

  // Покупка (если не куплено)
  if (!owned.includes(item.id)) {
    const res = await API.post("/shop/buy", { itemId: item.id });
    if (!res.ok) {
      showShopToast("❌ " + res.error);
      return;
    }
    accounts.setCurrentUser(res.data);
  }

  // Применить / снять
  const res2 = await API.post("/shop/apply", { itemId: item.id });
  if (!res2.ok) {
    showShopToast("❌ " + res2.error);
    return;
  }
  accounts.setCurrentUser(res2.data);

  renderShop();
  if (window.__refreshMenuHeader) window.__refreshMenuHeader();
  showShopToast(tr("shop_applied", "✅ Применено:") + " " + itemName(item));
}

function renderShopControls() {
  const container = document.querySelector(".shop-section .container");
  if (!container) return;

  const old = document.getElementById("shopControls");
  if (old) old.remove();

  const controls = document.createElement("div");
  controls.id = "shopControls";
  controls.className = "shop-controls";
  controls.innerHTML = `
    <div class="shop-control-group">
      <label class="shop-control-label">${tr("shop_sort", "Сортировка")}</label>
      <select id="shopSort" class="shop-select">
        <option value="default">${tr("shop_sort_default", "По умолчанию")}</option>
        <option value="cheap">${tr("shop_sort_cheap", "Сначала дешёвые")}</option>
        <option value="expensive">${tr("shop_sort_expensive", "Сначала дорогие")}</option>
      </select>
    </div>
    <div class="shop-control-group">
      <label class="shop-control-label">${tr("shop_filter", "Фильтр")}</label>
      <select id="shopFilter" class="shop-select">
        <option value="all">${tr("shop_filter_all", "Все товары")}</option>
        <option value="owned">${tr("shop_filter_owned", "Только купленные")}</option>
        <option value="not_owned">${tr("shop_filter_not_owned", "Только некупленные")}</option>
      </select>
    </div>
  `;

  const balance = document.getElementById("shopBalance");
  if (balance) balance.insertAdjacentElement("afterend", controls);
  else {
    const grid = document.getElementById("shopGrid");
    if (grid) grid.insertAdjacentElement("beforebegin", controls);
  }

  const sortSel = document.getElementById("shopSort");
  const filterSel = document.getElementById("shopFilter");
  sortSel.value = shopState.sort;
  filterSel.value = shopState.filter;

  sortSel.addEventListener("change", () => {
    shopState.sort = sortSel.value;
    renderShop();
  });
  filterSel.addEventListener("change", () => {
    shopState.filter = filterSel.value;
    renderShop();
  });
}

function showShopToast(msg) {
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

window.addEventListener("langChanged", () => {
  renderShopControls();
  renderShop();
});

document.addEventListener("DOMContentLoaded", async () => {
  await accounts.loadCurrentUser();
  renderShopControls();
  renderShop();
});