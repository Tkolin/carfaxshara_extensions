// popup_catalog.js

async function getCarsFromTab() {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return new Promise((resolve) => {
    chrome.tabs.sendMessage(tab.id, { action: "getCatalogCars" }, (resp) => {
      resolve(resp?.cars || []);
    });
  });
}

async function fetchExtraInfo(apiType, ids) {
  let url = `https://carfaxshara.com/api/extension/${apiType}/sellers/types/`;
  let resp = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", accept: "application/json" },
    body: JSON.stringify({ ids }),
  });
  if (!resp.ok) return {};
  return await resp.json();
}
function isCatalogPage(tabUrl = window.location.href) {
  // IAAI example: https://www.iaai.com/Search?...
  // Copart example: https://www.copart.com/lotSearchResults...
  return (
    /iaai\.com\/Search/.test(tabUrl) ||
    /copart\.com\/lotSearchResults/.test(tabUrl)
  );
}

async function renderCatalog() {
  let carListWrapper = document.getElementById("car_list_wrapper");
  let carListEl = document.getElementById("car_list");
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!isCatalogPage(tab.url)) {
    carListWrapper.style.display = "none";
    return;
  } else {
    carListWrapper.style.display = ""; // на всякий случай, чтобы показать если скрыт
  }
  carListEl.innerHTML = "<div>Loading...</div>";

  const cars = await getCarsFromTab();
  if (!cars.length) {
    carListEl.innerHTML = "<div>No cars found</div>";
    return;
  }

  // Определяем тип сайта (по активной вкладке)
  let apiType = "";
  if (/copart\.com/.test(tab.url)) apiType = "copart";
  else if (/iaai\.com/.test(tab.url)) apiType = "iaac";

  // Получаем результаты с API
  const ids = cars
    .map((x) => Number(x.id))
    .filter(Boolean)
    .slice(0, 15);
  const extraInfo = await fetchExtraInfo(apiType, ids);

  // Вставляем стили (один раз)
  if (!document.getElementById("car_cards_styles")) {
    let style = document.createElement("style");
    style.id = "car_cards_styles";
    document.head.appendChild(style);
  }

  // Рендер карточек
  carListEl.innerHTML = "";
  for (let c of cars) {
    let tagValue = extraInfo["" + c.id] ? extraInfo["" + c.id] : "(Нет данных)";
    let tagColor = "#ECECEC"; // серый по умолчанию

    if (tagValue.toLowerCase() === "dealer") tagColor = "#F5DFDF";
    else if (tagValue.toLowerCase() === "insurance") tagColor = "#DFF5E1";

    // Формируем ссылку на карточку машины
    let href = "";
    if (apiType === "iaac")
      href = `https://www.iaai.com/VehicleDetail/${c.id}~US`;
    else if (apiType === "copart") href = `https://www.copart.com/lot/${c.id}`;

    // Создаём ссылку-обёртку
    let a = document.createElement("a");
    a.href = href;
    a.target = "_blank";
    a.style.textDecoration = "none";
    a.style.color = "inherit";
    a.className = "car_card_link";

    a.innerHTML = `
    <div class="car_card">
      <img class="car_card_img" src="${c.img}" alt="car">
      <div class="car_card_info">
        <div class="car_card_title">${c.name || "(No name)"}</div>
        <div class="tag" style="
          background-color: ${tagColor};
          width: max-content;
        ">
          ${tagValue}
        </div>
      </div>
    </div>
  `;
    carListEl.appendChild(a);
  }
}

renderCatalog();
