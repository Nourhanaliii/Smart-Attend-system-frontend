// =================== dashboard.js (Final and Complete Version) ===================

document.addEventListener('DOMContentLoaded', () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
        alert('You are not logged in. Redirecting...');
        window.location.href = 'home.html';
        return;
    }
    
    // Update user info in the header
    const userAvatar = document.getElementById('user-avatar-img');
    if (user.avatar && userAvatar) {
        userAvatar.src = `${API_BASE_URL}${user.avatar}`;
    }

    setupEventListeners();
    loadDashboardData();
    initializeChart();
});

// --- Data Fetching and Rendering ---

async function loadDashboardData() {
    try {
        const stats = await getDashboardStats();
        
        updateStatCard('total-attendance-value', stats.total_attendance);
        updateStatCard('active-students-value', stats.active_students_count);
        updateStatCard('pending-requests-value', stats.pending_requests_count);
        
        updateNotificationBell(stats.pending_requests_count);
        renderAttendanceHistory(stats.attendance_history);

    } catch (error) {
        console.error("Failed to load dashboard data:", error);
        alert("Could not load dashboard data.");
    }
}

function updateStatCard(elementId, value) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = value ?? '0';
    }
}

function updateNotificationBell(count) {
    const badge = document.getElementById('notification-count');
    if (badge && count > 0) {
        badge.textContent = count;
        badge.style.display = 'flex';
    } else if (badge) {
        badge.style.display = 'none';
    }
}

function renderAttendanceHistory(history) {
    const tableBody = document.getElementById('attendance-history-body');
    if (!tableBody) return;

    tableBody.innerHTML = '';
    if (!history || history.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="5">No recent attendance history.</td></tr>';
        return;
    }

    history.forEach(log => {
        const row = tableBody.insertRow();
        row.innerHTML = `
            <td>${log.student_name}</td>
            <td>${log.section_name}</td>
            <td>${log.time}</td>
            <td>${log.instructor_name}</td>
            <td>${log.level}</td>
        `;
    });
}

// --- Event Listeners and UI ---

function setupEventListeners() {
    const hamburger = document.querySelector('.hamburger');
    const sidebar = document.querySelector('.sidebar');
    if (hamburger && sidebar) {
        hamburger.addEventListener('click', () => sidebar.classList.toggle('active'));
    }

    const logoutLink = document.querySelector('a[onclick="handleLogout()"]');
    if (logoutLink) {
        logoutLink.addEventListener('click', (e) => { e.preventDefault(); handleLogout(); });
    }

    // You can add camera event listeners here if they are not already global
}

// --- Chart Initialization (Example Data) ---
function initializeChart() {
    const ctx = document.getElementById('attendanceChart')?.getContext('2d');
    if (!ctx) return;
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: Array.from({ length: 30 }, (_, i) => i + 1),
            datasets: [{
                label: 'Attendance',
                data: [5, 10, 15, 12, 20, 18, 22, 25, 30, 10, 15, 20, 18, 16, 14, 20, 22, 8, 10, 12, 24, 28, 26, 25, 22, 18, 20, 21, 19, 20],
                borderColor: '#4b7bec',
                backgroundColor: 'rgba(75, 123, 236, 0.2)',
                fill: true
            }]
        },
        options: { responsive: true, maintainAspectRatio: false }
    });
}

// --- Logout ---
async function handleLogout() {
    try {
        await logout(); // from api.js
        localStorage.clear();
        window.location.href = 'home.html';
    } catch (error) {
        alert("Logout failed.");
    }
}