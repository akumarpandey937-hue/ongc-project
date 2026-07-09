document.addEventListener("DOMContentLoaded", initializeUserManagement);

let allUsers = [];

async function initializeUserManagement() {
    const loggedInUser = localStorage.getItem("username") || "";
    
    // Bind UI actions
    setupModalEvents();
    setupChangePasswordModalEvents();
    setupEditUserModalEvents();
    
    // Initial fetch of users
    await fetchAndRenderUsers(loggedInUser);
}

async function fetchAndRenderUsers(loggedInUser) {
    const tableBody = document.getElementById("usersTableBody");
    if (!tableBody) return;

    try {
        allUsers = await getAllUsers();
        renderUsersTable(allUsers, loggedInUser);
    } catch (err) {
        console.error("Error loading users:", err);
        tableBody.innerHTML = `
            <tr>
                <td colspan="8" style="text-align: center; padding: 30px; color: #dc2626; font-weight: 500;">
                    Failed to load users: ${err.message || err}
                </td>
            </tr>
        `;
    }
}

function renderUsersTable(users, loggedInUser) {
    const tableBody = document.getElementById("usersTableBody");
    if (!tableBody) return;

    if (!users || users.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="8" style="text-align: center; padding: 30px; color: var(--text-secondary);">
                    No portal users found.
                </td>
            </tr>
        `;
        return;
    }

    tableBody.innerHTML = "";

    users.forEach(user => {
        const isSelf = user.username.toLowerCase() === loggedInUser.toLowerCase();
        
        // Setup row HTML
        const tr = document.createElement("tr");
        
        // Name
        const nameTd = document.createElement("td");
        nameTd.style.padding = "16px 24px";
        nameTd.style.fontWeight = "600";
        nameTd.style.color = "var(--text-primary)";
        nameTd.textContent = user.name || "-";
        tr.appendChild(nameTd);

        // Username
        const usernameTd = document.createElement("td");
        usernameTd.style.padding = "16px 24px";
        usernameTd.textContent = user.username;
        tr.appendChild(usernameTd);

        // CPF ID
        const cpfIdTd = document.createElement("td");
        cpfIdTd.style.padding = "16px 24px";
        cpfIdTd.style.fontFamily = "monospace";
        cpfIdTd.textContent = user.cpfId || "-";
        tr.appendChild(cpfIdTd);

        // Mobile
        const mobileTd = document.createElement("td");
        mobileTd.style.padding = "16px 24px";
        mobileTd.textContent = user.mobileNo || "-";
        tr.appendChild(mobileTd);



        // Role Privilege Text (constant value)
        const roleTd = document.createElement("td");
        roleTd.style.padding = "16px 24px";
        roleTd.textContent = user.role === "admin" ? "System Administrator" : "Portal User";
        roleTd.style.fontWeight = "500";
        tr.appendChild(roleTd);

        // Status Toggle Switch
        const statusTd = document.createElement("td");
        statusTd.style.padding = "16px 24px";
        statusTd.style.textAlign = "center";

        const label = document.createElement("label");
        label.className = "switch";

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = (user.status !== "inactive");
        
        if (isSelf) {
            checkbox.disabled = true;
            label.title = "You cannot deactivate your own account";
            label.style.opacity = "0.6";
            label.style.cursor = "not-allowed";
        }

        checkbox.addEventListener("change", async () => {
            const newStatus = checkbox.checked ? "active" : "inactive";
            try {
                await updateUser(user.username, { status: newStatus });
                showToast(`Status updated to ${newStatus} for ${user.username}`);
            } catch (err) {
                console.error(err);
                showToast(`Failed to update status: ${err.message || err}`, true);
                checkbox.checked = !checkbox.checked; // Revert checkbox
            }
        });

        const span = document.createElement("span");
        span.className = "slider";

        label.appendChild(checkbox);
        label.appendChild(span);
        statusTd.appendChild(label);
        tr.appendChild(statusTd);

        // Actions TD (Delete button)
        const actionsTd = document.createElement("td");
        actionsTd.style.padding = "16px 24px";
        actionsTd.style.textAlign = "center";

        // Pencil button to edit user details
        const editBtn = document.createElement("button");
        editBtn.className = "btn-edit-user-details";
        editBtn.style.backgroundColor = "transparent";
        editBtn.style.border = "none";
        editBtn.style.color = "var(--active-text)";
        editBtn.style.cursor = "pointer";
        editBtn.style.padding = "6px 12px";
        editBtn.style.borderRadius = "6px";
        editBtn.style.transition = "all 0.2s ease";
        editBtn.style.marginRight = "8px";
        editBtn.title = "Edit user details";

        editBtn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" style="vertical-align: middle;">
                <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z"/>
            </svg>
        `;

        editBtn.addEventListener("mouseover", () => {
            editBtn.style.backgroundColor = "rgba(0, 0, 0, 0.05)";
        });
        editBtn.addEventListener("mouseout", () => {
            editBtn.style.backgroundColor = "transparent";
        });

        editBtn.addEventListener("click", () => {
            openEditUserModal(user);
        });

        actionsTd.appendChild(editBtn);

        // Key button to change password
        const passwordBtn = document.createElement("button");
        passwordBtn.className = "btn-password-user";
        passwordBtn.style.backgroundColor = "transparent";
        passwordBtn.style.border = "none";
        passwordBtn.style.color = "var(--active-text)";
        passwordBtn.style.cursor = "pointer";
        passwordBtn.style.padding = "6px 12px";
        passwordBtn.style.borderRadius = "6px";
        passwordBtn.style.transition = "all 0.2s ease";
        passwordBtn.style.marginRight = "8px";
        passwordBtn.title = "Change password";

        passwordBtn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 24 24" style="vertical-align: middle;">
                <path d="M12.65 10C11.83 7.67 9.61 6 7 6c-3.31 0-6 2.69-6 6s2.69 6 6 6c2.61 0 4.83-1.67 5.65-4H17v4h4v-4h2v-4H12.65zM7 14c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/>
            </svg>
        `;

        passwordBtn.addEventListener("mouseover", () => {
            passwordBtn.style.backgroundColor = "rgba(0, 0, 0, 0.05)";
        });
        passwordBtn.addEventListener("mouseout", () => {
            passwordBtn.style.backgroundColor = "transparent";
        });

        passwordBtn.addEventListener("click", () => {
            const overlay = document.getElementById("changePasswordModalOverlay");
            const userField = document.getElementById("changePassUsername");
            if (overlay && userField) {
                userField.value = user.username;
                overlay.classList.add("show");
            }
        });

        actionsTd.appendChild(passwordBtn);

        const deleteBtn = document.createElement("button");
        deleteBtn.className = "btn-delete-user";
        deleteBtn.style.backgroundColor = "transparent";
        deleteBtn.style.border = "none";
        deleteBtn.style.color = isSelf ? "var(--text-muted, #94a3b8)" : "#ef4444";
        deleteBtn.style.cursor = isSelf ? "not-allowed" : "pointer";
        deleteBtn.style.padding = "6px 12px";
        deleteBtn.style.borderRadius = "6px";
        deleteBtn.style.transition = "all 0.2s ease";
        deleteBtn.title = isSelf ? "You cannot delete your own account" : "Delete user account";

        if (isSelf) {
            deleteBtn.disabled = true;
        }

        deleteBtn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" style="vertical-align: middle;">
                <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z"/>
                <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z"/>
            </svg>
        `;

        if (!isSelf) {
            deleteBtn.addEventListener("mouseover", () => {
                deleteBtn.style.backgroundColor = "#fee2e2";
            });
            deleteBtn.addEventListener("mouseout", () => {
                deleteBtn.style.backgroundColor = "transparent";
            });

            deleteBtn.addEventListener("click", async () => {
                if (confirm(`Are you sure you want to delete user "${user.username}"? This action cannot be undone.`)) {
                    try {
                        await deleteUser(user.username);
                        showToast(`User ${user.username} deleted successfully.`);
                        await fetchAndRenderUsers(loggedInUser);
                    } catch (err) {
                        console.error(err);
                        showToast(`Failed to delete user: ${err.message || err}`, true);
                    }
                }
            });
        }

        actionsTd.appendChild(deleteBtn);
        tr.appendChild(actionsTd);

        tableBody.appendChild(tr);
    });
}

