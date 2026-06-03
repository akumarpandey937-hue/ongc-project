const PUBLIC_PAGES = ["login.html"];

function getCurrentPage() {
    const path = window.location.pathname;
    const page = path.split("/").pop();
    return page || "index.html";
}

function requireAuth() {
    const page = getCurrentPage();
    const isLoggedIn =
        localStorage.getItem("loggedIn") === "true";

    if (PUBLIC_PAGES.includes(page)) {
        if (isLoggedIn) {
            window.location.href = "dashboard.html";
        }
        return;
    }

    if (!isLoggedIn) {
        window.location.href = "login.html";
    }
}

requireAuth();

document.addEventListener("DOMContentLoaded", () => {
    const username =
        localStorage.getItem("username") || "admin";

    const userId = document.getElementById("userId");
    const sessionUser = document.getElementById("sessionUser");
    const userName = document.getElementById("userName");

    if (userId) userId.textContent = username;
    if (sessionUser) sessionUser.textContent = username;
    if (userName) userName.textContent = username;

    document
        .querySelectorAll(".logout-btn, #logoutBtn")
        .forEach((btn) => {
            btn.addEventListener("click", (e) => {
                e.preventDefault();
                logout();
            });
        });

    // Setup Profile Dropdown and Modal
    const profileTrigger = document.getElementById("profileTrigger");
    const profileDropdown = document.getElementById("profileDropdown");

    if (profileTrigger && profileDropdown) {
        const avatarCircle = document.getElementById("avatarCircle");
        const dropdownAvatar = document.getElementById("dropdownAvatar");
        const dropdownUsername = document.getElementById("dropdownUsername");
        const dropdownRole = document.getElementById("dropdownRole");

        // Extract initials (e.g. "AD" or "A")
        const getInitials = (name) => {
            const parts = name.trim().split(/[\s._-]+/);
            if (parts.length > 1 && parts[0] && parts[1]) {
                return (parts[0][0] + parts[1][0]).toUpperCase();
            }
            return name.substring(0, Math.min(name.length, 2)).toUpperCase();
        };

        const initials = getInitials(username);
        if (avatarCircle) avatarCircle.textContent = initials;
        if (dropdownAvatar) dropdownAvatar.textContent = initials;
        if (dropdownUsername) dropdownUsername.textContent = username;
        if (dropdownRole) {
            dropdownRole.textContent = username.toLowerCase() === "admin" ? "System Administrator" : "Portal User";
        }

        // Toggle dropdown
        profileTrigger.addEventListener("click", (e) => {
            e.stopPropagation();
            profileDropdown.classList.toggle("show");
        });

        // Close dropdown when clicking outside
        document.addEventListener("click", (e) => {
            if (!profileTrigger.contains(e.target) && !profileDropdown.contains(e.target)) {
                profileDropdown.classList.remove("show");
            }
        });

        // Sign out button inside dropdown
        const dropdownLogoutBtn = document.getElementById("dropdownLogoutBtn");
        if (dropdownLogoutBtn) {
            dropdownLogoutBtn.addEventListener("click", (e) => {
                e.preventDefault();
                logout();
            });
        }

        // Account Details Modal trigger
        const viewDetailsBtn = document.getElementById("viewDetailsBtn");
        if (viewDetailsBtn) {
            viewDetailsBtn.addEventListener("click", () => {
                profileDropdown.classList.remove("show");
                showAccountDetailsModal(username);
            });
        }
    }
});

function showAccountDetailsModal(username) {
    let existingModal = document.getElementById("userDetailsModalOverlay");
    if (existingModal) {
        existingModal.remove();
    }

    const parts = username.trim().split(/[\s._-]+/);
    const initials = (parts.length > 1 && parts[0] && parts[1]) 
        ? (parts[0][0] + parts[1][0]).toUpperCase() 
        : username.substring(0, Math.min(username.length, 2)).toUpperCase();

    const role = username.toLowerCase() === "admin" ? "System Administrator" : "Portal User";
    const status = "Active";
    
    let loginTime = localStorage.getItem("loginTime");
    if (!loginTime) {
        loginTime = new Date().toLocaleString();
        localStorage.setItem("loginTime", loginTime);
    }

    // Determine OS and Browser
    const userAgent = navigator.userAgent;
    let os = "Unknown OS";
    if (userAgent.indexOf("Win") !== -1) os = "Windows";
    else if (userAgent.indexOf("Mac") !== -1) os = "macOS";
    else if (userAgent.indexOf("Linux") !== -1) os = "Linux";
    else if (userAgent.indexOf("Android") !== -1) os = "Android";
    else if (userAgent.indexOf("like Mac") !== -1) os = "iOS";

    let browser = "Unknown Browser";
    if (userAgent.indexOf("Chrome") !== -1) browser = "Google Chrome";
    else if (userAgent.indexOf("Safari") !== -1) browser = "Safari";
    else if (userAgent.indexOf("Firefox") !== -1) browser = "Mozilla Firefox";
    else if (userAgent.indexOf("MSIE") !== -1 || !!document.documentMode) browser = "Internet Explorer";
    else if (userAgent.indexOf("Edge") !== -1) browser = "Microsoft Edge";

    const modalHTML = `
        <div class="user-details-modal-overlay" id="userDetailsModalOverlay">
            <div class="user-details-modal">
                <div class="modal-header">
                    <div class="modal-header-avatar">${initials}</div>
                    <div class="modal-header-info">
                        <h3 class="modal-title">${username}</h3>
                        <p class="modal-subtitle">${role}</p>
                    </div>
                    <button class="modal-close-btn" id="modalCloseBtn">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="details-grid">
                        <div class="detail-row">
                            <span class="detail-label">Status</span>
                            <span class="detail-value status-badge">${status}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">System Role</span>
                            <span class="detail-value">${role}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Session ID</span>
                            <span class="detail-value" style="font-family: monospace; font-size: 12px; color: #4b5563;">ONGC-${Math.floor(100000 + Math.random() * 900000)}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Login Time</span>
                            <span class="detail-value">${loginTime}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Operating System</span>
                            <span class="detail-value">${os}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Browser</span>
                            <span class="detail-value">${browser}</span>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="modal-btn modal-btn-primary" id="modalOkBtn">Close</button>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML("beforeend", modalHTML);
    const overlay = document.getElementById("userDetailsModalOverlay");
    
    // Animate open
    setTimeout(() => {
        overlay.classList.add("show");
    }, 10);

    const closeModal = () => {
        overlay.classList.remove("show");
        setTimeout(() => {
            overlay.remove();
        }, 300);
    };

    document.getElementById("modalCloseBtn").addEventListener("click", closeModal);
    document.getElementById("modalOkBtn").addEventListener("click", closeModal);
    overlay.addEventListener("click", (e) => {
        if (e.target === overlay) {
            closeModal();
        }
    });
}

function logout() {
    localStorage.removeItem("loggedIn");
    localStorage.removeItem("username");
    localStorage.removeItem("loginTime");
    window.location.href = "login.html";
}
