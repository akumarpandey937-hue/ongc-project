let allTickets = [];
let liveClockInterval = null;

document.addEventListener(
    "DOMContentLoaded",
    initializeDashboard
);

function formatDateTime(date) {
    return date.toLocaleString();
}

function startLiveClock() {
    const liveElement = document.getElementById("liveTime");
    if (!liveElement) return;

    const tick = () => {
        liveElement.textContent = formatDateTime(new Date());
    };

    tick();

    if (liveClockInterval) {
        clearInterval(liveClockInterval);
    }

    liveClockInterval = setInterval(tick, 1000);
}

async function initializeDashboard() {
    startLiveClock();
    bindFilters();

    try {
        const stats = await getDashboardStats();

        setText("totalTickets", stats.totalTickets);
        setText("openTickets", stats.openTickets);
        setText(
            "inProgressTickets",
            stats.inProgressTickets || stats.inProgress || 0
        );

        allTickets = await getTickets();
        populateFilters(allTickets);
        renderTickets(allTickets);
    } catch (error) {
        console.error("Dashboard Error:", error);
        const tableBody = document.getElementById("ticketTableBody");
        if (tableBody) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align:center;padding:20px;">
                        Could not load dashboard. Start the backend: cd backend && npm start
                    </td>
                </tr>
            `;
        }
    }
}

function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value ?? 0;
}

function populateFilters(tickets) {
    fillSelect("statusFilter", uniqueValues(tickets, "status"));
    fillSelect("priorityFilter", uniqueValues(tickets, "priority"));
    fillSelect("categoryFilter", uniqueValues(tickets, "category"));
}

function uniqueValues(items, key) {
    return [...new Set(items.map((i) => i[key]).filter(Boolean))];
}

function fillSelect(id, values) {
    const select = document.getElementById(id);
    if (!select) return;

    const firstOption = select.options[0];
    select.innerHTML = "";
    select.appendChild(firstOption);

    values.forEach((value) => {
        const option = document.createElement("option");
        option.value = value;
        option.textContent = value;
        select.appendChild(option);
    });
}

function bindFilters() {
    const filterIds = [
        "statusFilter",
        "priorityFilter",
        "categoryFilter"
    ];

    filterIds.forEach((id) => {
        const el = document.getElementById(id);
        if (el) el.addEventListener("change", applyFilters);
    });

    const search = document.getElementById("ticketSearch");
    if (search) search.addEventListener("input", applyFilters);
}

function applyFilters() {
    const status = document.getElementById("statusFilter")?.value || "";
    const priority =
        document.getElementById("priorityFilter")?.value || "";
    const category =
        document.getElementById("categoryFilter")?.value || "";
    const search = (
        document.getElementById("ticketSearch")?.value || ""
    ).toLowerCase();

    const filtered = allTickets.filter((ticket) => {
        if (status && ticket.status !== status) return false;
        if (priority && ticket.priority !== priority) return false;
        if (category && ticket.category !== category) return false;

        if (search) {
            const haystack = [
                ticket.id,
                ticket.status,
                ticket.priority,
                ticket.subject,
                ticket.category
            ]
                .join(" ")
                .toLowerCase();
            if (!haystack.includes(search)) return false;
        }

        return true;
    });

    renderTickets(filtered);
}

function renderTickets(tickets) {
    const tableBody = document.getElementById("ticketTableBody");
    if (!tableBody) return;

    tableBody.innerHTML = "";

    if (!tickets || tickets.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align:center;padding:20px;">
                    No tickets found
                </td>
            </tr>
        `;
        return;
    }

    tickets.forEach((ticket) => {
        const statusClass = getStatusClass(ticket.status);

        tableBody.innerHTML += `
            <tr>
                <td>#${ticket.id}</td>
                <td><span class="badge ${statusClass}">${ticket.status || "-"}</span></td>
                <td>${ticket.priority || "-"}</td>
                <td>${escapeHtml(ticket.subject || "-")}</td>
                <td>${ticket.category || "-"}</td>
                <td>
                    <a href="ticket-details.html?id=${ticket.id}" class="btn btn-secondary" style="padding: 6px 12px; font-size: 13px; text-decoration: none;">
                        View & Reply
                    </a>
                </td>
            </tr>
        `;
    });
}

function getStatusClass(status) {
    if (status === "Open") return "badge-open";
    if (status === "In Progress") return "badge-progress";
    if (status === "Closed") return "badge-closed";
    return "";
}

function getSlaClass(sla) {
    const value = (sla || "").toLowerCase();
    if (value.includes("breach") && !value.includes("within")) {
        return "badge-danger";
    }
    if (value.includes("near")) return "badge-warning";
    return "badge-ok";
}

function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}
