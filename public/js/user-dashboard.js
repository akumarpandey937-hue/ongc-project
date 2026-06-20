let userTickets = [];
let liveClockInterval = null;

document.addEventListener("DOMContentLoaded", initializeDashboard);

function formatDateTime(date) {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    
    return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
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

    const username = localStorage.getItem("username") || "User";

    try {
        const allTickets = await getTickets();
        
        // Filter tickets raised by the current user
        userTickets = allTickets.filter(
            t => (t.raisedBy || "").toLowerCase() === username.toLowerCase()
        );

        updateStats(userTickets);
        populateFilters(userTickets);
        renderTickets(userTickets);
    } catch (error) {
        console.error("User Dashboard Error:", error);
        const tableBody = document.getElementById("ticketTableBody");
        if (tableBody) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="10" style="text-align:center;padding:20px;color:red;">
                        Could not load your tickets. Start the backend: cd backend && npm start
                    </td>
                </tr>
            `;
        }
    }
}

function updateStats(tickets) {
    const total = tickets.length;
    const open = tickets.filter(t => t.status === "Open").length;
    const progress = tickets.filter(t => t.status === "In Progress").length;
    const closed = tickets.filter(t => t.status === "Closed" || t.status === "Resolved").length;

    setText("totalTickets", total);
    setText("openTickets", open);
    setText("inProgressTickets", progress);
    setText("closedTickets", closed);
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
    const priority = document.getElementById("priorityFilter")?.value || "";
    const category = document.getElementById("categoryFilter")?.value || "";
    const search = (
        document.getElementById("ticketSearch")?.value || ""
    ).toLowerCase();

    const filtered = userTickets.filter((ticket) => {
        if (status && ticket.status !== status) return false;
        if (priority && ticket.priority !== priority) return false;
        if (category && ticket.category !== category) return false;

        if (search) {
            const haystack = [
                ticket.id,
                ticket.status,
                ticket.priority,
                ticket.subject,
                ticket.category,
                ticket.raisedBy || "",
                ticket.createdAt || "",
                ticket.resolvedAt || ""
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
                <td colspan="10" style="text-align:center;padding:20px;color:#888;">
                    No tickets found. Click '+ Raise New Ticket' to submit one.
                </td>
            </tr>
        `;
        return;
    }

    tickets.forEach((ticket) => {
        const statusClass = getStatusClass(ticket.status);
        
        let replyText = "-";
        let replyClass = "";
        
        if (ticket.reply) {
            replyText = "Replied";
            replyClass = "badge badge-closed"; // Green badge for replied
        } else {
            replyText = "Pending";
            replyClass = "badge badge-warning"; // Yellow badge for pending
        }
 
        tableBody.innerHTML += `
            <tr>
                <td>#${ticket.id}</td>
                <td><span class="badge ${statusClass}">${ticket.status || "-"}</span></td>
                <td>${ticket.priority || "-"}</td>
                <td>${escapeHtml(ticket.subject || "-")}</td>
                <td>${ticket.category || "-"}</td>
                <td>${escapeHtml(ticket.raisedBy || "-")}</td>
                <td>${ticket.createdAt || "-"}</td>
                <td>${ticket.resolvedAt || "-"}</td>
                <td><span class="${replyClass}">${replyText}</span></td>
                <td>
                    <a href="ticket-details.html?id=${ticket.id}" class="btn btn-secondary" style="padding: 6px 12px; font-size: 13px; text-decoration: none;">
                        View Ticket
                    </a>
                </td>
            </tr>
        `;
    });
}

function getStatusClass(status) {
    if (status === "Open") return "badge-open";
    if (status === "In Progress") return "badge-progress";
    if (status === "Closed" || status === "Resolved") return "badge-closed";
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
