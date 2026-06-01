let allSolutions = [];

document.addEventListener("DOMContentLoaded", () => {
    loadSolutions();

    const searchInput =
        document.getElementById("solutionSearch");

    if (searchInput) {
        searchInput.addEventListener("input", (e) => {
            const query = e.target.value.toLowerCase().trim();
            const filtered = allSolutions.filter((s) => {
                const haystack = [
                    s.title,
                    s.category,
                    s.preview,
                    s.author
                ]
                    .join(" ")
                    .toLowerCase();
                return haystack.includes(query);
            });
            renderSolutions(filtered);
        });
    }
});

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
                <td colspan="7" style="text-align:center;padding:20px;">
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
                <td colspan="7" style="text-align:center;padding:20px;">
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
            <td>${escapeHtml(solution.author || "-")}</td>
            <td>${solution.date || "-"}</td>
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