function setupModalEvents() {
    const modal = document.getElementById("createUserModalOverlay");
    const openBtn = document.getElementById("openCreateUserModalBtn");
    const closeBtn = document.getElementById("closeModalBtn");
    const cancelBtn = document.getElementById("cancelModalBtn");
    const form = document.getElementById("createUserForm");

    if (!modal || !form) return;

    const openModal = () => modal.classList.add("show");
    const closeModal = () => {
        modal.classList.remove("show");
        form.reset();
    };

    if (openBtn) openBtn.addEventListener("click", openModal);
    if (closeBtn) closeBtn.addEventListener("click", closeModal);
    if (cancelBtn) cancelBtn.addEventListener("click", closeModal);
    
    // Close modal on outside click
    modal.addEventListener("click", (e) => {
        if (e.target === modal) closeModal();
    });

    // Form Submission
    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const username = document.getElementById("newUsername").value.trim();
        const password = document.getElementById("newPassword").value;
        const role = document.getElementById("newRole").value;
        const name = document.getElementById("newName").value.trim();
        const cpfId = document.getElementById("newCpfId").value.trim();
        const mobileNo = document.getElementById("newMobileNo").value.trim();

        if (password.length < 6) {
            showToast("Password must be at least 6 characters.", true);
            return;
        }

        try {
            await createUser({
                username,
                password,
                role,
                name,
                cpfId,
                mobileNo
            });
            showToast(`User ${username} created successfully.`);
            closeModal();
            // Refresh table
            const loggedInUser = localStorage.getItem("username") || "";
            await fetchAndRenderUsers(loggedInUser);
        } catch (err) {
            console.error(err);
            showToast(`Failed to create user: ${err.message || err}`, true);
        }
    });
}

