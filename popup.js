function getTokenFromCookie() {
  return new Promise((resolve) => {
    chrome.cookies.get(
      {
        url: "https://carfaxshara.com",
        name: "token",
      },
      (cookie) => {
        if (cookie && cookie.value) resolve(cookie.value);
        else resolve(null);
      }
    );
  });
}

async function fetchUserProfile() {
  const token = await getTokenFromCookie();
  if (!token) return null; // Не авторизован!

  const form = new FormData();
  form.append("token", token);

  const res = await fetch(
    "https://carfaxshara.com/bot/site.php?action=getUser",
    {
      method: "POST",
      credentials: "include", // кука token уйдёт автоматически
      body: form,
    }
  );
  if (!res.ok) return null;
  const user = await res.json();
  // Можно проверить, что user.id существует (или другой признак)
  return user;
}

(async () => {
  // Сначала проверяем пользователя!
  const user = await fetchUserProfile();
  if (!user) {
    // Не авторизован — переводим на страницу логина
    window.location.href = "login.html";
    return;
  }
  document.getElementById("username").textContent = user?.data?.login;
  document.getElementById("deposit").textContent = user?.data?.deposit;
  document.getElementById("avatar").src =
    user?.data?.avatar || "images/user.svg";
})();
//

const menu = document.getElementById("menu");
const menuBtn = document.getElementById("menu_btn");
const body = document.body;

menuBtn.onclick = () => {
  if (menu.style.display === "flex") {
    // Скрыть меню
    menu.style.opacity = "0";
    setTimeout(() => (menu.style.display = "none"), 260);
    // Вернуть цвет body и кнопки в дефолт
    body.style.color = "black"; // белый текст
    menuBtn.style.background = "#FCFFFE"; // дефолтная кнопка
    menuBtn.style.color = "black"; // дефолтный цвет иконки
  } else {
    // Показать меню
    menu.style.display = "flex";
    setTimeout(() => (menu.style.opacity = "1"), 10);
    // Сменить цвет body и кнопки
    body.style.color = "#fff";
    menuBtn.style.background = "#6C63FF"; // выделяем кнопку
    menuBtn.style.color = "#fff";
  }
};
