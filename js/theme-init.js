// ========== ГЛОБАЛЬНАЯ ТЕМА / ЯЗЫК / ЭФФЕКТЫ ==========

(function () {
  const SETTINGS_KEY = "site_settings";

  const THEMES = {
    dark: {
      bg: "#0a0e1a", panel: "#141a28", card: "#1e2638",
      accent: "#00ff88", accent2: "#00cc66",
      text: "#e8eef5", sub: "#7a8a9a", border: "#2a3548",
      inputBg: "#0a0e1a", shadow: "rgba(0, 0, 0, 0.5)"
    },
    light: {
      bg: "#f5f7fa", panel: "#ffffff", card: "#eef2f7",
      accent: "#00aa66", accent2: "#008855",
      text: "#1a2233", sub: "#5a6478", border: "#d0d7e2",
      inputBg: "#ffffff", shadow: "rgba(0, 0, 0, 0.1)"
    },
    neon: {
      bg: "#0d0221", panel: "#1a0033", card: "#2d0055",
      accent: "#ff00ff", accent2: "#cc00cc",
      text: "#ffffff", sub: "#c8a0d8", border: "#4a1a6a",
      inputBg: "#0d0221", shadow: "rgba(255, 0, 255, 0.2)"
    },
    matrix: {
      bg: "#000000", panel: "#0a1a0a", card: "#0f2a0f",
      accent: "#00ff00", accent2: "#00cc00",
      text: "#c8ffc8", sub: "#5a9a5a", border: "#1a3a1a",
      inputBg: "#000000", shadow: "rgba(0, 255, 0, 0.2)"
    },
    sunset: {
      bg: "#1a0b2e", panel: "#2d1b4e", card: "#3d2668",
      accent: "#ff6b35", accent2: "#cc5522",
      text: "#ffe8d6", sub: "#b89ed0", border: "#4a2d7a",
      inputBg: "#1a0b2e", shadow: "rgba(255, 107, 53, 0.2)"
    },
    ice: {
      bg: "#0a1929", panel: "#132f4c", card: "#1e3a5f",
      accent: "#4dd0e1", accent2: "#26a0b8",
      text: "#e0f7fa", sub: "#8aaac0", border: "#1e4a6a",
      inputBg: "#0a1929", shadow: "rgba(77, 208, 225, 0.2)"
    }
  };

  const TRANSLATIONS = {
    ru: {
      nav_home: "🏠 Главная",
      nav_projects: "📁 Проекты",
      nav_shop: "🛒 Магазин",
      nav_reviews: "💬 Отзывы",
      nav_contacts: "📬 Контакты",
      nav_settings: "⚙️ Настройки",
      login: "Войти",

      menu_profile: "Настройки профиля",
      menu_logout: "Выйти",

      profile_name: "Akiyama",
      profile_sub: "Александр Туманов",
      profile_bio: "Разработчик · Создатель ХАБ v10.0",

      feed_title: "📝 Что нового",
      feed_load_more: "Показать ещё",

      ach_title: "🏆 Достижения",
      ach_projects_title: "Выполнено проектов",
      ach_projects_desc: "сложный",
      ach_projects_desc2: "простых",
      ach_projects_hint: "нажми чтобы раскрыть ▾",
      ach_projects_hint_open: "нажми чтобы скрыть ▴",
      ach_work_title: "Время в работе",
      ach_work_days: "дней",
      ach_work_since: "с",
      ach_reviews_title: "Отзывы",
      ach_reviews_count: "отзывов",
      ach_reviews_none: "—",

      detail_hard: "СЛОЖНЫЙ",
      detail_hub_name: "ХАБ v10.0",
      detail_hub_desc: "Портативная система управления, 3000 строк кода",
      detail_empty: "Простые проекты пока отсутствуют",

      reviews_preview_title: "💬 Последние отзывы",
      reviews_preview_all: "Все отзывы →",
      reviews_empty_index: "Отзывов пока нет. Будь первым — напиши на странице отзывов.",

      projects_title: "🚀 Мои проекты",
      projects_all: "Все проекты →",
      project_hub_title: "ХАБ v10.0",
      project_hub_desc: "Портативная система управления на флешке. 3000 строк кода, 11 игр, 12 тем.",
      project_site_title: "Этот сайт",
      project_site_desc: "Личный блог о разработке и проектах. HTML, CSS, JS без фреймворков.",
      project_more: "Подробнее →",

      contacts_title: "📬 Связаться со мной",
      contacts_email: "Email:",
      contacts_tg: "✈️ Telegram: @Alexs08i",
      contacts_tg_desc: "Быстрее всего — пиши сюда. Отвечаю почти всегда.",
      contacts_email_desc: "Для серьёзных вопросов, заказов и предложений.",
      contacts_note_title: "💬 По любому вопросу",
      contacts_note_text: "Пиши свободно — по проектам, заказам, коллаборациям или просто поболтать. Отвечаю в течение дня.",

      footer: "© 2026 Akiyama · Made with 🦾",

      // ===== ПРОФИЛЬ =====
      profile_need_login: "Войди в аккаунт чтобы редактировать профиль",
      profile_avatar_title: "🎭 Аватарка",
      profile_avatar_desc: "Выбери эмодзи для своего профиля",
      profile_name_title: "📝 Отображаемое имя",
      profile_name_desc: "Как тебя видят другие",
      profile_name_ph: "Введи имя...",
      profile_bio_title: "💬 Bio",
      profile_bio_desc: "Короткое описание о себе",
      profile_bio_ph: "Что-нибудь о себе...",
      profile_password_title: "🔐 Смена пароля",
      profile_password_desc: "Оставь пустым если не хочешь менять",
      profile_old_password_ph: "Старый пароль",
      profile_new_password_ph: "Новый пароль (минимум 4 символа)",
      profile_new_password2_ph: "Повтори новый пароль",
      profile_save: "💾 Сохранить изменения",
      profile_cancel: "Отмена",
      profile_saved: "✅ Профиль сохранён!",
      profile_error_name: "Имя минимум 2 символа",
      profile_error_name_long: "Имя максимум 20 символов",
      profile_error_bio: "Bio максимум 100 символов",
      profile_error_old_pass: "Введи старый пароль",
      profile_error_new_pass: "Введи новый пароль",
      profile_error_pass_short: "Пароль минимум 4 символа",
      profile_error_pass_mismatch: "Пароли не совпадают",
      profile_error_wrong_pass: "Неверный старый пароль",

      // ===== ЮЗЕР-ПРОФИЛЬ =====
      user_bio_title: "💬 О себе",
      user_comments_title: "💬 Последние комментарии",
      user_reviews_title: "📖 Отзывы",
      user_not_found: "Пользователь не найден",
      user_go_home: "На главную",
      user_registered: "Зарегистрирован",
      user_no_comments: "Комментариев пока нет",
      user_no_reviews: "Отзывов пока нет",
      user_to_post: "к посту",

      // ===== НАСТРОЙКИ =====
      settings_title: "⚙️ Настройки",
      settings_theme: "🎨 Тема оформления",
      settings_theme_desc: "Выбери цветовую схему сайта",
      theme_dark: "Тёмная",
      theme_light: "Светлая",
      theme_neon: "Неон",
      theme_matrix: "Матрица",
      theme_sunset: "Закат",
      theme_ice: "Ледяная",
      settings_lang: "🌍 Язык интерфейса",
      settings_lang_desc: "Language / Язык",
      settings_effects: "✨ Эффекты",
      settings_effects_desc: "Анимации и визуальные фишки",
      opt_particles: "Фон с частицами",
      opt_particles_desc: "Анимированный canvas-фон",
      opt_glow: "Свечение элементов",
      opt_glow_desc: "Glow-эффект у кнопок и карточек",
      opt_anim: "Анимации переходов",
      opt_anim_desc: "Плавные появления и ховеры",
      opt_grid: "Сетка на фоне",
      opt_grid_desc: "Техно-сетка поверх фона",
      settings_notif: "🔔 Уведомления",
      settings_notif_desc: "Всплывающие сообщения",
      opt_toasts: "Тосты",
      opt_toasts_desc: "Показывать \"Отзыв добавлен\", \"Скопировано\" и т.д.",
      settings_data: "📦 Данные",
      settings_data_desc: "Управление локальным хранилищем",
      btn_export: "📤 Экспорт данных",
      btn_import: "📥 Импорт данных",
      btn_reset: "🗑️ Сбросить всё",

      // ===== ОТЗЫВЫ =====
      reviews_title: "💬 Отзывы",
      reviews_form_title: "✍️ Оставить свой отзыв",
      reviews_name: "Имя",
      reviews_name_ph: "Как тебя звать?",
      reviews_rating: "Оценка",
      reviews_text: "Отзыв",
      reviews_text_ph: "Что думаешь о проекте?",
      reviews_send: "Отправить отзыв",
      reviews_others: "📖 Отзывы других",
      reviews_none: "Отзывов пока нет. Будь первым!",
      reviews_stats_count: "отзывов",
      reviews_stats_avg: "средняя оценка",
      reviews_error_name: "Имя минимум 2 символа",
      reviews_error_rating: "Поставь оценку",
      reviews_error_text: "Отзыв минимум 5 символов",
      reviews_added: "✅ Отзыв добавлен!",

      // ===== ПРОЕКТЫ =====
      projects_empty: "Проектов пока нет",
      admin_create_project: "⚡ Создать проект (админ)",
      admin_project_title_ph: "Название проекта",
      admin_project_subtitle_ph: "Подзаголовок (например: Портативная система)",
      admin_project_icon_ph: "Эмодзи-иконка (например 🦾)",
      admin_project_desc_ph: "Полное описание проекта",
      admin_project_tags_ph: "Теги через запятую (Python, ХАБ)",
      admin_project_link_ph: "Ссылка (можно пусто)",
      admin_project_publish: "📤 Опубликовать проект",
      admin_project_added: "✅ Проект добавлен!",
      admin_error_title: "Название минимум 2 символа",
      admin_error_desc: "Описание минимум 10 символов",
      project_link_soon: "Ссылка скоро",
      project_status_done: "Завершён",
      project_status_wip: "В разработке",
      project_status_idea: "Идея",
      project_hub_link: "Открыть сайт ХАБа →",
      project_open: "Открыть →",

      proj_hub_title: "ХАБ v10.0",
      proj_hub_subtitle: "Портативная система управления",
      proj_hub_desc: "Первый полноценный проект, вдохновлённый программой из Железного человека. Вдохновившись тем, как мой друг зарабатывает значительные деньги в этой сфере — решил попробовать себя. Проект занял около недели неактивного кодинга. В итоге создал интересное приложение с функциями связи ПК с другими гаджетами через Telegram. Проект был создан и закончен по большей части для обучения и внёс в это большой вклад.",
      proj_site_title: "Этот сайт",
      proj_site_subtitle: "Личный блог-портфолио",
      proj_site_desc: "Когда я закончил первый проект, я понял что мне нужна площадка для публикации новостей и проектов. Так появился этот сайт. Здесь я пишу о том, что делаю, показываю проекты, собираю отзывы. Сайт полностью написан руками — HTML, CSS, JavaScript, без единого фреймворка. Внутри: система аккаунтов с рангами, комментарии, отзывы, магазин, темы оформления, перевод на английский.",

      // ===== МАГАЗИН =====
      shop_title: "🛒 Магазин",
      shop_subtitle: "Оформление профиля за очки активности. Зарабатывай очки — лайкай, комментируй, пиши отзывы.",
      shop_balance: "⚡ Твой баланс:",
      shop_balance_points: "очков",
      shop_need_login: "Войди в аккаунт, чтобы покупать",
      shop_buy: "Купить за",
      shop_apply: "🎯 Применить",
      shop_active: "✅ Активно",
      shop_free: "Бесплатно",
      shop_applied: "✅ Применено:",
      shop_error_login: "Войди в аккаунт чтобы покупать 👆",
      shop_error_points: "Мало очков",
      shop_error_owned: "Уже куплено",
      shop_sort: "Сортировка",
      shop_filter: "Фильтр",
      shop_filter_empty: "Ничего не найдено",
      shop_sort_default: "По умолчанию",
      shop_sort_cheap: "Сначала дешёвые",
      shop_sort_expensive: "Сначала дорогие",
      shop_filter_all: "Все товары",
      shop_filter_owned: "Только купленные",
      shop_filter_not_owned: "Только некупленные",

      // ===== АДМИН-ПОСТЫ =====
      admin_create_post: "⚡ Создать пост (админ)",
      admin_post_ph: "Что нового?",
      admin_post_tags_ph: "Теги через запятую (например: Python, ХАБ)",
      admin_post_publish: "📤 Опубликовать",
      admin_post_added: "✅ Пост опубликован!",
      admin_post_error_text: "Текст минимум 5 символов",
admin_post_image: "Картинка (не обязательно)",
feed_filter: "Фильтр",
feed_clear: "✕ Сбросить",
feed_empty: "Постов нет",
admin_post_date: "Дата и время публикации",

      // ===== МОДАЛКА ВХОДА =====
      auth_login: "🔐 Вход",
      auth_register: "📝 Регистрация",
      auth_username: "Логин",
      auth_password: "Пароль",
      auth_password2: "Подтвердите пароль",
      auth_login_btn: "Войти",
      auth_register_btn: "Зарегистрироваться",
      auth_tab_login: "Вход",
      auth_tab_register: "Регистрация",

      // ===== ДИНАМИКА =====
      post_share: "🔗 Поделиться",
      post_share_copied: "✅ Скопировано",
      comment_empty: "Комментов пока нет. Будь первым!",
      comment_placeholder: "Написать коммент...",
           comment_need_login: "Сначала войди через кнопку сверху 👆",

      // ===== ПРОЕКТЫ (НОВОЕ) =====
      project_status_available: "Доступно",
      project_status: "Статус",
      admin_edit_project: "Редактировать проект",
      admin_project_updated: "✅ Проект обновлён!",
      admin_project_deleted: "🗑️ Проект удалён",
      admin_project_confirm_delete: "Удалить проект?",
      delete: "Удалить",
      difficulty_hard: "Сложный",
      difficulty_easy: "Простой",
      difficulty_none: "— Без сложности —",
      project_difficulty: "Сложность",
      admin_edit_post: "Редактировать пост",
      admin_post_text: "Текст",
      admin_post_tags: "Теги через запятую",
      admin_post_updated: "✅ Пост обновлён!",
      admin_post_deleted: "🗑️ Пост удалён",
      admin_post_confirm_delete: "Удалить пост?"
    },

    en: {
      nav_home: "🏠 Home",
      nav_projects: "📁 Projects",
      nav_shop: "🛒 Shop",
      nav_reviews: "💬 Reviews",
      nav_contacts: "📬 Contacts",
      nav_settings: "⚙️ Settings",
      login: "Login",

      menu_profile: "Profile settings",
      menu_logout: "Logout",

      profile_name: "Akiyama",
      profile_sub: "Alexander Tumanov",
      profile_bio: "Developer · Creator of HUB v10.0",

      feed_title: "📝 What's new",
      feed_load_more: "Show more",

      ach_title: "🏆 Achievements",
      ach_projects_title: "Completed projects",
      ach_projects_desc: "complex",
      ach_projects_desc2: "simple",
      ach_projects_hint: "click to expand ▾",
      ach_projects_hint_open: "click to hide ▴",
      ach_work_title: "Time working",
      ach_work_days: "days",
      ach_work_since: "since",
      ach_reviews_title: "Reviews",
      ach_reviews_count: "reviews",
      ach_reviews_none: "—",

      detail_hard: "COMPLEX",
      detail_hub_name: "HUB v10.0",
      detail_hub_desc: "Portable control system, 3000 lines of code",
      detail_empty: "No simple projects yet",

      reviews_preview_title: "💬 Latest reviews",
      reviews_preview_all: "All reviews →",
      reviews_empty_index: "No reviews yet. Be the first — write on the reviews page.",

      projects_title: "🚀 My projects",
      projects_all: "All projects →",
      project_hub_title: "HUB v10.0",
      project_hub_desc: "Portable control system on a flash drive. 3000 lines, 11 games, 12 themes.",
      project_site_title: "This site",
      project_site_desc: "Personal blog about dev and projects. HTML, CSS, JS without frameworks.",
      project_more: "Learn more →",

      contacts_title: "📬 Contact me",
      contacts_email: "Email:",
      contacts_tg: "✈️ Telegram: @Alexs08i",
      contacts_tg_desc: "Fastest way — write here. I reply almost always.",
      contacts_email_desc: "For serious questions, orders and offers.",
      contacts_note_title: "💬 For any question",
      contacts_note_text: "Write freely — about projects, orders, collabs, or just to chat. I reply within a day.",

      footer: "© 2026 Akiyama · Made with 🦾",

      // ===== PROFILE =====
      profile_need_login: "Log in to edit your profile",
      profile_avatar_title: "🎭 Avatar",
      profile_avatar_desc: "Pick an emoji for your profile",
      profile_name_title: "📝 Display name",
      profile_name_desc: "How others see you",
      profile_name_ph: "Enter name...",
      profile_bio_title: "💬 Bio",
      profile_bio_desc: "Short description about you",
      profile_bio_ph: "Something about you...",
      profile_password_title: "🔐 Change password",
      profile_password_desc: "Leave empty if you don't want to change",
      profile_old_password_ph: "Old password",
      profile_new_password_ph: "New password (min 4 chars)",
      profile_new_password2_ph: "Repeat new password",
      profile_save: "💾 Save changes",
      profile_cancel: "Cancel",
      profile_saved: "✅ Profile saved!",
      profile_error_name: "Name at least 2 characters",
      profile_error_name_long: "Name max 20 characters",
      profile_error_bio: "Bio max 100 characters",
      profile_error_old_pass: "Enter old password",
      profile_error_new_pass: "Enter new password",
      profile_error_pass_short: "Password min 4 characters",
      profile_error_pass_mismatch: "Passwords don't match",
      profile_error_wrong_pass: "Wrong old password",

      // ===== USER PAGE =====
      user_bio_title: "💬 About",
      user_comments_title: "💬 Latest comments",
      user_reviews_title: "📖 Reviews",
      user_not_found: "User not found",
      user_go_home: "Go home",
      user_registered: "Registered",
      user_no_comments: "No comments yet",
      user_no_reviews: "No reviews yet",
      user_to_post: "to post",

      // ===== SETTINGS =====
      settings_title: "⚙️ Settings",
      settings_theme: "🎨 Theme",
      settings_theme_desc: "Choose site color scheme",
      theme_dark: "Dark",
      theme_light: "Light",
      theme_neon: "Neon",
      theme_matrix: "Matrix",
      theme_sunset: "Sunset",
      theme_ice: "Ice",
      settings_lang: "🌍 Language",
      settings_lang_desc: "Language / Язык",
      settings_effects: "✨ Effects",
      settings_effects_desc: "Animations and visual features",
      opt_particles: "Particle background",
      opt_particles_desc: "Animated canvas background",
      opt_glow: "Element glow",
      opt_glow_desc: "Glow effect on buttons and cards",
      opt_anim: "Transition animations",
      opt_anim_desc: "Smooth appearances and hovers",
      opt_grid: "Grid background",
      opt_grid_desc: "Tech grid over the background",
      settings_notif: "🔔 Notifications",
      settings_notif_desc: "Pop-up messages",
      opt_toasts: "Toasts",
      opt_toasts_desc: "Show \"Review added\", \"Copied\", etc.",
      settings_data: "📦 Data",
      settings_data_desc: "Manage local storage",
      btn_export: "📤 Export data",
      btn_import: "📥 Import data",
      btn_reset: "🗑️ Reset all",

      // ===== REVIEWS =====
      reviews_title: "💬 Reviews",
      reviews_form_title: "✍️ Leave your review",
      reviews_name: "Name",
      reviews_name_ph: "What's your name?",
      reviews_rating: "Rating",
      reviews_text: "Review",
      reviews_text_ph: "What do you think about the project?",
      reviews_send: "Submit review",
      reviews_others: "📖 Other reviews",
      reviews_none: "No reviews yet. Be the first!",
      reviews_stats_count: "reviews",
      reviews_stats_avg: "average rating",
      reviews_error_name: "Name at least 2 characters",
      reviews_error_rating: "Set a rating",
      reviews_error_text: "Review at least 5 characters",
      reviews_added: "✅ Review added!",

      // ===== PROJECTS =====
      projects_empty: "No projects yet",
      admin_create_project: "⚡ Create project (admin)",
      admin_project_title_ph: "Project title",
      admin_project_subtitle_ph: "Subtitle (e.g: Portable system)",
      admin_project_icon_ph: "Emoji icon (e.g 🦾)",
      admin_project_desc_ph: "Full project description",
      admin_project_tags_ph: "Tags comma-separated (Python, HUB)",
      admin_project_link_ph: "Link (can be empty)",
      admin_project_publish: "📤 Publish project",
      admin_project_added: "✅ Project added!",
      admin_error_title: "Title at least 2 characters",
      admin_error_desc: "Description at least 10 characters",
      project_link_soon: "Link soon",
      project_status_done: "Completed",
      project_status_wip: "In development",
      project_status_idea: "Idea",
      project_hub_link: "Open HUB site →",
      project_open: "Open →",

      proj_hub_title: "HUB v10.0",
      proj_hub_subtitle: "Portable control system",
      proj_hub_desc: "The first full-fledged project, inspired by the program from Iron Man. Inspired by how my friend earns significant money in this field — I decided to try myself. The project took about a week of inactive coding. As a result, I created an interesting application with features for connecting a PC to other gadgets via Telegram. The project was created and finished mostly for learning and made a big contribution to it.",
      proj_site_title: "This site",
      proj_site_subtitle: "Personal blog portfolio",
      proj_site_desc: "When I finished my first project, I realized I needed a platform for publishing news and projects. That's how this site appeared. Here I write about what I do, show projects, and collect reviews. The site is fully hand-written — HTML, CSS, JavaScript, without a single framework. Inside: an account system with ranks, comments, reviews, a shop, themes, and English translation.",

      // ===== SHOP =====
      shop_title: "🛒 Shop",
      shop_subtitle: "Profile customization for activity points. Earn points — like, comment, write reviews.",
      shop_balance: "⚡ Your balance:",
      shop_balance_points: "points",
      shop_need_login: "Log in to buy",
      shop_buy: "Buy for",
      shop_apply: "🎯 Apply",
      shop_active: "✅ Active",
      shop_free: "Free",
      shop_applied: "✅ Applied:",
      shop_error_login: "Log in to buy 👆",
      shop_error_points: "Not enough points",
      shop_error_owned: "Already owned",
      shop_sort: "Sort",
      shop_filter: "Filter",
      shop_filter_empty: "Nothing found",
      shop_sort_default: "Default",
      shop_sort_cheap: "Cheapest first",
      shop_sort_expensive: "Most expensive first",
      shop_filter_all: "All items",
      shop_filter_owned: "Owned only",
      shop_filter_not_owned: "Not owned only",

      // ===== ADMIN POSTS =====
      admin_create_post: "⚡ Create post (admin)",
      admin_post_ph: "What's new?",
      admin_post_tags_ph: "Tags comma-separated (Python, HUB)",
      admin_post_publish: "📤 Publish",
      admin_post_added: "✅ Post published!",
      admin_post_error_text: "Text at least 5 characters",
admin_post_image: "Image (optional)",
feed_filter: "Filter",
feed_clear: "✕ Clear",
feed_empty: "No posts",
admin_post_date: "Publication date and time",

      // ===== AUTH MODAL =====
      auth_login: "🔐 Login",
      auth_register: "📝 Register",
      auth_username: "Username",
      auth_password: "Password",
      auth_password2: "Confirm password",
      auth_login_btn: "Login",
      auth_register_btn: "Register",
      auth_tab_login: "Login",
      auth_tab_register: "Register",

      // ===== DYNAMICS =====
      post_share: "🔗 Share",
      post_share_copied: "✅ Copied",
      comment_empty: "No comments yet. Be the first!",
      comment_placeholder: "Write a comment...",
            comment_need_login: "Log in first via the button above 👆",

      // ===== PROJECTS (NEW) =====
      project_status_available: "Available",
      project_status: "Status",
      admin_edit_project: "Edit project",
      admin_project_updated: "✅ Project updated!",
      admin_project_deleted: "🗑️ Project deleted",
      admin_project_confirm_delete: "Delete project?",
      delete: "Delete",
      difficulty_hard: "Complex",
      difficulty_easy: "Simple",
      difficulty_none: "— No difficulty —",
      project_difficulty: "Difficulty",
      admin_edit_post: "Edit post",
      admin_post_text: "Text",
      admin_post_tags: "Tags comma-separated",
      admin_post_updated: "✅ Post updated!",
      admin_post_deleted: "🗑️ Post deleted",
      admin_post_confirm_delete: "Delete post?",
    }
  };

  const DEFAULT = {
    theme: "dark", lang: "ru",
    particles: true, glow: true, anim: true, grid: true, toasts: true
  };

  function getSettings() {
    try {
      const saved = JSON.parse(localStorage.getItem(SETTINGS_KEY) || "{}");
      return { ...DEFAULT, ...saved };
    } catch (e) {
      return DEFAULT;
    }
  }

  function hexToRgba(hex, a) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${a})`;
  }

  function applyTheme(themeName) {
    const t = THEMES[themeName] || THEMES.dark;
    const root = document.documentElement;

    root.style.setProperty("--bg", t.bg);
    root.style.setProperty("--panel", t.panel);
    root.style.setProperty("--card", t.card);
    root.style.setProperty("--accent", t.accent);
    root.style.setProperty("--accent2", t.accent2);
    root.style.setProperty("--text", t.text);
    root.style.setProperty("--sub", t.sub);
    root.style.setProperty("--border", t.border);
    root.style.setProperty("--input-bg", t.inputBg);
    root.style.setProperty("--shadow-color", t.shadow);
    root.style.setProperty("--glow", `0 0 24px ${hexToRgba(t.accent, 0.35)}`);

    if (document.body) document.body.dataset.theme = themeName;
  }

    function applyLang(lang) {
    if (document.body) document.body.dataset.lang = lang;

    const tr = TRANSLATIONS[lang] || TRANSLATIONS.ru;

    document.querySelectorAll("[data-i18n]").forEach(el => {
      const key = el.dataset.i18n;
      if (tr[key] !== undefined) el.textContent = tr[key];
    });

    document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
      const key = el.dataset.i18nPlaceholder;
      if (tr[key] !== undefined) el.placeholder = tr[key];
    });

    const userName = document.getElementById("userName");
    if (userName) {
      const loggedIn = localStorage.getItem("site_current_user");
      if (loggedIn && window.accounts && accounts.getDisplayName) {
        userName.textContent = accounts.getDisplayName(loggedIn);
      } else {
        userName.textContent = loggedIn ? loggedIn : tr.login;
      }
    }

    window.CURRENT_LANG = lang;
    window.t = function (key) {
      return tr[key] !== undefined ? tr[key] : key;
    };

    window.dispatchEvent(new Event("langChanged"));
  }

  function applyEffects(s) {
    const canvas = document.getElementById("bgCanvas");
    const grid = document.querySelector(".bg-grid");
    const glow = document.querySelector(".bg-glow");

    if (canvas) canvas.style.display = s.particles ? "" : "none";
    if (grid) grid.style.display = s.grid ? "" : "none";
    if (glow) glow.style.display = s.glow ? "" : "none";

    if (document.body) {
      document.body.classList.toggle("no-anim", !s.anim);
      document.body.classList.toggle("no-glow", !s.glow);
    }
  }

  window.APP_SETTINGS = getSettings();
  window.APP_THEMES = THEMES;
  window.APP_TRANSLATIONS = TRANSLATIONS;
  window.applyAppTheme = applyTheme;
  window.applyAppLang = applyLang;
  window.applyAppEffects = applyEffects;

  const s = window.APP_SETTINGS;

  applyTheme(s.theme);

  document.addEventListener("DOMContentLoaded", () => {
    applyTheme(s.theme);
    applyLang(s.lang);
    applyEffects(s);
  });
})();