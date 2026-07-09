document.addEventListener("DOMContentLoaded", initializePerformanceReport);

async function initializePerformanceReport() {
    try {
        // Fetch tickets and users concurrently
        const [tickets, allUsers] = await Promise.all([
            getTickets(),
            getAllUsers()
        ]);

        // Populate summary cards
        document.getElementById("statTotalTickets").textContent = tickets.length;
        const resolvedCount = tickets.filter(t => t.status === "Resolved").length;
        document.getElementById("statResolvedTickets").textContent = resolvedCount;
        document.getElementById("statActiveUsers").textContent = allUsers.length;

        // Process data
        const adminData = processAdminPerformance(tickets, allUsers);
        const userData = processUserActivity(tickets, allUsers);
        const softwareData = processSoftwareIssues(tickets);

        // Render charts
        renderAdminChart(adminData);
        renderUserChart(userData);
        renderSoftwareChart(softwareData);

    } catch (error) {
        console.error("Error loading performance report data:", error);
        showGlobalError();
    }
}

function formatAdminName(username) {
    const lower = username.toLowerCase();
    if (lower === "admin") return "admin";
    const match = lower.match(/^admin(\d+)$/);
    if (match) {
        return `admin ${match[1]}`;
    }
    return username;
}

function processAdminPerformance(tickets, allUsers) {
    const admins = allUsers.filter(u => u.role === "admin");
    const adminCounts = {};

    // Initialize with registered admins
    admins.forEach(adm => {
        const displayName = formatAdminName(adm.username);
        adminCounts[displayName] = 0;
    });

    // Username mapping to display name
    const adminNameMap = {};
    allUsers.forEach(u => {
        adminNameMap[u.username.toLowerCase()] = formatAdminName(u.username);
    });

    // Count tickets resolved by admins
    tickets.forEach(ticket => {
        if (ticket.status === "Resolved" && ticket.resolvedBy) {
            const resolverLower = ticket.resolvedBy.toLowerCase();
            const displayName = adminNameMap[resolverLower] || formatAdminName(ticket.resolvedBy);
            adminCounts[displayName] = (adminCounts[displayName] || 0) + 1;
        }
    });

    return {
        labels: Object.keys(adminCounts),
        data: Object.values(adminCounts)
    };
}

function processUserActivity(tickets, allUsers) {
    const portalUsers = allUsers.filter(u => u.role === "user");
    const userCounts = {};

    // Initialize with registered users
    portalUsers.forEach(u => {
        const key = u.name ? `${u.name} (${u.username})` : u.username;
        userCounts[key] = 0;
    });

    // Username mapping to display name
    const userNameMap = {};
    allUsers.forEach(u => {
        userNameMap[u.username.toLowerCase()] = u.name ? `${u.name} (${u.username})` : u.username;
    });

    // Count tickets raised by users
    tickets.forEach(ticket => {
        if (ticket.raisedBy) {
            const raiserLower = ticket.raisedBy.toLowerCase();
            const displayName = userNameMap[raiserLower] || ticket.raisedBy;
            userCounts[displayName] = (userCounts[displayName] || 0) + 1;
        }
    });

    return {
        labels: Object.keys(userCounts),
        data: Object.values(userCounts)
    };
}

function renderAdminChart(processed) {
    const ctx = document.getElementById("adminPerformanceChart").getContext("2d");
    const noDataEl = document.getElementById("noAdminData");

    const totalResolved = processed.data.reduce((sum, val) => sum + val, 0);
    if (totalResolved === 0) {
        noDataEl.style.display = "block";
        return;
    }

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: processed.labels,
            datasets: [{
                label: 'Issues Resolved',
                data: processed.data,
                backgroundColor: 'rgba(16, 185, 129, 0.75)',
                borderColor: '#10b981',
                borderWidth: 1.5,
                borderRadius: 6,
                barPercentage: 0.5
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: '#0f172a',
                    titleColor: '#ffffff',
                    bodyColor: '#ffffff',
                    cornerRadius: 8,
                    padding: 12
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1,
                        color: '#475569',
                        font: { weight: '500' }
                    },
                    grid: { color: '#e2e8f0' }
                },
                x: {
                    ticks: {
                        color: '#475569',
                        font: { weight: '500' }
                    },
                    grid: { display: false }
                }
            }
        }
    });
}

function renderUserChart(processed) {
    const ctx = document.getElementById("userPerformanceChart").getContext("2d");
    const noDataEl = document.getElementById("noUserData");

    const totalRaised = processed.data.reduce((sum, val) => sum + val, 0);
    if (totalRaised === 0) {
        noDataEl.style.display = "block";
        return;
    }

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: processed.labels,
            datasets: [{
                label: 'Issues Raised',
                data: processed.data,
                backgroundColor: 'rgba(59, 130, 246, 0.75)',
                borderColor: '#3b82f6',
                borderWidth: 1.5,
                borderRadius: 6,
                barPercentage: 0.6,
                maxBarThickness: 45
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: '#0f172a',
                    titleColor: '#ffffff',
                    bodyColor: '#ffffff',
                    cornerRadius: 8,
                    padding: 12
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1,
                        color: '#475569',
                        font: { weight: '500' }
                    },
                    grid: { color: '#e2e8f0' }
                },
                x: {
                    ticks: {
                        color: '#475569',
                        font: { weight: '500' },
                        maxRotation: 45,
                        minRotation: 0,
                        autoSkip: true,
                        autoSkipPadding: 10
                    },
                    grid: { display: false }
                }
            }
        }
    });
}

function showGlobalError() {
    const container = document.querySelector(".content-wrapper");
    if (container) {
        container.innerHTML = `
            <div class="card" style="padding: 40px; text-align: center; color: #dc2626; font-weight: 600;">
                Unable to load Performance Report. Please make sure the backend server is running.
            </div>
        `;
    }
}

function processSoftwareIssues(tickets) {
    const categories = ["PARADIGM", "OMEGA", "CGG", "GEOTOMO", "SCUBE", "SHARP REFLECTION", "LINUX"];
    const softwareCounts = {};

    categories.forEach(cat => {
        softwareCounts[cat] = 0;
    });

    tickets.forEach(ticket => {
        if (ticket.category) {
            const catUpper = ticket.category.toUpperCase();
            softwareCounts[catUpper] = (softwareCounts[catUpper] || 0) + 1;
        }
    });

    return {
        labels: Object.keys(softwareCounts),
        data: Object.values(softwareCounts)
    };
}

function renderSoftwareChart(processed) {
    const ctx = document.getElementById("softwareWiseIssuesChart").getContext("2d");
    const noDataEl = document.getElementById("noSoftwareData");

    const totalIssues = processed.data.reduce((sum, val) => sum + val, 0);
    if (totalIssues === 0) {
        noDataEl.style.display = "block";
        return;
    }

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: processed.labels,
            datasets: [{
                label: 'Total Issues',
                data: processed.data,
                backgroundColor: 'rgba(245, 158, 11, 0.75)',
                borderColor: '#f59e0b',
                borderWidth: 1.5,
                borderRadius: 6,
                barPercentage: 0.5
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: '#0f172a',
                    titleColor: '#ffffff',
                    bodyColor: '#ffffff',
                    cornerRadius: 8,
                    padding: 12
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1,
                        color: '#475569',
                        font: { weight: '500' }
                    },
                    grid: { color: '#e2e8f0' }
                },
                x: {
                    ticks: {
                        color: '#475569',
                        font: { weight: '500' }
                    },
                    grid: { display: false }
                }
            }
        }
    });
}
