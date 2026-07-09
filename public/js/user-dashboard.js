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
    const role = localStorage.getItem("role") || "user";
    const capitalizedUser = username.charAt(0).toUpperCase() + username.slice(1);

    const welcomeMsgEl = document.getElementById("welcomeMsg");
    const greetingMsgEl = document.getElementById("greetingMsg");

    if (welcomeMsgEl) {
        const firstName = capitalizedUser.split(" ")[0];
        welcomeMsgEl.textContent = `Welcome, ${firstName}!`;
    }
    if (greetingMsgEl) {
        const hour = new Date().getHours();
        let greeting = "Good morning";
        if (hour >= 12 && hour < 17) {
            greeting = "Good afternoon";
        } else if (hour >= 17 && hour < 21) {
            greeting = "Good evening";
        } else if (hour >= 21 || hour < 4) {
            greeting = "Good night";
        }
        greetingMsgEl.textContent = `${greeting}!`;
    }

    const sessionRoleEl = document.getElementById("sessionRole");
    if (sessionRoleEl) {
        sessionRoleEl.textContent = role === "admin" ? "Admin" : "Portal User";
    }

    const sessionLoginTimeEl = document.getElementById("sessionLoginTime");
    if (sessionLoginTimeEl) {
        sessionLoginTimeEl.textContent = localStorage.getItem("loginTime") || "-";
    }

    // Populate profile details
    const localProfile = {
        username: username,
        role: role,
        cpfId: localStorage.getItem("cpfId") || "",
        name: localStorage.getItem("name") || "",
        mobileNo: localStorage.getItem("mobileNo") || ""
    };

    // If localProfile is missing details, generate deterministic fallbacks
    if (!localProfile.cpfId) {
        let hash = 0;
        for (let i = 0; i < username.length; i++) {
            hash = username.charCodeAt(i) + ((hash << 5) - hash);
        }
        const cifNum = Math.abs(hash % 900000) + 100000;
        localProfile.cpfId = `ONGC-${cifNum}`;
    }
    if (!localProfile.name) {
        localProfile.name = capitalizedUser;
    }
    if (!localProfile.mobileNo) {
        localProfile.mobileNo = "+91-9999999999";
    }


    renderProfileDetails(localProfile);

    // Fetch fresh profile details from backend
    getUserProfile()
        .then((freshProfile) => {
            if (freshProfile) {
                localStorage.setItem("cpfId", freshProfile.cpfId || "");
                localStorage.setItem("name", freshProfile.name || "");
                localStorage.setItem("mobileNo", freshProfile.mobileNo || "");
                renderProfileDetails(freshProfile);
            }
        })
        .catch((error) => {
            console.warn("Could not fetch fresh user profile:", error);
        });

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
                        Could not load your issues. Start the backend: cd backend && npm start
                    </td>
                </tr>
            `;
        }
    }
}

function renderProfileDetails(profile) {
    const empCpfIdEl = document.getElementById("empCpfId");
    const empNameEl = document.getElementById("empName");
    const empMobileEl = document.getElementById("empMobile");
    const empRoleEl = document.getElementById("empRole");
    const welcomeMsgEl = document.getElementById("welcomeMsg");

    const displayName = profile.name || profile.username || "-";

    if (empCpfIdEl) empCpfIdEl.textContent = profile.cpfId || "-";
    if (empNameEl) empNameEl.textContent = displayName;
    if (empMobileEl) empMobileEl.textContent = profile.mobileNo || "-";
    if (empRoleEl) {
        empRoleEl.textContent = profile.role === "admin" ? "System Administrator" : "Portal User";
    }
    if (welcomeMsgEl) {
        const firstName = displayName.split(" ")[0];
        welcomeMsgEl.textContent = `Welcome, ${firstName}!`;
    }
}

function updateStats(tickets) {
    const total = tickets.length;
    const unresolved = tickets.filter(t => t.status === "Unresolved").length;
    const resolved = tickets.filter(t => t.status === "Resolved").length;

    // Update legend and labels
    setText("chartTotalCount", total);
    setText("chartUnresolvedCount", unresolved);
    setText("chartResolvedCount", resolved);

    // Calculate percentages for pie chart
    let unresolvedPercent = 0;
    let resolvedPercent = 0;

    if (total > 0) {
        unresolvedPercent = (unresolved / total) * 100;
        resolvedPercent = (resolved / total) * 100;
    }

    const chartEl = document.getElementById("statsPieChart");
    if (chartEl) {
        if (total === 0) {
            chartEl.style.background = "#e2e8f0"; // Grey fallback circle
        } else {
            chartEl.style.background = `conic-gradient(
                #f59e0b 0% ${unresolvedPercent}%,
                #10b981 ${unresolvedPercent}% 100%
            )`;
        }
    }
}

function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value ?? 0;
}

function populateFilters(tickets) {
    const statuses = ["Resolved", "Unresolved"];
    const categories = ["PARADIGM", "OMEGA", "CGG", "GEOTOMO", "SCUBE", "SHARP REFLECTION", "LINUX"];
    fillSelect("statusFilter", statuses);
    fillSelect("categoryFilter", categories);
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
    const category = document.getElementById("categoryFilter")?.value || "";
    const search = (
        document.getElementById("ticketSearch")?.value || ""
    ).toLowerCase();

    const filtered = userTickets.filter((ticket) => {
        if (status && ticket.status !== status) return false;
        if (category && ticket.category !== category) return false;
        if (search) {
            const haystack = [
                ticket.id,
                ticket.status,
                ticket.subject,
                ticket.category,
                ticket.raisedBy || "",
                ticket.createdAt || "",
                ticket.resolvedAt || "",
                ticket.resolvedBy || ""
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
                <td colspan="7" style="text-align:center;padding:30px;color:var(--text-secondary);font-size:15px;font-weight:500;">
                    No record found
                </td>
            </tr>
        `;
        return;
    }

    tickets.forEach((ticket) => {
        const statusClass = getStatusClass(ticket.status);
        const resolver = ticket.resolvedBy || "-";
        const capitalizedResolver = resolver !== "-" ? resolver.charAt(0).toUpperCase() + resolver.slice(1) : "-";
 
        tableBody.innerHTML += `
            <tr>
                <td>#${ticket.id}</td>
                <td>${ticket.category || "-"}</td>
                <td>${escapeHtml(ticket.subject || "-")}</td>
                <td>${formatDate(ticket.createdAt)}</td>
                <td>${formatDate(ticket.resolvedAt)}</td>
                <td>${capitalizedResolver}</td>
                <td>
                    <a href="ticket-details.html?id=${ticket.id}" style="text-decoration: none;">
                        <span class="badge ${statusClass}">${ticket.status || "-"}</span>
                    </a>
                </td>
            </tr>
        `;
    });
}

function getStatusClass(status) {
    if (status === "Unresolved") return "badge-progress";
    if (status === "Resolved") return "badge-closed";
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

function formatDate(dateStr) {
    if (!dateStr || dateStr === "-") return "-";
    const parts = dateStr.trim().split(" ");
    const datePart = parts[0];
    if (datePart.includes("-")) {
        const datePieces = datePart.split("-");
        if (datePieces.length === 3 && datePieces[0].length === 4) {
            // yyyy-mm-dd
            const timePart = parts[1] ? ` ${parts[1]}` : "";
            return `${datePieces[2]}/${datePieces[1]}/${datePieces[0]}${timePart}`;
        }
    }
    return dateStr;
}
