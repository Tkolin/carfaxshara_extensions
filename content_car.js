// Вставляем стили один раз
function insertStyles() {
  if (document.getElementById("car-details-styles")) return; // не вставлять повторно
  const style = document.createElement("style");
  style.id = "car-details-styles";
  style.textContent = `

    .tkl_card {
      min-height: 40px;
      background-color: white;
      border-radius: 12px;
      padding: 16px;
      margin-bottom: 10px;
      color: #23262F;
      box-shadow: 0 2px 8px rgba(34, 44, 69, 0.07);
      font-size: 15px;
      display: flex;
      flex-direction: column;
      gap: 15px;
    }
    .tkl_card-row {
      display: flex;
      justify-content: space-between;
      width: 100%;
      align-items: center;
    }
    h3.title {
      font-weight: 600;
      font-size: 20px;
      margin-bottom: 10px;
      color: #23262F;
    }
    .tkl_table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 8px;
    }
    th, td {
      padding: 6px 10px;
      border-bottom: 1px solid #f3f3f3;
      text-align: left;
    }
    th {
      color: #888;
      font-weight: 600;
    }
    .tkl_report-link {
      background-color: #6265EF;
      color: white;
      text-decoration: none;
      margin-left: 10px;
      font-size: 13px;
      padding: 9px 18px;
      border-radius: 90px;
    }
    .tkl_tag {
      padding: 6px 14px;
      border-radius: 90px;
      min-width: 60px;
      text-align: center;
    }
    #tkl_car_type {
      background-color: #DFF5E1;
    }
    #tkl_car_price {
      background-color: #FDD9A0;
    }
    #tkl_car_seller {
      background-color: #DDECFD;
    }
  `;
  document.head.appendChild(style);
}

// Создаём и вставляем блок с деталями, если он не существует
function insertDataBlock(api, data) {
  insertStyles();

  // Проверка чтобы не дублировать блок
  if (document.getElementById("car_details")) return;

  const container = document.createElement("div");
  container.id = "car_details";
  container.style = "display: flex; width: 100%; margin-top: 10px;";
  const foxIconUrl = chrome.runtime.getURL("images/fox.png");
  const markIconUrl = chrome.runtime.getURL("images/mark.png");

  // Расширенная разметка с твоими стилями и классами
  container.innerHTML = `
    <div style="width: 100%; display: flex; flex-direction: column; gap: 15px;">
      <div class="block">
        <h3 class="title">🔍 Vehicle Overview</h3>
        <div class="tkl_card">
          <div class="tkl_card-row">
            <div>VIN Code:</div>
            <div id="car_vin" class="tkl_tag">Loading...</div>
          </div>
          <div class="tkl_card-row">
            <div>Seller Type:</div>
            <div id="tkl_car_type" class="tkl_tag">Loading...</div>
          </div>
          <div class="tkl_card-row">
            <div>Reserve Price:</div>
            <div id="tkl_car_price" class="tkl_tag">Loading...</div>
          </div>
          <div class="tkl_card-row">
            <div>Seller Name:</div>
            <div id="tkl_car_seller" class="tkl_tag">Loading...</div>
          </div>
        </div>
      </div>

      <div class="block">
        <h3 class="title">📊 Sales Statistic</h3>
        <div class="tkl_card">
          <table id="sales_table" class="tkl_table">
            <thead>
              <tr>
                <th>Date</th><th>Price</th><th>Status</th>
              </tr>
            </thead>
            <tbody></tbody>
          </table>
        </div>
      </div>

      <div class="tkl_card" style="position: relative; width: 100%;">
        <h3 class="title" style="margin:0 0 10px 0;">📄 Generate a report</h3>
        <div style="display:flex; flex-wrap:wrap; gap: 15px;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <img src="${foxIconUrl}" alt="carfax" >
            <span>Carfax report:</span>
            <span id="car_carfar_report_price" style="margin-left: 8px;"></span>
            <a id="carfax_report_link" class="tkl_report-link" target="_blank" href="#">Buy Report</a>
          </div>
          <div style="display: flex; align-items: center; gap: 10px;">
            <img src="${markIconUrl}" alt="autocheck" >
            <span>Autocheck report:</span>
            <span id="car_autocheck_report_price" style="margin-left: 8px;"></span>
            <a id="autocheck_report_link" class="tkl_report-link" target="_blank" href="#">Buy Report</a>
          </div>
        </div>
      </div>
    </div>
  `;

  // Вставляем блок рядом с нужным элементом в зависимости от api
  let refEl = null;
  if (api === "iaac") {
    const refEl = document.querySelector("#vdActionInfo");
    if (refEl && refEl.parentNode) {
      refEl.parentNode.insertBefore(container, refEl.nextSibling);
    } else {
      document.body.appendChild(container);
    }
  } else if (api === "copart") {
    const parentEl = document.querySelector("#bid-information-id");
    if (parentEl) {
      // Вставляем вторым элементом в контейнер:
      if (parentEl.children.length >= 1) {
        parentEl.insertBefore(container, parentEl.children[1]);
      } else {
        parentEl.appendChild(container);
      }
    } else {
      document.body.appendChild(container);
    }
  } else {
    document.body.appendChild(container);
  }

  fillCarDetails(data);
}

