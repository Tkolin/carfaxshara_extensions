// login_translations.js
window.loginTranslations = {
  en: {
    slides: [
      {
        title: "Find out who is selling the car",
        description:
          "Insurance or dealer – visible directly in the Copart and IAAI list",
      },
      {
        title: "See the price the seller wants",
        description: "Reserve bid - one click, no guessing",
      },
      {
        title: "Check car statistics",
        description: "How many sold and at what price.",
      },
    ],
    get_started: "Get Started",
  },
  ru: {
    slides: [
      {
        title: "🔍 Узнай, кто продает авто",
        description:
          "Страховая или дилер - это видно прямо в списке на Copart и IAAI",
      },
      {
        title: "Посмотрите цену, которую хочет продавец",
        description: "Резервная ставка - в один клик, без догадок",
      },
      {
        title: "Смотрите статистику авто",
        description: "Сколько продалось и за какую сумму.",
      },
    ],
    get_started: "Начать",
  },
  ua: {
    slides: [
      {
        title: "🔍 Дізнайтеся, хто продає авто",
        description:
          "Страхова чи дилер - видно прямо у списку на Copart та IAAI",
      },
      {
        title: "Подивіться ціну, яку хоче продавець",
        description: "Резервна ставка - в один клік, без здогадок",
      },
      {
        title: "Переглядайте статистику авто",
        description: "Скільки продано і за яку суму.",
      },
    ],
    get_started: "Почати",
  },
  es: {
    slides: [
      {
        title: "🔍 Descubre quién vende el coche",
        description:
          "Seguro o concesionario - visible directamente en la lista de Copart e IAAI",
      },
      {
        title: "Mira el precio que quiere el vendedor",
        description: "Oferta de reserva - un clic, sin conjeturas",
      },
      {
        title: "Consulta las estadísticas del coche",
        description: "Cuántos se vendieron y a qué precio.",
      },
    ],
    get_started: "Comenzar",
  },
  pl: {
    slides: [
      {
        title: "🔍 Dowiedz się, kto sprzedaje auto",
        description:
          "Ubezpieczenie lub dealer – widoczne bezpośrednio na liście Copart i IAAI",
      },
      {
        title: "Zobacz cenę, jaką chce sprzedawca",
        description: "Rezerwacja - jednym kliknięciem, bez zgadywania",
      },
      {
        title: "Sprawdź statystyki samochodu",
        description: "Ile sprzedano i po jakiej cenie.",
      },
    ],
    get_started: "Zaczynam",
  },
};

function applySliderTranslations(lang) {
  const t = window.loginTranslations[lang] || window.loginTranslations["en"];

  if (t.slides && t.slides.length) {
    t.slides.forEach((slide, i) => {
      const titleEl = document.getElementById(`slide${i + 1}_title`);
      const descEl = document.getElementById(`slide${i + 1}_desc`);
      if (titleEl) titleEl.textContent = slide.title;
      if (descEl) descEl.textContent = slide.description;
    });
  }

  const btn = document.getElementById("t_get_started");
  if (btn) btn.textContent = t.get_started;

  // Обновляем названия языков в селекте, чтобы были с флагами
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

document.addEventListener("DOMContentLoaded", function () {
  const langSelect = document.getElementById("lang");
  if (!langSelect) return;

  // Восстановим язык из localStorage или дефолт en
  let savedLang = localStorage.getItem("lang");
  if (!savedLang) {
    const browserLang = (navigator.language || navigator.userLanguage || "en")
      .slice(0, 2)
      .toLowerCase();
    savedLang = ["en", "ru", "ua", "es", "pl"].includes(browserLang)
      ? browserLang
      : "en";
    localStorage.setItem("lang", savedLang);
  }

  langSelect.value = savedLang;
  applySliderTranslations(savedLang);

  // При смене языка обновляем локализацию и localStorage
  langSelect.addEventListener("change", () => {
    const lang = langSelect.value;
    localStorage.setItem("lang", lang);
    applySliderTranslations(lang);
  });
});
