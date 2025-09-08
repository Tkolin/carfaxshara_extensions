(() => {
  function waitForElement(selector, timeout = 10000) {
    return new Promise((resolve, reject) => {
      const intervalTime = 300;
      let elapsedTime = 0;
      const interval = setInterval(() => {
        const el = document.querySelector(selector);
        if (el) {
          clearInterval(interval);
          resolve(el);
        } else {
          elapsedTime += intervalTime;
          if (elapsedTime >= timeout) {
            clearInterval(interval);
            reject(new Error(`Timeout waiting for selector: ${selector}`));
          }
        }
      }, intervalTime);
    });
  }

  // Вызов API через background (чтобы обойти CORS)
  function fetchExtraInfoViaBackground(ids) {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(
        {
          action: "fetchExtraInfo",
          url: `https://carfaxshara.com/api/extension/copart/sellers/types/`,
          ids,
        },
        (response) => {
          if (!response || response.error) {
            reject(response?.error || "Empty response");
          } else {
            resolve(response.data || {});
          }
        }
      );
    });
  }

  // Вставляем блоки с данными
  function insertCustomLiToLists(extraInfo) {
    document
      .querySelectorAll("ul.data-list.data-list--search")
      .forEach((ul) => {
        const firstLi = ul.querySelector("li.data-list__item");
        if (!firstLi) return;

        if (ul.querySelector("li.extra-duplicate-block")) return; // не дублировать

        const stockSpan = firstLi.querySelector("span.data-list__value");
        if (!stockSpan) return;

        const stockNumber = stockSpan.textContent.trim();
        const infoText = extraInfo[stockNumber] || "Not found";

        const newLi = document.createElement("li");
        newLi.classList.add("data-list__item", "extra-duplicate-block");
        newLi.style.padding = "5px 18px";
        newLi.style.marginTop = "8px";
        newLi.style.borderRadius = "18px";
        newLi.style.fontWeight = "700";
        newLi.style.width = "max-content";
        newLi.style.color = "#222";

        const textLower = infoText.toLowerCase();
        if (textLower === "insurance") {
          newLi.style.backgroundColor = "#DFF5E1";
        } else if (textLower === "dealer") {
          newLi.style.backgroundColor = "#F5DFDF";
        } else {
          newLi.style.backgroundColor = "#DDECFD";
        }

        newLi.textContent = infoText;

        if (firstLi.nextSibling) {
          ul.insertBefore(newLi, firstLi.nextSibling);
        } else {
          ul.appendChild(newLi);
        }
      });
  }

  // Основная функция
  async function updateBlocksWithApi() {
    const rows = document.querySelectorAll(".table-row.table-row-border");
    const ids = [];

    rows.forEach((row) => {
      const firstValueSpan = row.querySelector("span.data-list__value");
      if (!firstValueSpan) return;
      const stockNumber = firstValueSpan.textContent.trim();
      const idNum = Number(stockNumber);
      if (idNum) ids.push(idNum);
    });

    if (ids.length === 0) {
      console.log("ExTKL: No IDs found on iaai page, skipping API call");
      return;
    }

    const uniqueIds = [...new Set(ids)];
    console.log("ExTKL: Fetching info for IDs", uniqueIds);

    try {
      const extraInfo = await fetchExtraInfoViaBackground(uniqueIds);
      insertCustomLiToLists(extraInfo);
    } catch (err) {
      console.error("ExTKL: API fetch error", err);
    }
  }

  // Инициализация на странице
  async function initScript() {
    if (!/iaai\.com/.test(window.location.hostname)) {
      console.log("ExTKL: Not iaai domain — stopping script");
      return;
    }

    try {
      await waitForElement(".table-row.table-row-border");
      console.log("ExTKL: iaai lot rows found, starting processing");
      await updateBlocksWithApi();

      const tableBody =
        document.querySelector("tbody") ||
        document.querySelector(".table-row.table-row-border")?.parentNode;

      if (tableBody) {
        let updateTimeout = null;
        const observer = new MutationObserver(() => {
          clearTimeout(updateTimeout);
          updateTimeout = setTimeout(() => {
            updateBlocksWithApi().catch(console.error);
          }, 500);
        });
        observer.observe(tableBody, { childList: true, subtree: true });
        console.log("ExTKL: MutationObserver started for iaai lot list");
      }
    } catch (e) {
      console.error("ExTKL: Error in iaai script", e);
    }
  }

  let lastUrl = location.href;
  new MutationObserver(() => {
    if (location.href !== lastUrl) {
      lastUrl = location.href;
      console.log("ExTKL: URL changed -> reinit");
      initScript();
    }
  }).observe(document.body, { childList: true, subtree: true });

  initScript();
})();
