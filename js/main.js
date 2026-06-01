const PUBLIC_PAGES = ["login.html"];

function getCurrentPage() {
    const path = window.location.pathname;
    const page = path.split("/").pop();
    return page || "index.html";
}

function requireAuth() {
    const page = getCurrentPage();
    const isLoggedIn =
        localStorage.getItem("loggedIn") === "true";

    if (PUBLIC_PAGES.includes(page)) {
        if (isLoggedIn) {
            window.location.href = "dashboard.html";
        }
        return;
    }

    if (!isLoggedIn) {
        window.location.href = "login.html";
    }
}

requireAuth();

document.addEventListener("DOMContentLoaded", () => {
    const username =
        localStorage.getItem("username") || "admin";

    const userId = document.getElementById("userId");
    const sessionUser = document.getElementById("sessionUser");
    const userName = document.getElementById("userName");

    if (userId) userId.textContent = username;
    if (sessionUser) sessionUser.textContent = username;
    if (userName) userName.textContent = username;

    document
        .querySelectorAll(".logout-btn, #logoutBtn")
        .forEach((btn) => {
            btn.addEventListener("click", (e) => {
                e.preventDefault();
                logout();
            });
        });
});

function logout() {
    localStorage.removeItem("loggedIn");
    localStorage.removeItem("username");
    window.location.href = "login.html";
}