// Simple dynamic Toast notification
function showToast(message, isError = false) {
    const existing = document.getElementById("toastNotification");
    if (existing) existing.remove();

    const toast = document.createElement("div");
    toast.id = "toastNotification";
    toast.style.position = "fixed";
    toast.style.bottom = "24px";
    toast.style.right = "24px";
    toast.style.backgroundColor = isError ? "#ef4444" : "#10b981";
    toast.style.color = "white";
    toast.style.padding = "12px 24px";
    toast.style.borderRadius = "8px";
    toast.style.fontWeight = "600";
    toast.style.fontSize = "14px";
    toast.style.zIndex = "9999";
    toast.style.boxShadow = "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)";
    toast.style.transition = "opacity 0.3s ease, transform 0.3s ease";
    toast.style.transform = "translateY(20px)";
    toast.style.opacity = "0";
    toast.textContent = message;

    document.body.appendChild(toast);

    // Animate in
    setTimeout(() => {
        toast.style.opacity = "1";
        toast.style.transform = "translateY(0)";
    }, 50);

    // Remove after 3 seconds
    setTimeout(() => {
        toast.style.opacity = "0";
        toast.style.transform = "translateY(20px)";
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function setupChangePasswordModalEvents() {
    const overlay = document.getElementById("changePasswordModalOverlay");
    const closeBtn = document.getElementById("closePassModalBtn");
    const cancelBtn = document.getElementById("cancelPassModalBtn");
    const form = document.getElementById("changePasswordForm");

    if (!overlay || !form) return;

    const closeModal = () => {
        overlay.classList.remove("show");
        form.reset();
    };

    if (closeBtn) closeBtn.addEventListener("click", closeModal);
    if (cancelBtn) cancelBtn.addEventListener("click", closeModal);

    // Close on outside click
    overlay.addEventListener("click", (e) => {
        if (e.target === overlay) closeModal();
    });

    // Form Submission
    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const username = document.getElementById("changePassUsername").value;
        const newPassword = document.getElementById("newPassTarget").value;

        if (newPassword.length < 6) {
            showToast("Password must be at least 6 characters.", true);
            return;
        }

        try {
            await updateUser(username, { password: newPassword });
            showToast(`Password successfully updated for user "${username}".`);
            closeModal();
        } catch (err) {
            console.error(err);
            showToast(`Failed to update password: ${err.message || err}`, true);
        }
    });
}

function openEditUserModal(user) {
    const overlay = document.getElementById("editUserModalOverlay");
    const usernameField = document.getElementById("editUserUsername");
    const newUsernameField = document.getElementById("editNewUsername");
    const nameField = document.getElementById("editName");
    const cpfIdField = document.getElementById("editCpfId");
    const mobileNoField = document.getElementById("editMobileNo");
    const roleField = document.getElementById("editRole");

    if (!overlay) return;

    // Populate modal fields
    if (usernameField) usernameField.value = user.username;
    if (newUsernameField) newUsernameField.value = user.username;
    if (nameField) nameField.value = user.name || "";
    if (cpfIdField) cpfIdField.value = user.cpfId || "";
    if (mobileNoField) mobileNoField.value = user.mobileNo || "";
    if (roleField) {
        roleField.value = user.role || "user";
        
        // Prevent editing own role to avoid self-demotion
        const loggedInUser = localStorage.getItem("username") || "";
        if (user.username.toLowerCase() === loggedInUser.toLowerCase()) {
            roleField.disabled = true;
            roleField.title = "You cannot change your own role";
        } else {
            roleField.disabled = false;
            roleField.title = "";
        }
    }

    overlay.classList.add("show");
}

function setupEditUserModalEvents() {
    const overlay = document.getElementById("editUserModalOverlay");
    const closeBtn = document.getElementById("closeEditModalBtn");
    const cancelBtn = document.getElementById("cancelEditModalBtn");
    const form = document.getElementById("editUserForm");

    if (!overlay || !form) return;

    const closeModal = () => {
        overlay.classList.remove("show");
        form.reset();
    };

    if (closeBtn) closeBtn.addEventListener("click", closeModal);
    if (cancelBtn) cancelBtn.addEventListener("click", closeModal);

    // Close on outside click
    overlay.addEventListener("click", (e) => {
        if (e.target === overlay) closeModal();
    });

    // Form Submission
    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const originalUsername = document.getElementById("editUserUsername").value;
        const newUsername = document.getElementById("editNewUsername").value.trim();
        const name = document.getElementById("editName").value.trim();
        const cpfId = document.getElementById("editCpfId").value.trim();
        const mobileNo = document.getElementById("editMobileNo").value.trim();
        const role = document.getElementById("editRole").value;

        try {
            await updateUser(originalUsername, {
                username: newUsername,
                name,
                cpfId,
                mobileNo,
                role
            });

            const loggedInUser = localStorage.getItem("username") || "";

            // If editing own username, trigger logout to establish new session
            if (originalUsername.toLowerCase() === loggedInUser.toLowerCase() && newUsername.toLowerCase() !== loggedInUser.toLowerCase()) {
                showToast("Your username has been updated successfully. Please log in again.");
                closeModal();
                setTimeout(() => {
                    const logoutBtn = document.getElementById("dropdownLogoutBtn") || document.getElementById("logoutBtn");
                    if (logoutBtn) {
                        logoutBtn.click();
                    } else {
                        localStorage.clear();
                        window.location.href = "login.html";
                    }
                }, 2000);
                return;
            }

            showToast(`User details updated successfully for "${newUsername}".`);
            closeModal();
            // Refresh table
            await fetchAndRenderUsers(loggedInUser);
        } catch (err) {
            console.error(err);
            showToast(`Failed to update user details: ${err.message || err}`, true);
        }
    });
}

