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

// Эту функцию можешь заменить на вызов в background через chrome.runtime.sendMessage для обхода CORS
function fetchExtraInfoViaBackground(ids) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(
      {
        action: "fetchExtraInfo",
        url: `https://carfaxshara.com/api/extension/copart/sellers/types/`,
        ids,
      },
      (response) => {
        if (response.error) reject(response.error);
        else resolve(response.data);
      }
    );
  });
}
function insertCustomLiToLists(extraInfo) {
  document.querySelectorAll("ul.data-list.data-list--search").forEach((ul) => {
    const firstLi = ul.querySelector("li.data-list__item");
    if (!firstLi) return;

    if (ul.querySelector("li.extra-duplicate-block")) return; // чтобы не дублировалось

    const stockSpan = firstLi.querySelector("span.data-list__value");
    if (!stockSpan) return;

    const stockNumber = stockSpan.textContent.trim();

    const infoText = extraInfo[stockNumber] || "Not found";

    const newLi = document.createElement("li");
    newLi.classList.add("data-list__item", "extra-duplicate-block");

    // Применяем стили из dupBlock
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

(async () => {
  console.log("ExTKL: Waiting for iaai lot rows...");
  if (!/iaai\.com/.test(window.location.hostname)) {
    console.log("ExTKL: Not copart domain — stopping script");
    return;
  }

  try {
    await waitForElement(".table-row.table-row-border");
    console.log("ExTKL: iaai lot rows found, starting processing");

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

      // await здесь, чтобы дождаться результата API
      const extraInfo = await fetchExtraInfoViaBackground(uniqueIds);
      insertCustomLiToLists(extraInfo);

      // rows.forEach((row) => {
      //   if (row.querySelector(".extra-duplicate-block")) return;

      //   const firstValueSpan = row.querySelector("span.data-list__value");
      //   if (!firstValueSpan) return;

      //   const stockNumber = firstValueSpan.textContent.trim();

      //   const dupBlock = document.createElement("div");
      //   dupBlock.classList.add("table-cell", "extra-duplicate-block");
      //   dupBlock.style.padding = "10px";
      //   dupBlock.style.marginTop = "8px";
      //   dupBlock.style.borderRadius = "25px";
      //   dupBlock.style.fontWeight = "700";
      //   dupBlock.style.width = "max-content";
      //   dupBlock.style.color = "#222";

      //   const infoText = extraInfo[stockNumber] || "Not found";
      //   dupBlock.textContent = infoText;

      //   const textLower = infoText.toLowerCase();
      //   if (textLower === "insurance") {
      //     dupBlock.style.backgroundColor = "#DFF5E1";
      //   } else if (textLower === "dealer") {
      //     dupBlock.style.backgroundColor = "#F5DFDF";
      //   } else {
      //     dupBlock.style.backgroundColor = "#DDECFD";
      //   }

      //   const containerCell = firstValueSpan.closest(".table-cell");
      //   if (containerCell) {
      //     containerCell.parentNode.insertBefore(
      //       dupBlock,
      //       containerCell.nextSibling
      //     );
      //   }
      // });
    }

    await updateBlocksWithApi();

    const tableBody =
      document.querySelector("tbody") ||
      document.querySelector(".table-row.table-row-border").parentNode;

    let updateTimeout = null;
    const observer = new MutationObserver(() => {
      if (updateTimeout) clearTimeout(updateTimeout);
      updateTimeout = setTimeout(() => {
        updateBlocksWithApi().catch(console.error);
      }, 500);
    });

    observer.observe(tableBody, { childList: true, subtree: true });

    console.log("ExTKL: MutationObserver started for iaai lot list");
  } catch (e) {
    console.error("ExTKL: Error in iaai script", e);
  }
})();
