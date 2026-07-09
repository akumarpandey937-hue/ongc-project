document.addEventListener("DOMContentLoaded", () => {
    function formatDateTime(date) {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
    }

    const loginForm = document.getElementById("loginForm");
    if (!loginForm) return;

    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const cpfId =
            document.getElementById("cpfId")?.value.trim() ||
            document.getElementById("username")?.value.trim();
        const password =
            document.getElementById("password").value;

        const showError = (msg) => {
            const errorEl = document.getElementById("loginError");
            if (errorEl) {
                errorEl.textContent = msg;
                errorEl.style.display = "block";
            } else {
                alert(msg);
            }
        };

        if (!cpfId || !password) {
            showError("Please enter both CPF ID and password");
            return;
        }

        try {
            const response = await fetch("http://localhost:5000/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ cpfId, password })
            });

            const data = await response.json();

            if (!response.ok) {
                showError(data.message || "Invalid CPF ID or password");
                return;
            }

            // Store session info
            localStorage.setItem("loggedIn", "true");
            localStorage.setItem("token", data.token);
            localStorage.setItem("username", data.username);
            localStorage.setItem("role", data.role);
            localStorage.setItem("loginTime", formatDateTime(new Date()));

            // Redirect based on role
            if (data.role === "admin") {
                window.location.href = "dashboard.html";
            } else {
                window.location.href = "user-dashboard.html";
            }
        } catch (error) {
            console.error("Login Error:", error);
            showError("Unable to connect to the server. Please ensure the backend is running.");
        }
    });
});

function logout() {
    localStorage.removeItem("loggedIn");
    localStorage.removeItem("username");
    localStorage.removeItem("loginTime");
    localStorage.removeItem("role");
    localStorage.removeItem("token");
    window.location.href = "login.html";
}