// Заполняем блок данными
function fillCarDetails(data) {
  document.getElementById("car_vin").textContent = data.vin || "-";

  const carTypeEl = document.getElementById("tkl_car_type");
  carTypeEl.textContent = data.seller || "-";
  carTypeEl.style.backgroundColor = "#DDECFD";
  if ((data.seller || "").toLowerCase() === "insurance")
    carTypeEl.style.backgroundColor = "#DFF5E1";
  else if ((data.seller || "").toLowerCase() === "dealer")
    carTypeEl.style.backgroundColor = "#F5DFDF";

  document.getElementById("tkl_car_price").textContent =
    data.seller_reserve_price ? "$" + data.seller_reserve_price : "-";
  document.getElementById("tkl_car_seller").textContent =
    data.seller_name || "-";

  const tbody = document.querySelector("#sales_table tbody");
  tbody.innerHTML = "";
  (data.sales_stats || []).forEach((stat) => {
    const tr = document.createElement("tr");
    let statusColor = "#222";
    const statusLower = (stat.status_message || "").toLowerCase();
    if (statusLower === "sold") statusColor = "#DB3447";
    else if (statusLower === "not sold") statusColor = "#2FA64D";
    tr.innerHTML = `
      <td>${stat.date || "-"}</td>
      <td>$${stat.price || "-"}</td>
      <td><span style="color: ${statusColor}; font-weight: 600;">${
      stat.status_message || "-"
    }</span></td>
    `;
    tbody.appendChild(tr);
  });

  document.getElementById("car_carfar_report_price").textContent =
    data.carfax_price ? "$" + data.carfax_price : "-";
  const carfaxLink = document.getElementById("carfax_report_link");
  carfaxLink.href = data.carfax_report || "#";

  document.getElementById("car_autocheck_report_price").textContent =
    data.autocheck_price ? "$" + data.autocheck_price : "-";
  const autocheckLink = document.getElementById("autocheck_report_link");
  autocheckLink.href = data.autocheck_report || "#";
}

// Основная логика загрузки и вставки данных
function waitForElement(selector, timeout = 10000) {
  return new Promise((resolve, reject) => {
    const el = document.querySelector(selector);
    if (el) {
      resolve(el);
      return;
    }
    const observer = new MutationObserver((mutations, obs) => {
      const el = document.querySelector(selector);
      if (el) {
        obs.disconnect();
        resolve(el);
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });

    setTimeout(() => {
      observer.disconnect();
      reject(new Error(`Timeout waiting for selector: ${selector}`));
    }, timeout);
  });
}

async function loadCarDataOnPage() {
  const url = window.location.href;
  if (
    !/iaai\.com\/VehicleDetail\/\d+/.test(url) &&
    !/copart\.com\/lot\/\d+/.test(url)
  ) {
    console.log("TKL Not a car detail page");
    return;
  }

  function getCarIdAndApi(url) {
    let car_id = null,
      api = null;
    if (/iaai\.com/.test(url)) {
      // const match = url.match(/VehicleDetail\/(\d+)/);
      // if (match) car_id = match[1];
      const idSpan = document.querySelector("span.data-list__value.text-bold");
      car_id = idSpan?.textContent.trim();

      api = "iaac";
      console.log("TKL t car_id", car_id);
    }
    if (/copart\.com/.test(url)) {
      const match = url.match(/lot\/(\d+)/);
      if (match) car_id = match[1];
      api = "copart";
    }
    return { car_id, api };
  }

  const { car_id, api } = getCarIdAndApi(url);
  if (!car_id || !api) {
    console.error("TKL Car ID or API not found");
    return;
  }

  // Ждём появления контейнера для copart
  if (api === "copart") {
    try {
      await waitForElement("#bid-information-id", 10000);
    } catch (e) {
      console.warn(
        "TKL Container #bid-information-id not found in time, inserting at body"
      );
    }
  } else if (api === "iaac") {
    try {
      await waitForElement("#vdActionInfo", 10000);
    } catch (e) {
      console.warn(
        "TKL Container #vdActionInfo not found in time, inserting at body"
      );
    }
  }

  const data = await new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(
      { action: "fetchCarDetails", car_id, api },
      (response) => {
        if (response.error) reject(response.error);
        else resolve(response.data);
      }
    );
  }).catch((err) => {
    console.error("TKL Error fetching car details:", err);
    return null;
  });

  if (!data || data.error) {
    const existingBlock = document.getElementById("car_details");
    if (existingBlock) {
      existingBlock.remove();
      console.log("TKL Removed car_details block due to error or no data");
    }
    return;
  }

  insertDataBlock(api, data);
}

// Запускаем после полной загрузки
window.addEventListener("load", () => {
  loadCarDataOnPage();
});
