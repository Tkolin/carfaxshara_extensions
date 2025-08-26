const cache = new Map();

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "fetchCarDetails" && request.car_id && request.api) {
    // const mockData = {
    //   carfax_report: "https://carfax.com/report",
    //   autocheck_report: "https://autocheck.com/",
    //   carfax_price: 3,
    //   autocheck_price: 2,
    //   vin: "WAUJ8GFF3J1075365",
    //   seller: "insurance",
    //   seller_reserve_price: null,
    //   seller_name: "ALLSTATE INSURANCE COMPANY",
    //   sales_stats: [
    //     { date: "2021-07-27", price: "12700", status_message: "Sold" },
    //     { date: "2021-07-27", price: "12700", status_message: "Sold" },
    //   ],
    // };

    // // Возвращаем мок сразу, без fetch
    // sendResponse({ data: mockData });
    // return true;
    const url = `https://vinscan.online/api/extension/${request.api}/detailed/`;

    fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify({ car_id: Number(request.car_id) }),
    })
      .then((resp) => {
        if (!resp.ok) {
          // Пробрасываем ошибку с кодом статуса
          throw new Error(`HTTP error! status: ${resp.status}`);
        }
        return resp.json();
      })
      .then((data) => {
        sendResponse({ data });
      })
      .catch((err) => {
        sendResponse({ error: err.toString() });
      });

    return true; // async response
  }
  if (request.action === "fetchExtraInfo") {
    if (request?.ids?.length > 0) {
      // Ключ кеша — отсортированный JSON массива id
      const sortedIds = [...request.ids].sort((a, b) => a - b);
      const cacheKey = JSON.stringify(sortedIds);

      if (cache.has(cacheKey)) {
        // Возвращаем кешированное сразу
        sendResponse({ data: cache.get(cacheKey), cached: true });
        return true;
      }

      fetch(request.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          accept: "application/json",
        },
        body: JSON.stringify({ ids: sortedIds }),
      })
        .then((resp) => resp.json())
        .then((data) => {
          cache.set(cacheKey, data);
          sendResponse({ data });
        })
        .catch((err) => sendResponse({ error: err.toString() }));

      return true; // async response
    }
  }
});
