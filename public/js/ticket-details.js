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
            backLink.textContent = "← Back to Issue Management Portal";
        }
    }

    if (!id) {
        showError("Invalid issue ID.");
        return;
    }

    try {
        currentTicket = await getTicket(id);
        renderTicketInfo(currentTicket);
        renderResponses(currentTicket, role);
        setupAdminForm(currentTicket, role);
    } catch (error) {
        console.error("Error loading issue details:", error);
        showError("Failed to load issue details: " + error.message);
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

    // Description (allows HTML from Quill editor)
    const descBox = document.getElementById("ticketDescription");
    if (descBox) {
        descBox.innerHTML = ticket.description || "<p style='color:#888;'>No description provided.</p>";
    }

    // Handle Attachment
    const attachmentSection = document.getElementById("attachmentSection");
    const attachmentLink = document.getElementById("attachmentLink");
    const attachmentPreviewContainer = document.getElementById("attachmentPreviewContainer");
    
    if (attachmentSection && attachmentLink) {
        if (ticket.attachment && ticket.attachment.url) {
            attachmentSection.style.display = "block";
            attachmentLink.href = ticket.attachment.url;
            attachmentLink.textContent = ticket.attachment.name || "View Attachment";
            
            const urlPath = ticket.attachment.url.split('?')[0];
            const ext = urlPath.split('.').pop().toLowerCase();
            if (['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(ext)) {
                attachmentPreviewContainer.style.display = "block";
                attachmentPreviewContainer.innerHTML = `
                    <img src="${ticket.attachment.url}" alt="Attachment Preview" style="max-width: 100%; max-height: 350px; border-radius: 6px; border: 1px solid var(--border-color); cursor: pointer; transition: transform 0.2s;" onclick="window.open('${ticket.attachment.url}')">
                `;
            } else {
                attachmentPreviewContainer.style.display = "none";
                attachmentPreviewContainer.innerHTML = "";
            }
        } else {
            attachmentSection.style.display = "none";
        }
    }

    // Status Badge
    const badgeContainer = document.getElementById("ticketStatusBadge");
    if (badgeContainer) {
        const statusClass = getStatusClass(ticket.status);
        badgeContainer.innerHTML = `<span class="badge ${statusClass}">${ticket.status || "Unresolved"}</span>`;

        // Check if resolved and user is admin to show Add to Knowledge Hub option
        const role = localStorage.getItem("role") || "guest";
        if (role === "admin" && ticket.status === "Resolved") {
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
        const replier = ticket.repliedBy || "System Administrator";
        const capitalizedReplier = replier.charAt(0).toUpperCase() + replier.slice(1);
        const initials = replier.substring(0, Math.min(replier.length, 2)).toUpperCase();
        const isResolved = ticket.status === "Resolved";
        const cardClass = isResolved ? "reply-card" : "reply-card unresolved";
        const statusClass = isResolved ? "badge-closed" : "badge-progress";

        // Create footer text for resolution or reply details
        let footerHtml = "";
        if (isResolved && ticket.resolvedAt) {
            footerHtml = `
                <div class="reply-footer">
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="#16a34a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="20 6 9 17 4 12" transform="scale(0.65) translate(2, 2)"></polyline>
                    </svg>
                    <span>Issue was resolved on <strong>${ticket.resolvedAt}</strong></span>
                </div>
            `;
        } else {
            footerHtml = `
                <div class="reply-footer">
                    <span>Reply processed successfully</span>
                </div>
            `;
        }

        threadContainer.innerHTML = `
            <div class="${cardClass}">
                <div class="reply-avatar">${initials}</div>
                <div class="reply-content">
                    <div class="reply-header">
                        <div class="reply-meta">
                            <span class="reply-author">${capitalizedReplier}</span>
                            <span class="reply-badge">Official Response</span>
                        </div>
                        <span class="badge ${statusClass}">${ticket.status}</span>
                    </div>
                    <div class="reply-body">${escapeHtml(ticket.reply)}</div>
                    ${footerHtml}
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
                    No replies sent yet. Write a response below to reply to this issue.
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
            statusSelect.value = "Resolved";
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

    const replyText = document.getElementById("adminReplyText")?.value.trim() || "";
    const newStatus = document.getElementById("adminStatusSelect")?.value;

    try {
        const adminUsername = localStorage.getItem("username") || "admin";
        const result = await updateTicket(currentTicket.id, {
            reply: replyText,
            status: newStatus,
            repliedBy: adminUsername
        });

        alert("Reply submitted successfully!");
        window.location.href = "dashboard.html";
    } catch (error) {
        console.error("Error submitting admin reply:", error);
        alert("Failed to submit reply: " + error.message);
    }
}

function getStatusClass(status) {
    if (status === "Unresolved") return "badge-progress";
    if (status === "Resolved") return "badge-closed";
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
