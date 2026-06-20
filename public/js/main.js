function getCurrentPage() {
    const path = window.location.pathname;
    const page = path.split("/").pop();
    return page || "index.html";
}

function requireAuth() {
    const page = getCurrentPage();
    const isLoggedIn =
        localStorage.getItem("loggedIn") === "true";
    const role = localStorage.getItem("role") || "user";

    // If user is logged in and visits login.html, redirect them to index.html
    if (page === "login.html") {
        if (isLoggedIn) {
            window.location.href = "index.html";
        }
        return;
    }

    // These pages are public and accessible to guest users
    const PUBLIC_PAGES = ["index.html", "view-ticket.html"];

    if (PUBLIC_PAGES.includes(page)) {
        return;
    }

    // For any other page, login is compulsory
    if (!isLoggedIn) {
        window.location.href = "login.html";
        return;
    }

    // Protect routes based on role
    if (role === "user") {
        if (page === "dashboard.html" || page === "add-solution.html") {
            window.location.href = "user-dashboard.html";
        }
    } else if (role === "admin") {
        if (page === "user-dashboard.html") {
            window.location.href = "dashboard.html";
        }
    }
}

requireAuth();

document.addEventListener("DOMContentLoaded", () => {
    const isLoggedIn = localStorage.getItem("loggedIn") === "true";
    const username = isLoggedIn ? (localStorage.getItem("username") || "User") : "Guest";
    const role = isLoggedIn ? (localStorage.getItem("role") || "user") : "guest";

    const userId = document.getElementById("userId");
    const sessionUser = document.getElementById("sessionUser");
    const userName = document.getElementById("userName");

    if (userId) userId.textContent = username;
    if (sessionUser) sessionUser.textContent = username;
    if (userName) userName.textContent = username;

    const userRoleEl = document.querySelector(".user-section .user-role") || document.getElementById("userRole");
    if (userRoleEl) {
        if (!isLoggedIn) {
            userRoleEl.textContent = "Public";
            userRoleEl.style.background = "#f3f4f6";
            userRoleEl.style.color = "#4b5563";
        } else {
            userRoleEl.textContent = role === "admin" ? "Admin" : "User";
            userRoleEl.style.background = "";
            userRoleEl.style.color = "";
        }
    }

    // Hide logout area for guests
    const logoutArea = document.querySelector(".logout-area");
    if (logoutArea) {
        if (!isLoggedIn) {
            logoutArea.style.display = "none";
        } else {
            logoutArea.style.display = "block";
        }
    }

    // Rebuild sidebar dynamically based on user role
    const sidebarMenu = document.querySelector(".sidebar-menu ul");
    if (sidebarMenu) {
        const currentPage = getCurrentPage();
        if (!isLoggedIn) {
            sidebarMenu.innerHTML = `
                <li><a href="index.html" class="${currentPage === "index.html" ? "active" : ""}">Knowledge Hub</a></li>
            `;
        } else if (role === "admin") {
            sidebarMenu.innerHTML = `
                <li><a href="index.html" class="${currentPage === "index.html" ? "active" : ""}">Knowledge Hub</a></li>
                <li><a href="dashboard.html" class="${currentPage === "dashboard.html" ? "active" : ""}">Ticket Dashboard</a></li>
                <li><a href="raise-ticket.html" class="${currentPage === "raise-ticket.html" ? "active" : ""}">Raise Ticket</a></li>
                <li><a href="add-solution.html" class="${currentPage === "add-solution.html" ? "active" : ""}">Add Solution</a></li>
            `;
        } else {
            sidebarMenu.innerHTML = `
                <li><a href="index.html" class="${currentPage === "index.html" ? "active" : ""}">Knowledge Hub</a></li>
                <li><a href="user-dashboard.html" class="${currentPage === "user-dashboard.html" ? "active" : ""}">My Tickets</a></li>
                <li><a href="raise-ticket.html" class="${currentPage === "raise-ticket.html" ? "active" : ""}">Raise Ticket</a></li>
            `;
        }
    }

    // Setup Topbar buttons (Login or Home)
    const profileMenu = document.querySelector(".user-profile-menu");
    if (profileMenu) {
        if (!isLoggedIn) {
            profileMenu.style.display = "none";
            if (!document.getElementById("topbarLoginBtn")) {
                const loginBtn = document.createElement("a");
                loginBtn.id = "topbarLoginBtn";
                loginBtn.href = "login.html";
                loginBtn.className = "login-btn-top";
                loginBtn.innerHTML = `
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" style="margin-right: 8px; vertical-align: middle;">
                      <path fill-rule="evenodd" d="M6 3.5a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v9a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-2a.5.5 0 0 0-1 0v2A1.5 1.5 0 0 0 6.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-9A1.5 1.5 0 0 0 14.5 2h-8A1.5 1.5 0 0 0 5 3.5v2a.5.5 0 0 0 1 0z"/>
                      <path fill-rule="evenodd" d="M11.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 1 0-.708.708L10.293 7.5H1.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708z"/>
                    </svg>
                    Sign In
                `;
                profileMenu.parentNode.appendChild(loginBtn);
            }
            const homeBtn = document.getElementById("topbarHomeBtn");
            if (homeBtn) homeBtn.remove();
        } else {
            profileMenu.style.display = "inline-block";
            const loginBtn = document.getElementById("topbarLoginBtn");
            if (loginBtn) loginBtn.remove();

            if (!document.getElementById("topbarHomeBtn")) {
                const homeBtn = document.createElement("a");
                homeBtn.id = "topbarHomeBtn";
                homeBtn.href = "index.html";
                homeBtn.className = "btn btn-secondary";
                homeBtn.style.marginRight = "15px";
                homeBtn.style.padding = "8px 14px";
                homeBtn.style.display = "inline-flex";
                homeBtn.style.alignItems = "center";
                homeBtn.style.gap = "8px";
                homeBtn.style.textDecoration = "none";
                homeBtn.style.fontSize = "13px";
                homeBtn.style.borderRadius = "8px";
                homeBtn.style.fontWeight = "600";
                homeBtn.style.border = "1px solid #e5e7eb";
                homeBtn.innerHTML = `
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16" style="vertical-align: middle;">
                        <path d="M8.707 1.5a1 1 0 0 0-1.414 0L.646 8.146a.5.5 0 0 0 .708.708L2 8.207V13.5A1.5 1.5 0 0 0 3.5 15h9a1.5 1.5 0 0 0 1.5-1.5V8.207l.646.647a.5.5 0 0 0 .708-.708L13 5.793V2.5a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v1.293L8.707 1.5Z"/>
                        <path d="m8 3.293 6 6V13.5a.5.5 0 0 1-.5.5h-9a.5.5 0 0 1-.5-.5V9.293l6-6Z"/>
                    </svg>
                    Home
                `;
                profileMenu.parentNode.insertBefore(homeBtn, profileMenu);
            }
        }
    }

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
            dropdownRole.textContent = role === "admin" ? "System Administrator" : "Portal User";
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

    const role = (localStorage.getItem("role") || "admin") === "admin" ? "System Administrator" : "Portal User";
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
    localStorage.removeItem("role");
    window.location.href = "login.html";
}
