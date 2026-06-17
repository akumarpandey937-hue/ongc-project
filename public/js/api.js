const API_BASE_URL = "http://localhost:5000/api";

async function apiRequest(path, options = {}) {
    const token = localStorage.getItem("token");
    const headers = {
        "Content-Type": "application/json",
        ...(options.headers || {})
    };

    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${path}`, {
        headers,
        ...options
    });

    if (response.status === 401 || response.status === 403) {
        localStorage.removeItem("loggedIn");
        localStorage.removeItem("username");
        localStorage.removeItem("loginTime");
        localStorage.removeItem("role");
        localStorage.removeItem("token");
        window.location.href = "login.html";
        throw new Error("Session expired. Please log in again.");
    }

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(
            data.message || `Request failed (${response.status})`
        );
    }

    return data;
}

async function getDashboardStats() {
    return apiRequest("/dashboard/stats");
}

async function getTickets() {
    return apiRequest("/tickets");
}

async function getTicket(id) {
    return apiRequest(`/tickets/${id}`);
}

async function createTicket(ticket) {
    return apiRequest("/tickets", {
        method: "POST",
        body: JSON.stringify(ticket)
    });
}

async function updateTicket(id, updates) {
    return apiRequest(`/tickets/${id}`, {
        method: "PATCH",
        body: JSON.stringify(updates)
    });
}

async function deleteTicket(id) {
    return apiRequest(`/tickets/${id}`, {
        method: "DELETE"
    });
}

async function getSolutions() {
    return apiRequest("/solutions");
}

async function getSolution(id) {
    return apiRequest(`/solutions/${id}`);
}

async function createSolution(solution) {
    return apiRequest("/solutions", {
        method: "POST",
        body: JSON.stringify(solution)
    });
}

async function deleteSolution(id) {
    return apiRequest(`/solutions/${id}`, {
        method: "DELETE"
    });
}
