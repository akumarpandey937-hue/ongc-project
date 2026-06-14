document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("loginForm");
    if (!loginForm) return;

    loginForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const username =
            document.getElementById("username").value.trim();
        const password =
            document.getElementById("password").value;

        if (username === "admin" && password === "admin123") {
            localStorage.setItem("loggedIn", "true");
            localStorage.setItem("username", username);
            localStorage.setItem("loginTime", new Date().toLocaleString());
            window.location.href = "dashboard.html";
        } else {
            const errorEl = document.getElementById("loginError");
            if (errorEl) {
                errorEl.textContent = "Invalid username or password";
                errorEl.style.display = "block";
            } else {
                alert("Invalid Credentials");
            }
        }
    });
});

function logout() {
    localStorage.removeItem("loggedIn");
    localStorage.removeItem("username");
    localStorage.removeItem("loginTime");
    window.location.href = "login.html";
}
