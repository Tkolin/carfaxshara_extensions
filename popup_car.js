// Парсим car_id из URL (работает для popup, если tab.url передан)
function getCarIdAndApi(url) {
  // Примеры для теста локально:
  // url = "https://www.iaai.com/VehicleDetail/43147851~US";
  // url = "https://www.copart.com/lot/64461105/clean-title-2009-hummer-h3-tx-ft-worth";
  let car_id = null,
    api = null;

  if (/iaai\.com/.test(url)) {
    const match = url.match(/VehicleDetail\/(\d+)/);
    if (match) car_id = match[1];
    api = "iaac";
  }
  if (/copart\.com/.test(url)) {
    const match = url.match(/lot\/(\d+)/);
    if (match) car_id = match[1];
    api = "copart";
  }
  // Для теста локально (замени на нужный id)
  //   if (!car_id) car_id = "43147851";
  //   if (!api) api = "iaac";
  return { car_id, api };
}
function isCarDetailPage(url = window.location.href) {
  console.log("url", url);
  return (
    /iaai\.com\/VehicleDetail\/\d+/.test(url) ||
    /copart\.com\/lot\/\d+/.test(url)
  );
}
async function loadCarData() {
  let [tab] = await chrome.tabs.query({
    active: true,
    currentWindow: true,
  });

  if (!isCarDetailPage(tab.url)) {
    // если это не карточка, просто скрыть блок и выйти
    console.log("no car");
    let block = document.getElementById("car_details");
    if (block) block.style.display = "none";
    return;
  }

  const { car_id, api } = getCarIdAndApi(tab.url);
  if (!car_id) {
    console.error("Car ID not found!");
    return;
  }
  let url = `https://carfaxshara.com/api/extension/${api}/detailed/`;
  let resp = await fetch(url, {
    method: "POST",
    headers: {
      accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ car_id: Number(car_id) }),
  });
  if (!resp.ok) {
    console.error("Ошибка загрузки данных!");
    return;
  }
  let data = await resp.json();

  // Подставляем значения в html
  document.getElementById("car_vin").textContent = data.vin || "-";
  document.getElementById("car_type").textContent = data.seller || "-";
  document.getElementById("car_price").textContent = data.seller_reserve_price
    ? "$" + data.seller_reserve_price
    : "-";
  document.getElementById("car_seller").textContent = data.seller_name || "-";

  // Таблица продаж
  let sales = data.sales_stats || [];
  let table = document.getElementById("sales_table").querySelector("tbody");
  table.innerHTML = "";
  for (const stat of sales) {
    // Определяем цвет
    let statusColor = "";
    if ((stat.status_message || "").toLowerCase() === "sold")
      statusColor = "#DB3447";
    else if ((stat.status_message || "").toLowerCase() === "not sold")
      statusColor = "#2FA64D";
    // Можно добавить другие статусы при необходимости

    let tr = document.createElement("tr");
    tr.innerHTML = `
    <td>${stat.date}</td>
    <td>$${stat.price}</td>
    <td>
      <span style="color: ${statusColor || "#222"}; font-weight:600;">
        ${stat.status_message}
      </span>
    </td>
  `;
    table.appendChild(tr);
  }

  // Репорты
  document.getElementById("car_carfar_report_price").textContent =
    data.carfax_price ? `$${data.carfax_price}` : "-";
  document.getElementById("carfax_report_link").href =
    data.carfax_report || "#";

  document.getElementById("car_autocheck_report_price").textContent =
    data.autocheck_price ? `$${data.autocheck_price}` : "-";
  document.getElementById("autocheck_report_link").href =
    data.autocheck_report || "#";
}

// Для popup-расширения: можно получать tab.url через background → chrome.tabs.query
loadCarData();
