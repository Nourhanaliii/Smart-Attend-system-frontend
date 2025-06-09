// =================== dashboard.js (Clean Start) ===================

document.addEventListener('DOMContentLoaded', () => {
    // 1. Check if user is logged in
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
        alert('You are not logged in. Redirecting...');
        window.location.href = 'home.html';
        return;
    }
    
    // 2. Setup all event listeners for the page
    setupEventListeners();

    // 3. Fetch and display data from the backend
    loadDashboardData();

    // 4. Initialize the chart with placeholder data
    initializeChart();
});

/**
 * Fetches data from the dashboard API and updates the UI.
 */
async function loadDashboardData() {
    try {
        const stats = await getDashboardStats(); // from api.js
        
        // Update the statistics cards
        updateStatCard('total-attendance-value', stats.total_attendance);
        updateStatCard('active-students-value', stats.active_students_count);
        updateStatCard('pending-requests-value', stats.pending_requests_count);
        
        // Update the notification bell
        updateNotificationBell(stats.pending_requests_count);
        
        // Render the attendance history table
        renderAttendanceHistory(stats.attendance_history);

    } catch (error) {
        console.error("Failed to load dashboard data:", error);
        alert("Could not load dashboard data. Please check the console for errors.");
    }
}

/**
 * Updates the text content of a single statistic card.
 * @param {string} elementId The ID of the <h2> element.
 * @param {string|number} value The value to display.
 */
function updateStatCard(elementId, value) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = value ?? '0';
    }
}

/**
 * Shows or hides the notification badge based on the count.
 * @param {number} count The number of pending requests.
 */
function updateNotificationBell(count) {
    const badge = document.getElementById('notification-count');
    if (!badge) return;

    if (count > 0) {
        badge.textContent = count;
        badge.style.display = 'flex';
    } else {
        badge.style.display = 'none';
    }
}

/**
 * Renders the attendance history data into the table.
 * @param {Array} history An array of attendance log objects.
 */
function renderAttendanceHistory(history) {
    const tableBody = document.getElementById('attendance-history-body');
    if (!tableBody) return;

    tableBody.innerHTML = ''; // Clear previous data
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

/**
 * Sets up all event listeners for the page.
 */
function setupEventListeners() {
    // Sidebar hamburger menu
    const hamburger = document.querySelector('.hamburger');
    const sidebar = document.querySelector('.sidebar');
    if (hamburger && sidebar) {
        hamburger.addEventListener('click', () => sidebar.classList.toggle('active'));
    }

    // Logout link
    const logoutLink = document.querySelector('a[onclick="handleLogout()"]');
    if (logoutLink) {
        logoutLink.addEventListener('click', (e) => { 
            e.preventDefault(); 
            handleLogout(); 
        });
    }
}

/**
 * Handles the logout process.
 */
async function handleLogout() {
    try {
        await logout(); // from api.js
        localStorage.clear();
        window.location.href = 'home.html';
    } catch (error) {
        alert("Logout failed.");
    }
}

/**
 * Initializes the chart with placeholder data.
 */
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