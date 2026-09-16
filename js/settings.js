// ========== НАСТРОЙКИ (UI) ==========

function getSettings() {
  return window.APP_SETTINGS || {
    theme: "dark", lang: "ru",
    particles: true, glow: true, anim: true, grid: true, toasts: true
  };
}

function saveSettings(s) {
  localStorage.setItem("site_settings", JSON.stringify(s));
  window.APP_SETTINGS = s;
}

function refreshUI(s) {
  document.querySelectorAll(".theme-card").forEach(c => {
    c.classList.toggle("active", c.dataset.theme === s.theme);
  });
  document.querySelectorAll(".lang-btn").forEach(b => {
    b.classList.toggle("active", b.dataset.lang === s.lang);
  });
  const map = {
    optParticles: "particles", optGlow: "glow",
    optAnim: "anim", optGrid: "grid", optToasts: "toasts"
  };
  Object.keys(map).forEach(id => {
    const el = document.getElementById(id);
    if (el) el.checked = s[map[id]];
  });
}

function updateStorageInfo() {
  const el = document.getElementById("storageInfo");
  if (!el) return;
  let total = 0, keys = 0;
  for (let k in localStorage) {
    if (localStorage.hasOwnProperty(k)) {
      total += (localStorage[k].length + k.length) * 2;
      keys++;
    }
  }
  el.textContent = `📊 Занято: ${(total / 1024).toFixed(2)} КБ · Ключей: ${keys}`;
}

function settingsToast(msg) {
  const s = getSettings();
  if (!s.toasts) return;

  let toast = document.getElementById("toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "toast";
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add("show");
  clearTimeout(toast._t);
  toast._t = setTimeout(() => toast.classList.remove("show"), 2500);
}

// ===== ЭКСПОРТ / ИМПОРТ / СБРОС =====
function exportData() {
  const data = {};
  for (let k in localStorage) {
    if (localStorage.hasOwnProperty(k)) data[k] = localStorage[k];
  }
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "akiyama_backup_" + new Date().toISOString().slice(0, 10) + ".json";
  a.click();
  URL.revokeObjectURL(url);
  settingsToast("📤 Данные экспортированы");
}

function importData() {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".json";
  input.onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        Object.keys(data).forEach(k => localStorage.setItem(k, data[k]));
        settingsToast("📥 Импортировано");
        setTimeout(() => location.reload(), 800);
      } catch (err) {
        settingsToast("❌ Ошибка импорта");
      }
    };
    reader.readAsText(file);
  };
  input.click();
}

function resetData() {
  if (!confirm("⚠️ Удалить ВСЕ данные?")) return;
  if (!confirm("Точно? Необратимо.")) return;
  localStorage.clear();
  settingsToast("🗑️ Всё сброшено");
  setTimeout(() => location.reload(), 800);
}

// ===== ПРИНУДИТЕЛЬНАЯ ПЕРЕРИСОВКА ЯЗЫКА =====
function forceApplyLang(lang) {
  console.log("🌍 forceApplyLang:", lang);
  console.log("📚 APP_TRANSLATIONS exists:", !!window.APP_TRANSLATIONS);

  const TRANSLATIONS = window.APP_TRANSLATIONS || {};
  const tr = TRANSLATIONS[lang] || TRANSLATIONS.ru || {};

  console.log("📖 Keys in", lang + ":", Object.keys(tr).length);

  window.CURRENT_LANG = lang;
  window.t = function (key) {
    return tr[key] !== undefined ? tr[key] : key;
  };

  // Перерисовываем все data-i18n
  let count = 0;
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.dataset.i18n;
    if (tr[key] !== undefined) {
      el.textContent = tr[key];
      count++;
    }
  });
  console.log("✏️ Translated elements:", count);

  // Placeholder'ы
  document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
    const key = el.dataset.i18nPlaceholder;
    if (tr[key] !== undefined) el.placeholder = tr[key];
  });

  // data-lang на body
  document.body.dataset.lang = lang;

  // Триггерим событие
  window.dispatchEvent(new Event("langChanged"));
}

// ===== ЗАПУСК =====
document.addEventListener("DOMContentLoaded", () => {
  let s = getSettings();

  refreshUI(s);
  updateStorageInfo();

  // ===== ТЕМЫ =====
  document.querySelectorAll(".theme-card").forEach(card => {
    card.addEventListener("click", () => {
      s.theme = card.dataset.theme;
      saveSettings(s);
      if (window.applyAppTheme) window.applyAppTheme(s.theme);
      refreshUI(s);
      settingsToast("🎨 " + card.querySelector(".theme-name").textContent);
    });
  });

  // ===== ЯЗЫК =====
  document.querySelectorAll(".lang-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      s.lang = btn.dataset.lang;
      saveSettings(s);

      forceApplyLang(s.lang);

      refreshUI(s);
      settingsToast(s.lang === "ru" ? "🇷🇺 Русский" : "🇬🇧 English");
    });
  });

  // ===== ТОГГЛЫ =====
  const map = {
    optParticles: "particles", optGlow: "glow",
    optAnim: "anim", optGrid: "grid", optToasts: "toasts"
  };
  Object.keys(map).forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener("change", () => {
      s[map[id]] = el.checked;
      saveSettings(s);
      if (window.applyAppEffects) window.applyAppEffects(s);
    });
  });

  // ===== ДАННЫЕ =====
  document.getElementById("btnExport")?.addEventListener("click", exportData);
  document.getElementById("btnImport")?.addEventListener("click", importData);
  document.getElementById("btnReset")?.addEventListener("click", resetData);
});