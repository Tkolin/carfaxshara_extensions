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

function fetchExtraInfoViaBackground(ids) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(
      {
        action: "fetchExtraInfo",
        url: `https://carfaxshara.com/api/extension/copart/sellers/types/`,
        ids,
      },
      (response) => {
        if (!response || response.error)
          reject(response?.error || "Empty response");
        else resolve(response.data || {});
      }
    );
  });
}

// Основная функция обновления блоков
async function updateBlocksWithApi() {
  // Находим все лоты
  const lotBlocks = document.querySelectorAll(
    "td .search_result_lot_detail_block"
  );
  const ids = [];

  lotBlocks.forEach((lotBlock) => {
    const lotLink = lotBlock.querySelector('a[href^="/lot/"]');
    if (!lotLink) return;
    const href = lotLink.getAttribute("href");
    const match = href.match(/\/lot\/(\d+)/);
    if (match) ids.push(Number(match[1]));
  });

  if (ids.length === 0) {
    console.log("ExTKL: No lot IDs found, skipping API call");
    return;
  }

  const uniqueIds = [...new Set(ids)];
  console.log("ExTKL: Fetching info for IDs", uniqueIds);

  try {
    const extraInfo = await fetchExtraInfoViaBackground(uniqueIds);

    lotBlocks.forEach((lotBlock) => {
      const lotLink = lotBlock.querySelector('a[href^="/lot/"]');
      if (!lotLink) return;
      const href = lotLink.getAttribute("href");
      const match = href.match(/\/lot\/(\d+)/);
      if (!match) return;
      const lotId = match[1];

      let infoDiv = lotBlock.parentNode.querySelector(".extra-info-tag");
      if (!infoDiv) {
        infoDiv = document.createElement("div");
        infoDiv.classList.add("extra-info-tag");
        infoDiv.style.color = "#222";
        infoDiv.style.padding = "5px 18px";
        infoDiv.style.marginTop = "6px";
        infoDiv.style.borderRadius = "25px";
        infoDiv.style.fontWeight = "700";
        infoDiv.style.width = "max-content";
        lotBlock.parentNode.insertBefore(infoDiv, lotBlock.nextSibling);
      }

      const infoText = extraInfo[lotId] || "Not found";
      infoDiv.textContent = infoText;

      const textLower = infoText.toLowerCase();
      if (textLower === "insurance") {
        infoDiv.style.backgroundColor = "#DFF5E1";
      } else if (textLower === "dealer") {
        infoDiv.style.backgroundColor = "#F5DFDF";
      } else {
        infoDiv.style.backgroundColor = "#DDECFD";
      }
    });
  } catch (err) {
    console.error("ExTKL: API fetch error", err);
  }
}

// Инициализация
async function initScript() {
  if (!/copart\.com/.test(window.location.hostname)) {
    console.log("ExTKL: Not copart domain — stopping script");
    return;
  }

  try {
    const tableContainer = await waitForElement("table");
    console.log("ExTKL: Table container found, starting observer");

    await updateBlocksWithApi();

    let updateTimeout = null;
    const observer = new MutationObserver(() => {
      clearTimeout(updateTimeout);
      updateTimeout = setTimeout(() => {
        updateBlocksWithApi().catch(console.error);
      }, 500);
    });
    observer.observe(tableContainer, { childList: true, subtree: true });

    console.log("ExTKL: MutationObserver started");
  } catch (e) {
    console.error("ExTKL: Error waiting for table container", e);
  }
}

// Следим за сменой URL (SPA-навигация)
let lastUrl = location.href;
new MutationObserver(() => {
  if (location.href !== lastUrl) {
    lastUrl = location.href;
    console.log("ExTKL: URL changed -> reinit");
    initScript();
  }
}).observe(document.body, { childList: true, subtree: true });

// Первый запуск
initScript();
