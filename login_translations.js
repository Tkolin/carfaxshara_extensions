// login_translations.js
window.loginTranslations = {
  en: {
    main_title: "Easy way to buy your dream car",
    subtitle:
      "Get instant access to detailed VIN reports and make smarter decisions before you buy.",
    get_started: "Get Started",
  },
  ru: {
    main_title: "Лёгкий способ купить автомобиль мечты",
    subtitle:
      "Получите мгновенный доступ к детальным VIN-отчётам и принимайте более взвешенные решения перед покупкой.",
    get_started: "Начать",
  },
  ua: {
    main_title: "Легкий спосіб купити авто мрії",
    subtitle:
      "Миттєвий доступ до детальних VIN-звітів — приймайте рішення впевнено перед покупкою.",
    get_started: "Почати",
  },
  es: {
    main_title: "La forma fácil de comprar el coche de tus sueños",
    subtitle:
      "Obtén acceso instantáneo a informes VIN detallados y toma decisiones más inteligentes antes de comprar.",
    get_started: "Comenzar",
  },
  pl: {
    main_title: "Łatwy sposób na zakup wymarzonego samochodu",
    subtitle:
      "Uzyskaj natychmiastowy dostęp do szczegółowych raportów VIN i podejmuj lepsze decyzje przed zakupem.",
    get_started: "Zaczynam",
  },
};
// translate_login.js

function applyLoginTranslations(lang) {
  const t =
    (window.loginTranslations && window.loginTranslations[lang]) ||
    window.loginTranslations["en"];

  if (document.getElementById("t_main_title")) {
    document.getElementById("t_main_title").textContent = t.main_title;
  }
  if (document.getElementById("t_subtitle")) {
    document.getElementById("t_subtitle").textContent = t.subtitle;
  }
  if (document.getElementById("t_get_started")) {
    document.getElementById("t_get_started").textContent = t.get_started;
  }
}

document.addEventListener("DOMContentLoaded", function () {
  // ===== Новый блок с автоопределением языка =====
  const supportedLangs = ["en", "ru", "ua", "es", "pl"];
  let saved = localStorage.getItem("lang");
  if (!saved) {
    const browserLang =
      (navigator.language || navigator.userLanguage || "en").slice(0, 2).toLowerCase();
    saved = supportedLangs.includes(browserLang) ? browserLang : "en";
    localStorage.setItem("lang", saved);
  }
  applyLoginTranslations(saved);
});
