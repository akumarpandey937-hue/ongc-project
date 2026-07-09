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

    // If user is logged in and visits login.html, redirect them to appropriate landing page
    if (page === "login.html") {
        if (isLoggedIn) {
            if (role === "admin") {
                window.location.href = "index.html";
            } else {
                window.location.href = "user-dashboard.html";
            }
        }
        return;
    }

    // No public pages accessible for visitors except the login screen (and its static resources)
    const PUBLIC_PAGES = [];

    if (PUBLIC_PAGES.includes(page)) {
        return;
    }

    // For any page, login is compulsory
    if (!isLoggedIn) {
        window.location.href = "login.html";
        return;
    }

    // Protect routes based on role
    if (role === "user") {
        // Users are not allowed to access index.html (Knowledge Hub), view-ticket.html (Solution Detail), dashboard.html (Admin Ticket Dashboard), add-solution.html (Publish Solution), user-management.html, or performance-report.html
        if (page === "index.html" || page === "view-ticket.html" || page === "dashboard.html" || page === "add-solution.html" || page === "user-management.html" || page === "performance-report.html") {
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

    if (role === "user") {
        const sidebar = document.querySelector("aside.sidebar");
        if (sidebar) {
            sidebar.style.display = "none";
        }

        const topbar = document.querySelector(".topbar");
        if (topbar) {
            topbar.style.position = "relative";

            // Add/Move logo to topbar left
            let logoImg = document.getElementById("topbarLogo");
            if (!logoImg) {
                logoImg = document.createElement("img");
                logoImg.id = "topbarLogo";
                logoImg.src = "assets/icons/logo.webp";
                logoImg.alt = "ONGC Logo";
                logoImg.style.maxHeight = "45px";
                logoImg.style.width = "auto";
                logoImg.style.objectFit = "contain";
            }
            topbar.insertBefore(logoImg, topbar.firstChild);

            // Find the title text container
            const pageTitle = topbar.querySelector(".page-title");
            if (pageTitle) {
                const titleContainer = pageTitle.parentElement;
                if (titleContainer) {
                    titleContainer.style.position = "absolute";
                    titleContainer.style.left = "50%";
                    titleContainer.style.transform = "translateX(-50%)";
                    titleContainer.style.textAlign = "center";

                    // Make sure logo is not inside titleContainer
                    const logoInside = titleContainer.querySelector("#topbarLogo");
                    if (logoInside) {
                        logoInside.remove();
                    }

                    // Update text
                    const currentPage = getCurrentPage();
                    const capitalizedUsername = username.charAt(0).toUpperCase() + username.slice(1);
                    if (currentPage === "user-dashboard.html") {
                        pageTitle.textContent = "Issue Management Portal";
                    } else if (currentPage === "raise-ticket.html") {
                        pageTitle.textContent = "Raise New Issue";
                    } else if (currentPage === "ticket-details.html") {
                        pageTitle.textContent = "Issue Details";
                    } else {
                        pageTitle.textContent = pageTitle.textContent
                            .replace(/ticket/gi, "issue")
                            .replace(/tickets/gi, "issues")
                            .replace(/My Tickets/gi, "Issue Management Portal");
                    }

                    // Remove subtitle
                    const pageSubtitle = titleContainer.querySelector(".page-subtitle");
                    if (pageSubtitle) {
                        pageSubtitle.remove();
                    }
                }
            }
        }
    }

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
                <li><a href="login.html">Sign In</a></li>
            `;
        } else if (role === "admin") {
            const isUserMgmtActive = currentPage === "user-management.html";
            const isPerfReportActive = currentPage === "performance-report.html";
            const isDropdownOpen = isUserMgmtActive || isPerfReportActive;
            sidebarMenu.innerHTML = `
                <li><a href="index.html" class="${(currentPage === "index.html" || currentPage === "view-ticket.html") ? "active" : ""}">Knowledge Hub</a></li>
                <li><a href="dashboard.html" class="${currentPage === "dashboard.html" ? "active" : ""}">Issue Dashboard</a></li>
                <li class="sidebar-dropdown-item ${isDropdownOpen ? "open" : ""}">
                    <a href="#" class="dropdown-toggle" onclick="toggleSidebarDropdown(event)">
                        <span>Admin Controls</span>
                        <svg class="dropdown-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin-left: auto; transition: transform 0.3s;"><polyline points="6 9 12 15 18 9"></polyline></svg>
                    </a>
                    <ul class="sidebar-dropdown">
                        <li><a href="user-management.html" class="${isUserMgmtActive ? "active" : ""}">User Management</a></li>
                        <li><a href="performance-report.html" class="${isPerfReportActive ? "active" : ""}">Performance Report</a></li>
                    </ul>
                </li>
            `;
        } else {
            sidebarMenu.innerHTML = `
                <li><a href="user-dashboard.html" class="${currentPage === "user-dashboard.html" ? "active" : ""}">Issue Management Portal</a></li>
                <li><a href="raise-ticket.html" class="${currentPage === "raise-ticket.html" ? "active" : ""}">Raise Issue</a></li>
            `;
        }
    }

    // Setup Topbar buttons (Login)
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
        } else {
            profileMenu.style.display = "inline-block";
            const loginBtn = document.getElementById("topbarLoginBtn");
            if (loginBtn) loginBtn.remove();
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
        const now = new Date();
        const day = String(now.getDate()).padStart(2, '0');
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const year = now.getFullYear();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        loginTime = `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
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

window.toggleSidebarDropdown = function (event) {
    event.preventDefault();
    const dropdownLink = event.currentTarget;
    const dropdownItem = dropdownLink.parentElement;
    dropdownItem.classList.toggle("open");
};
