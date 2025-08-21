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

  const res = await fetch("https://vinscan.online/account_info/get_me", {
    method: "POST",
    credentials: "include", // кука token уйдёт автоматически
    body: form,
  });
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
  // document.getElementById("username").textContent = user?.data?.login;
  document.getElementById("deposit").textContent = user?.Balance || 0;

})();
//
