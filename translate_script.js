// translate_script.js

// Ожидается, что window.translations определён до этого скрипта
// window.translations = { ... }

function applyTranslations(lang) {
  // Fallback — English
  const t =
    (window.translations && window.translations[lang]) ||
    window.translations["en"];

  // Пробегаемся по ключам и вставляем перевод в элементы по id="t_..."
  Object.keys(t).forEach((key) => {
    const el = document.getElementById("t_" + key);
    if (el) el.textContent = t[key];
  });

  // Обновим опции select, чтобы всегда были названы родным языком
  const langNames = {
    en: "English 🇬🇧",
    ua: "Українська 🇺🇦",
    ru: "Русский 🇷🇺",
    es: "Español 🇪🇸",
    pl: "Polski 🇵🇱",
  };
  Object.entries(langNames).forEach(([code, label]) => {
    const opt = document.querySelector(`option[value="${code}"]`);
    if (opt) opt.textContent = label;
  });
}

// Событие на смену языка
document.addEventListener("DOMContentLoaded", function () {
  const langSelect = document.getElementById("lang");
  if (!langSelect) return;

  // Восстановить выбранный язык из localStorage (если нет — по умолчанию английский)
  const savedLang = localStorage.getItem("lang") || "en";
  langSelect.value = savedLang;
  applyTranslations(savedLang);

  // Реальное обновление при смене
  langSelect.addEventListener("change", function () {
    const lang = langSelect.value;
    localStorage.setItem("lang", lang);
    applyTranslations(lang);
  });
});
