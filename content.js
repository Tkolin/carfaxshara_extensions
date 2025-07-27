// content.js
chrome.runtime.onMessage.addListener((req, sender, sendResponse) => {
  console.log("start");
  if (req.action === "getCatalogCars") {
    let cards = [];
    if (location.hostname.includes("iaai.com")) {
      document.querySelectorAll(".js-intro-result-table").forEach((card) => {
        let img = card.querySelector(".table-cell--image img")?.src || "";
        let name =
          card.querySelector(".table-cell--heading a")?.textContent.trim() ||
          "";
        let lotHref =
          card.querySelector(".table-cell--heading a")?.getAttribute("href") ||
          "";
        let idMatch = lotHref.match(/\/VehicleDetail\/(\d+)/);
        let id = idMatch ? idMatch[1] : "";
        if (id) cards.push({ id, img, name });
      });
    }
    if (location.hostname.includes("copart.com")) {
      document
        .querySelectorAll(
          "tr[data-lotnumber], tr[data-lot-id], tr[data-lot_id]"
        )
        .forEach((tr) => {
          let img = tr.querySelector("img")?.src || "";
          let id =
            tr.getAttribute("data-lotnumber") ||
            tr.getAttribute("data-lot-id") ||
            tr.getAttribute("data-lot_id");
          let name =
            tr
              .querySelector(".search_result_lot_detail, .ng-star-inserted")
              ?.textContent.trim() || "";
          if (id && img) cards.push({ id, img, name });
        });
    }
    sendResponse({ cars: cards });
  }
  return true;
});
