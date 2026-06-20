document.addEventListener("DOMContentLoaded", initializeTicketDetails);

let currentTicket = null;

async function initializeTicketDetails() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    const role = localStorage.getItem("role") || "admin";

    // Setup Back Link
    const backLink = document.getElementById("backLink");
    if (backLink) {
        if (role === "admin") {
            backLink.href = "dashboard.html";
            backLink.textContent = "← Back to Dashboard";
        } else {
            backLink.href = "user-dashboard.html";
            backLink.textContent = "← Back to My Tickets";
        }
    }

    if (!id) {
        showError("Invalid ticket ID.");
        return;
    }

    try {
        currentTicket = await getTicket(id);
        renderTicketInfo(currentTicket);
        renderResponses(currentTicket, role);
        setupAdminForm(currentTicket, role);
    } catch (error) {
        console.error("Error loading ticket details:", error);
        showError("Failed to load ticket details: " + error.message);
    }
}

function showError(message) {
    const container = document.querySelector(".content-wrapper");
    if (container) {
        container.innerHTML = `
            <a href="javascript:history.back()" class="back-link">← Go Back</a>
            <div class="card" style="padding:28px;text-align:center;color:red;font-weight:600;margin-top:20px;">
                ${message}
            </div>
        `;
    }
}

function renderTicketInfo(ticket) {
    setText("ticketSubject", ticket.subject || "No Subject");
    setText("ticketId", `#${ticket.id}`);
    setText("ticketCategory", ticket.category || "-");
    setText("ticketPriority", ticket.priority || "-");

    // Description (allows HTML from Quill editor)
    const descBox = document.getElementById("ticketDescription");
    if (descBox) {
        descBox.innerHTML = ticket.description || "<p style='color:#888;'>No description provided.</p>";
    }

    // Status Badge
    const badgeContainer = document.getElementById("ticketStatusBadge");
    if (badgeContainer) {
        const statusClass = getStatusClass(ticket.status);
        badgeContainer.innerHTML = `<span class="badge ${statusClass}">${ticket.status || "Open"}</span>`;

        // Check if resolved and user is admin to show Add to Knowledge Hub option
        const role = localStorage.getItem("role") || "guest";
        if (role === "admin" && (ticket.status === "Resolved" || ticket.status === "Closed")) {
            const addBtn = document.createElement("button");
            addBtn.className = "btn btn-primary";
            addBtn.id = "addToKbBtn";
            addBtn.style.marginLeft = "12px";
            addBtn.style.padding = "6px 12px";
            addBtn.style.fontSize = "13px";
            addBtn.style.fontWeight = "600";
            addBtn.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16" style="margin-right: 4px; vertical-align: middle;">
                  <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4"/>
                </svg>
                Add to Knowledge Hub
            `;
            addBtn.addEventListener("click", () => {
                const ticketDesc = ticket.description || "";
                const adminReply = ticket.reply || "";
                const combinedDescription = `<strong>Issue Details:</strong><br>${ticketDesc}<br><br><strong>Resolution Steps:</strong><br>${adminReply}`;
                
                const params = new URLSearchParams();
                params.set("subject", ticket.subject || "");
                params.set("category", ticket.category || "");
                params.set("description", combinedDescription);
                
                window.location.href = `add-solution.html?${params.toString()}`;
            });
            badgeContainer.appendChild(addBtn);
        }
    }
}

function renderResponses(ticket, role) {
    const threadContainer = document.getElementById("threadContainer");
    if (!threadContainer) return;

    threadContainer.innerHTML = "";

    if (ticket.reply) {
        threadContainer.innerHTML = `
            <div class="reply-card">
                <div class="reply-avatar">AD</div>
                <div class="reply-content">
                    <div class="reply-header">
                        <span class="reply-author">System Administrator (Response)</span>
                        <span class="reply-time">Status: ${ticket.status}</span>
                    </div>
                    <div class="reply-body">${escapeHtml(ticket.reply)}</div>
                </div>
            </div>
        `;
    } else {
        if (role === "user") {
            threadContainer.innerHTML = `
                <div class="no-reply-alert">
                    Waiting for Admin response. You will see their reply here once they respond.
                </div>
            `;
        } else {
            threadContainer.innerHTML = `
                <div class="no-reply-alert">
                    No replies sent yet. Write a response below to reply to this ticket.
                </div>
            `;
        }
    }
}

function setupAdminForm(ticket, role) {
    const adminForm = document.getElementById("adminReplyForm");
    if (!adminForm) return;

    if (role === "admin") {
        adminForm.style.display = "block";

        // Pre-fill values if editing or responding
        const textarea = document.getElementById("adminReplyText");
        const statusSelect = document.getElementById("adminStatusSelect");

        if (textarea && ticket.reply) {
            textarea.value = ticket.reply;
        }
        if (statusSelect) {
            statusSelect.value = ticket.status || "Open";
        }

        // Cancel Button logic
        const cancelBtn = document.getElementById("cancelReplyBtn");
        if (cancelBtn) {
            cancelBtn.addEventListener("click", () => {
                window.location.href = "dashboard.html";
            });
        }

        // Submit Button logic
        const submitBtn = document.getElementById("submitReplyBtn");
        if (submitBtn) {
            submitBtn.replaceWith(submitBtn.cloneNode(true)); // remove duplicate event listeners if any
            const newSubmitBtn = document.getElementById("submitReplyBtn");
            newSubmitBtn.addEventListener("click", submitAdminReply);
        }
    } else {
        adminForm.style.display = "none";
    }
}

async function submitAdminReply() {
    if (!currentTicket) return;

    const replyText = document.getElementById("adminReplyText")?.value.trim();
    const newStatus = document.getElementById("adminStatusSelect")?.value;

    if (!replyText) {
        alert("Please enter a reply message.");
        return;
    }

    try {
        const result = await updateTicket(currentTicket.id, {
            reply: replyText,
            status: newStatus
        });

        alert("Reply submitted successfully!");
        window.location.href = "dashboard.html";
    } catch (error) {
        console.error("Error submitting admin reply:", error);
        alert("Failed to submit reply: " + error.message);
    }
}

function getStatusClass(status) {
    if (status === "Open") return "badge-open";
    if (status === "In Progress") return "badge-progress";
    if (status === "Closed" || status === "Resolved") return "badge-closed";
    return "";
}

function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}

function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value ?? "-";
}
