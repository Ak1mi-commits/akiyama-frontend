// ========== ПРОЕКТЫ (API) ==========

function tr(key, fallback) {
  const dict = (window.APP_TRANSLATIONS || {})[window.CURRENT_LANG || "ru"] || {};
  if (dict[key] !== undefined) return dict[key];
  if (fallback !== undefined) return fallback;
  return key;
}

// Кэш проектов
let _projectsCache = [];

// ===== ЗАГРУЗКА С СЕРВЕРА =====
async function loadProjects() {
  const res = await API.get("/projects");
  if (!res.ok) return [];
  _projectsCache = res.data;
  return _projectsCache;
}

// ===== СТАТУСЫ / СЛОЖНОСТЬ =====
function getStatusLabel(status) {
  if (status === "done") return tr("project_status_done", "Завершён");
  if (status === "wip") return tr("project_status_wip", "В разработке");
  if (status === "available") return tr("project_status_available", "Доступно");
  if (status === "idea") return tr("project_status_idea", "Идея");
  return status;
}

function getStatusClass(status) {
  if (status === "done") return "done";
  if (status === "available") return "available";
  if (status === "idea") return "idea";
  return "wip";
}

function getLinkText(project) {
  if (!project.link) return null;
  if (project.id === "hub") return tr("project_hub_link", "Открыть сайт ХАБа →");
  return tr("project_open", "Открыть →");
}

// ===== ЛОКАЛИЗАЦИЯ (RU/EN поля) =====
function localizeProject(p) {
  const en = window.CURRENT_LANG === "en";
  return {
    ...p,
    title: en ? (p.title_en || p.title) : p.title,
    subtitle: en ? (p.subtitle_en || p.subtitle) : p.subtitle,
    fullDesc: en ? (p.fullDesc_en || p.fullDesc) : p.fullDesc
  };
}

// ===== РЕНДЕР КАРТОЧКИ =====
function renderProjectCard(project) {
  project = localizeProject(project);

  const tagsHtml = project.tags && project.tags.length
    ? '<div class="project-tags">' + project.tags.map(t => `<span class="project-tag">${escapeHtml(t)}</span>`).join("") + '</div>'
    : '';

  const linkHtml = project.link
    ? `<a href="${project.link}" target="_blank" class="project-btn">${escapeHtml(getLinkText(project))}</a>`
    : `<span class="project-btn disabled">${tr("project_link_soon", "Ссылка скоро")}</span>`;

  const statusClass = getStatusClass(project.status);

  const adminBtns = accounts.isAdmin()
    ? `<button class="project-edit-btn" data-id="${project._id}" title="Редактировать">✏️</button>`
    : "";

  return `
    <article class="project-full-card" data-id="${project._id}">
      <div class="project-full-header">
        <div class="project-full-icon">${project.icon}</div>
        <div class="project-full-info">
          <div class="project-full-title">${escapeHtml(project.title)}</div>
          <div class="project-full-subtitle">${escapeHtml(project.subtitle)}</div>
        </div>
        ${project.difficulty ? `<div class="project-difficulty ${project.difficulty}">${project.difficulty === "hard" ? tr("difficulty_hard", "Сложный") : tr("difficulty_easy", "Простой")}</div>` : ""}
        <div class="project-status ${statusClass}">${escapeHtml(getStatusLabel(project.status))}</div>
        ${adminBtns}
      </div>
      <p class="project-full-desc">${escapeHtml(project.fullDesc)}</p>
      ${tagsHtml}
      <div class="project-full-footer">
        ${linkHtml}
      </div>
    </article>
  `;
}

// ===== РЕНДЕР СПИСКА =====
function renderProjectsList() {
  const list = document.getElementById("projectsList");
  if (!list) return;

  if (!_projectsCache.length) {
    list.innerHTML = `<div class="review-empty">${tr("projects_empty", "Проектов пока нет")}</div>`;
    return;
  }

  list.innerHTML = _projectsCache.map(renderProjectCard).join("");

  document.querySelectorAll(".project-edit-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.id;
      const project = _projectsCache.find(p => p._id === id);
      if (project) openProjectEditor(project);
    });
  });
}

