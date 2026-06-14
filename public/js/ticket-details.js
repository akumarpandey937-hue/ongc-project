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
