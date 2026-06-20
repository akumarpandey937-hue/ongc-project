let allSolutions = [];
let selectedCategory = "All";
let searchQuery = "";

document.addEventListener("DOMContentLoaded", () => {
    loadSolutions();

    // Show/Hide Add button based on Admin role
    const role = localStorage.getItem("role") || "guest";
    const isLoggedIn = localStorage.getItem("loggedIn") === "true";
    const addBtn = document.getElementById("addSolutionBtn");
    if (addBtn) {
        if (isLoggedIn && role === "admin") {
            addBtn.style.display = "inline-flex";
        } else {
            addBtn.style.display = "none";
        }
    }

    // Search event
    const searchInput = document.getElementById("solutionSearch");
    if (searchInput) {
        searchInput.addEventListener("input", (e) => {
            searchQuery = e.target.value;
            applyFilters();
        });
    }

    // Category Tabs event
    const tabs = document.querySelectorAll(".category-tab");
    tabs.forEach(tab => {
        tab.addEventListener("click", () => {
            tabs.forEach(t => t.classList.remove("active"));
            tab.classList.add("active");
            selectedCategory = tab.getAttribute("data-category") || "All";
            applyFilters();
        });
    });
});

function applyFilters() {
    const filtered = allSolutions.filter((s) => {
        // Category check
        const matchesCategory = (selectedCategory === "All") ||
            (s.category && s.category.toUpperCase() === selectedCategory.toUpperCase());

        // Search check
        const haystack = [
            s.title,
            s.category,
            s.preview,
            s.author
        ].join(" ").toLowerCase();
        const matchesSearch = haystack.includes(searchQuery.toLowerCase().trim());

        return matchesCategory && matchesSearch;
    });
    renderSolutions(filtered);
}

async function loadSolutions() {
    const tbody = document.getElementById("solutionTableBody");
    if (!tbody) return;

    try {
        allSolutions = await getSolutions();
        renderSolutions(allSolutions);
    } catch (error) {
        console.error("Failed to load solutions:", error);
        tbody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align:center;padding:20px;">
                    Could not load solutions. Is the backend running on port 5000?
                </td>
            </tr>
        `;
    }
}

function renderSolutions(solutions) {
    const tbody = document.getElementById("solutionTableBody");
    if (!tbody) return;

    tbody.innerHTML = "";

    if (!solutions || solutions.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align:center;padding:20px;">
                    No solutions found
                </td>
            </tr>
        `;
        return;
    }

    solutions.forEach((solution) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${solution.id}</td>
            <td>
                <span class="category-badge">${solution.category}</span>
            </td>
            <td>${escapeHtml(solution.title)}</td>
            <td>${escapeHtml(solution.preview || "")}</td>
            <td>
                <button class="open-btn" data-id="${solution.id}">
                    Open
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });

    tbody.querySelectorAll(".open-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
            openSolution(btn.getAttribute("data-id"));
        });
    });
}

function openSolution(id) {
    window.location.href = `view-ticket.html?id=${id}`;
}

function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}
