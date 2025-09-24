(() => {
  function insertStyles() {
    if (document.getElementById("car-details-styles")) {
      console.log("TKL: Styles already inserted");
      return;
    }
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
    console.log("TKL: Styles inserted");
  }

  function insertDataBlock(api, data) {
    insertStyles();

    if (document.getElementById("car_details")) {
      console.log("TKL: car_details block already exists, skipping insert");
      return;
    }

    console.log("TKL: Inserting car_details block for API:", api);

    const container = document.createElement("div");
    container.id = "car_details";
    container.style = "display: flex; width: 100%; margin-top: 10px;";

    const foxIconUrl = chrome.runtime.getURL("images/fox.png");
    const markIconUrl = chrome.runtime.getURL("images/mark.png");

    container.innerHTML = `
      <div style="width: 100%; display: flex; flex-direction: column; gap: 15px;">
        <div class="block">
          <h3 class="title">🔍 Vehicle Overview</h3>
          <div class="tkl_card">
            <div class="tkl_card-row"><div>VIN Code:</div><div id="car_vin" class="tkl_tag">Loading...</div></div>
            <div class="tkl_card-row"><div>Seller Type:</div><div id="tkl_car_type" class="tkl_tag">Loading...</div></div>
            <div class="tkl_card-row"><div>Reserve Price:</div><div id="tkl_car_price" class="tkl_tag">Loading...</div></div>
            <div class="tkl_card-row"><div>Seller Name:</div><div id="tkl_car_seller" class="tkl_tag">Loading...</div></div>
          </div>
        </div>
        <div class="block">
          <h3 class="title">📊 Sales Statistic</h3>
          <div class="tkl_card">
            <table id="sales_table" class="tkl_table">
              <thead><tr><th>Date</th><th>Price</th><th>Status</th></tr></thead>
              <tbody></tbody>
            </table>
          </div>
        </div>
        <div class="tkl_card" style="position: relative; width: 100%;">
          <h3 class="title" style="margin:0 0 10px 0;">📄 Generate a report</h3>
          <div style="display:flex; flex-wrap:wrap; gap: 15px;">
            <div style="display: flex; align-items: center; gap: 10px;">
              <img src="${foxIconUrl}" alt="carfax"><span>Carfax report:</span>
              <span id="car_carfar_report_price" style="margin-left: 8px;"></span>
              <a id="carfax_report_link" class="tkl_report-link" target="_blank" href="#">Buy Report</a>
            </div>
            <div style="display: flex; align-items: center; gap: 10px;">
              <img src="${markIconUrl}" alt="autocheck"><span>Autocheck report:</span>
              <span id="car_autocheck_report_price" style="margin-left: 8px;"></span>
              <a id="autocheck_report_link" class="tkl_report-link" target="_blank" href="#">Buy Report</a>
            </div>
          </div>
        </div>
      </div>
    `;

    if (api === "iaac") {
      const refEl = document.querySelector("#vdActionInfo");
      if (refEl?.parentNode) {
        refEl.parentNode.insertBefore(container, refEl.nextSibling);
        console.log("TKL: Block inserted after #vdActionInfo");
      } else {
        document.body.appendChild(container);
        console.warn("TKL: #vdActionInfo not found, appended to body");
      }
    } else if (api === "copart") {
      let parentEl = document.querySelector("#bid-information-id");
      if (!parentEl) {
        console.warn(
          "TKL: #bid-information-id not found, search .bid-info-marketing-container"
        );
        parentEl = document.querySelector(".bid-info-marketing-container");
      }
      if (parentEl) {
        if (parentEl.children.length >= 1) {
          parentEl.insertBefore(container, parentEl.children[1]);
          console.log("TKL: Block inserted inside #bid-information-id");
        } else {
          parentEl.appendChild(container);
          console.log("TKL: Block appended inside #bid-information-id");
        }
      } else {
        // document.body.appendChild(container);
        console.warn(
          "TKL: #bid-information-id and .bid-info-marketing-container not found, appended to body"
        );
      }
    } else {
      // document.body.appendChild(container);
      console.warn("TKL: API not matched, appended to body");
    }

    fillCarDetails(data);
  }

  function fillCarDetails(data) {
    console.log("TKL: Filling car details with data:", data);

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
    document.getElementById("carfax_report_link").href =
      data.carfax_report || "#";

    document.getElementById("car_autocheck_report_price").textContent =
      data.autocheck_price ? "$" + data.autocheck_price : "-";
    document.getElementById("autocheck_report_link").href =
      data.autocheck_report || "#";
  }

  function waitForElement(selector, timeout = 10000) {
    return new Promise((resolve, reject) => {
      const el = document.querySelector(selector);
      if (el) {
        console.log("TKL: Found element immediately:", selector);
        resolve(el);
        return;
      }
      const observer = new MutationObserver(() => {
        const el = document.querySelector(selector);
        if (el) {
          console.log("TKL: Found element later:", selector);
          observer.disconnect();
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
  async function waitWithRetries(selector, retries = 3, delay = 2000) {
    for (let i = 0; i < retries; i++) {
      try {
        const el = await waitForElement(selector, 5000); // ждём до 5с
        return el;
      } catch (e) {
        console.warn(`TKL: ${selector} not found, retry ${i + 1}/${retries}`);
        await new Promise((r) => setTimeout(r, delay));
      }
    }
    return null;
  }
  function waitAny(selectors, timeout = 10000) {
    return new Promise((resolve, reject) => {
      let resolved = false;
      const observers = [];

      function done(el) {
        if (resolved) return;
        resolved = true;
        observers.forEach((o) => o.disconnect());
        resolve(el);
      }

      selectors.forEach((selector) => {
        const el = document.querySelector(selector);
        if (el) {
          done(el);
          return;
        }
        const observer = new MutationObserver(() => {
          const el = document.querySelector(selector);
          if (el) {
            console.log("TKL: Found element:", selector);
            done(el);
          }
        });
        observer.observe(document.body, { childList: true, subtree: true });
        observers.push(observer);
      });

      setTimeout(() => {
        if (!resolved) {
          observers.forEach((o) => o.disconnect());
          reject(
            new Error("Timeout waiting for any of: " + selectors.join(", "))
          );
        }
      }, timeout);
    });
  }

  async function loadCarDataOnPage() {
    const url = window.location.href;
    if (
      !/iaai\.com\/VehicleDetail\/\d+/.test(url) &&
      !/copart\.com\/lot\/\d+/.test(url)
    ) {
      console.log("TKL: Not a car detail page");
      return;
    }

    console.log("TKL: Detected car detail page:", url);

    function getCarIdAndApi(url) {
      let car_id = null,
        api = null;
      if (/iaai\.com/.test(url)) {
        const idSpan = document.querySelector(
          "span.data-list__value.text-bold"
        );
        car_id = idSpan?.textContent.trim();
        api = "iaac";
        console.log("TKL: IAAI car_id:", car_id);
      }
      if (/copart\.com/.test(url)) {
        const match = url.match(/lot\/(\d+)/);
        if (match) car_id = match[1];
        api = "copart";
        console.log("TKL: Copart car_id:", car_id);
      }
      return { car_id, api };
    }

    const { car_id, api } = getCarIdAndApi(url);
    if (!car_id || !api) {
      console.error("TKL: Car ID or API not found");
      return;
    }

    if (api === "copart") {
      try {
        const el = await waitAny(
          ["#bid-information-id", ".bid-info-marketing-container"],
          10000
        );
        console.log("TKL: Found element for copart:", el);
      } catch (e) {
        console.warn("TKL: Neither selector found:", e);
      }
    } else if (api === "iaac") {
      const el = await waitWithRetries("#vdActionInfo", 3, 2000);
      if (!el) {
        console.warn("TKL: #vdActionInfo not found after retries");
        return;
      }
    }

    console.log("TKL: Fetching car details for", car_id, "via", api);

    const data = await new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(
        { action: "fetchCarDetails", car_id, api },
        (response) => {
          if (response.error) reject(response.error);
          else resolve(response.data);
        }
      );
    }).catch((err) => {
      console.error("TKL: Error fetching car details:", err);
      return null;
    });

    if (!data || data.error) {
      const existingBlock = document.getElementById("car_details");
      if (existingBlock) {
        existingBlock.remove();
        console.log("TKL: Removed car_details block due to error/no data");
      }
      return;
    }

    insertDataBlock(api, data);
  }

  window.addEventListener("load", () => {
    console.log("TKL: Window loaded, running loadCarDataOnPage");
    loadCarDataOnPage();
  });

  let lastUrl = location.href;
  new MutationObserver(() => {
    const url = location.href;
    if (url !== lastUrl) {
      console.log("TKL: URL changed from", lastUrl, "to", url);
      lastUrl = url;
      loadCarDataOnPage();
    }
  }).observe(document, { subtree: true, childList: true });

  console.log("TKL: Script initialized");
})();