// ===== РЕДАКТОР =====
function openProjectEditor(project) {
  let modal = document.getElementById("projectEditorModal");
  if (modal) modal.remove();

  modal = document.createElement("div");
  modal.id = "projectEditorModal";
  modal.className = "modal open";
  modal.innerHTML = `
    <div class="modal-content" style="max-width: 560px;">
      <button class="modal-close" id="projEditClose">✕</button>
      <h2 class="modal-title">✏️ ${tr("admin_edit_project", "Редактировать проект")}</h2>

      <label class="modal-label">
        <span>${tr("admin_project_title_ph", "Название")}</span>
        <input type="text" id="editProjTitle" class="modal-input" maxlength="60" value="${escapeHtml(project.title)}">
      </label>

      <label class="modal-label">
        <span>${tr("admin_project_subtitle_ph", "Подзаголовок")}</span>
        <input type="text" id="editProjSubtitle" class="modal-input" maxlength="80" value="${escapeHtml(project.subtitle)}">
      </label>

      <label class="modal-label">
        <span>${tr("admin_project_icon_ph", "Иконка")}</span>
        <input type="text" id="editProjIcon" class="modal-input" maxlength="4" value="${escapeHtml(project.icon)}">
      </label>

      <label class="modal-label">
        <span>${tr("admin_project_desc_ph", "Описание")}</span>
        <textarea id="editProjDesc" class="modal-input" style="min-height:100px; resize:vertical;" maxlength="1500">${escapeHtml(project.fullDesc)}</textarea>
      </label>

      <label class="modal-label">
        <span>${tr("admin_project_tags_ph", "Теги через запятую")}</span>
        <input type="text" id="editProjTags" class="modal-input" value="${escapeHtml((project.tags || []).join(", "))}">
      </label>

      <label class="modal-label">
        <span>${tr("admin_project_link_ph", "Ссылка")}</span>
        <input type="text" id="editProjLink" class="modal-input" value="${escapeHtml(project.link || "")}">
      </label>

      <label class="modal-label">
        <span>${tr("project_status", "Статус")}</span>
        <select id="editProjStatus" class="admin-post-select">
          <option value="wip" ${project.status === "wip" ? "selected" : ""}>${tr("project_status_wip", "В разработке")}</option>
          <option value="available" ${project.status === "available" ? "selected" : ""}>${tr("project_status_available", "Доступно")}</option>
          <option value="done" ${project.status === "done" ? "selected" : ""}>${tr("project_status_done", "Завершён")}</option>
          <option value="idea" ${project.status === "idea" ? "selected" : ""}>${tr("project_status_idea", "Идея")}</option>
        </select>
      </label>

      <label class="modal-label">
        <span>${tr("project_difficulty", "Сложность")}</span>
        <select id="editProjDifficulty" class="admin-post-select">
          <option value="" ${!project.difficulty ? "selected" : ""}>${tr("difficulty_none", "— Без сложности —")}</option>
          <option value="easy" ${project.difficulty === "easy" ? "selected" : ""}>${tr("difficulty_easy", "Простой")}</option>
          <option value="hard" ${project.difficulty === "hard" ? "selected" : ""}>${tr("difficulty_hard", "Сложный")}</option>
        </select>
      </label>

      <div class="modal-error" id="projEditError"></div>

      <div style="display:flex; gap:10px; margin-top:8px;">
        <button class="admin-post-btn" id="projEditSave" style="flex:1;">💾 ${tr("profile_save", "Сохранить")}</button>
        <button class="settings-action-btn danger" id="projEditDelete" style="flex:1;">🗑️ ${tr("delete", "Удалить")}</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  const close = () => modal.remove();
  document.getElementById("projEditClose").addEventListener("click", close);
  modal.addEventListener("click", (e) => { if (e.target === modal) close(); });

  document.getElementById("projEditSave").addEventListener("click", async () => {
    const title = document.getElementById("editProjTitle").value.trim();
    const subtitle = document.getElementById("editProjSubtitle").value.trim();
    const icon = document.getElementById("editProjIcon").value.trim() || "🚀";
    const desc = document.getElementById("editProjDesc").value.trim();
    const tagsRaw = document.getElementById("editProjTags").value.trim();
    const link = document.getElementById("editProjLink").value.trim();
    const status = document.getElementById("editProjStatus").value;
    const difficulty = document.getElementById("editProjDifficulty").value;
    const errEl = document.getElementById("projEditError");
    errEl.textContent = "";

    if (title.length < 2) return (errEl.textContent = tr("admin_error_title", "Название минимум 2 символа"));
    if (desc.length < 10) return (errEl.textContent = tr("admin_error_desc", "Описание минимум 10 символов"));

    const tags = tagsRaw ? tagsRaw.split(",").map(t => t.trim()).filter(Boolean) : [];
    const data = { title, subtitle, icon, fullDesc: desc, tags, link: link || null, status, difficulty };

    const res = await API.put(`/projects/${project._id}`, data);
    if (!res.ok) { errEl.textContent = "❌ " + res.error; return; }

    close();
    await loadProjects();
    renderProjectsList();
    if (typeof updateProjectsAchievement === "function") updateProjectsAchievement();
    if (typeof showToast === "function") showToast(tr("admin_project_updated", "✅ Проект обновлён!"));
  });

  document.getElementById("projEditDelete").addEventListener("click", async () => {
    if (!confirm(tr("admin_project_confirm_delete", "Удалить проект?"))) return;
    const res = await API.del(`/projects/${project._id}`);
    if (!res.ok) { alert("❌ " + res.error); return; }
    close();
    await loadProjects();
    renderProjectsList();
    if (typeof updateProjectsAchievement === "function") updateProjectsAchievement();
    if (typeof showToast === "function") showToast(tr("admin_project_deleted", "🗑️ Проект удалён"));
  });
}

// ===== АДМИН-ФОРМА =====
function initProjectsAdmin() {
  const container = document.querySelector(".projects-section .container");
  if (!container) return;

  const old = document.getElementById("adminProjectForm");
  if (old) old.remove();

  if (!accounts.isAdmin()) return;

  const form = document.createElement("div");
  form.id = "adminProjectForm";
  form.className = "admin-post-form";
  form.innerHTML = `
    <h3 class="admin-post-title">${tr("admin_create_project", "⚡ Создать проект (админ)")}</h3>
    <input type="text" id="projTitle" placeholder="${tr("admin_project_title_ph", "Название проекта")}" maxlength="60">
    <input type="text" id="projSubtitle" placeholder="${tr("admin_project_subtitle_ph", "Подзаголовок")}" maxlength="80">
    <input type="text" id="projIcon" placeholder="${tr("admin_project_icon_ph", "Эмодзи-иконка")}" maxlength="4">
    <textarea id="projDesc" placeholder="${tr("admin_project_desc_ph", "Полное описание")}" maxlength="1500"></textarea>
    <input type="text" id="projTags" placeholder="${tr("admin_project_tags_ph", "Теги через запятую")}">
    <input type="text" id="projLink" placeholder="${tr("admin_project_link_ph", "Ссылка (можно пусто)")}">
    <select id="projStatus" class="admin-post-select">
      <option value="wip">${tr("project_status_wip", "В разработке")}</option>
      <option value="available">${tr("project_status_available", "Доступно")}</option>
      <option value="done">${tr("project_status_done", "Завершён")}</option>
      <option value="idea">${tr("project_status_idea", "Идея")}</option>
    </select>
    <select id="projDifficulty" class="admin-post-select">
      <option value="">${tr("difficulty_none", "— Без сложности —")}</option>
      <option value="easy">${tr("difficulty_easy", "Простой")}</option>
      <option value="hard">${tr("difficulty_hard", "Сложный")}</option>
    </select>
    <button id="projBtn" class="admin-post-btn">${tr("admin_project_publish", "📤 Опубликовать проект")}</button>
    <div class="admin-post-error" id="projError"></div>
  `;

  const h2 = container.querySelector(".section-title");
  if (h2) h2.insertAdjacentElement("afterend", form);
  else container.insertAdjacentElement("afterbegin", form);

  document.getElementById("projBtn").addEventListener("click", async () => {
    const title = document.getElementById("projTitle").value.trim();
    const subtitle = document.getElementById("projSubtitle").value.trim();
    const icon = document.getElementById("projIcon").value.trim() || "🚀";
    const desc = document.getElementById("projDesc").value.trim();
    const tagsRaw = document.getElementById("projTags").value.trim();
    const link = document.getElementById("projLink").value.trim();
    const status = document.getElementById("projStatus").value;
    const difficulty = document.getElementById("projDifficulty").value;
    const errEl = document.getElementById("projError");
    errEl.textContent = "";

    if (title.length < 2) return (errEl.textContent = tr("admin_error_title", "Название минимум 2 символа"));
    if (desc.length < 10) return (errEl.textContent = tr("admin_error_desc", "Описание минимум 10 символов"));

    const tags = tagsRaw ? tagsRaw.split(",").map(t => t.trim()).filter(Boolean) : [];

    const res = await API.post("/projects", { title, subtitle, icon, fullDesc: desc, tags, link, status, difficulty });
    if (!res.ok) { errEl.textContent = "❌ " + res.error; return; }

    ["projTitle","projSubtitle","projIcon","projDesc","projTags","projLink"].forEach(id => {
      document.getElementById(id).value = "";
    });

    await loadProjects();
    renderProjectsList();
    if (typeof updateProjectsAchievement === "function") updateProjectsAchievement();
    window.scrollTo({ top: 0, behavior: "smooth" });
    if (typeof showToast === "function") showToast(tr("admin_project_added", "✅ Проект добавлен!"));
  });
}

// ===== ПЕРЕРИСОВКА ПРИ СМЕНЕ ЯЗЫКА =====
window.addEventListener("langChanged", () => {
  renderProjectsList();
  initProjectsAdmin();
});

// ===== ЗАПУСК =====
document.addEventListener("DOMContentLoaded", async () => {
  // Ждём пока main.js загрузит юзера
  if (!accounts.getCurrentUser() && window.getToken && window.getToken()) {
    await accounts.loadCurrentUser();
  }
  await loadProjects();
  renderProjectsList();
  initProjectsAdmin();
});