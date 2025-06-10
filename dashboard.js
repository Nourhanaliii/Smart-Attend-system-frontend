// =================== dashboard.js (Final Integrated Version) ===================

// --- 1. INITIALIZATION ---

// Initialize all components when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Auth Check must be first
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
        alert('You are not logged in.');
        window.location.href = 'home.html';
        return;
    }
    
    // Initialize all UI components from your original code
    initSidebar();
    initNotifications();
    initCameraModal();
    initChart();
    
    // Fetch real data from the backend
    loadDashboardData();
});


// --- 2. DYNAMIC DATA HANDLING ---

async function loadDashboardData() {
    try {
        const stats = await getDashboardStats(); // From api.js
        updateStatCard('total-attendance-value', stats.total_attendance);
        updateStatCard('active-students-value', stats.active_students_count);
        updateStatCard('pending-requests-value', stats.pending_requests_count);
        updateNotificationBell(stats.pending_requests_count);
        renderAttendanceHistory(stats.attendance_history);
    } catch (error) {
        console.error("Failed to load dashboard data:", error);
    }
}

function updateStatCard(elementId, value) {
    const element = document.getElementById(elementId);
    if (element) element.textContent = (value !== null && value !== undefined) ? value : '...';
}

function renderAttendanceHistory(history) {
    const tableBody = document.querySelector('.attendance-history tbody');
    if (!tableBody) return;
    tableBody.innerHTML = '';
    if (!history || history.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="5">No recent history.</td></tr>';
        return;
    }
    history.forEach(log => {
        const row = tableBody.insertRow(0); // Insert new records at the top
        row.innerHTML = `<td>${log.student_name}</td><td>${log.section_name}</td><td>${log.time}</td><td>${log.instructor_name}</td><td>${log.level}</td>`;
    });
}


// --- 3. ORIGINAL UI INITIALIZERS (Your Code) ---

function initSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const hamburger = document.querySelector('.hamburger');
    if(hamburger && sidebar) hamburger.addEventListener('click', () => sidebar.classList.toggle('active'));
}

function initNotifications() {
    const bell = document.getElementById('notification-bell');
    const panel = document.getElementById('notificationPopup');
    const closeBtn = document.getElementById('closeNotifications');
    
    bell?.addEventListener('click', e => {
        e.stopPropagation();
        panel.classList.toggle('active');
        if (panel.classList.contains('active')) {
            populateNotifications();
        }
    });
    closeBtn?.addEventListener('click', () => panel.classList.remove('active'));
    document.addEventListener('click', e => {
        if (!panel?.contains(e.target) && !bell?.contains(e.target)) {
            panel?.classList.remove('active');
        }
    });
}

// ✅ This function now fetches real data
async function populateNotifications() {
    const list = document.getElementById('notificationList');
    list.innerHTML = '<li class="notification-item">Loading...</li>';
    try {
        const notifications = await getAdminNotifications();
        list.innerHTML = '';
        if (notifications.length === 0) {
            list.innerHTML = '<li class="notification-item">No new notifications.</li>';
        } else {
            notifications.forEach(notif => {
                const item = document.createElement('li');
                item.className = 'notification-item';
                const iconClass = notif.type === 'new_request' ? 'fa-exclamation-circle' : 'fa-robot';
                item.innerHTML = `<i class="fas ${iconClass}"></i><p>${notif.message}</p>`;
                list.appendChild(item);
            });
        }
    } catch (error) {
        list.innerHTML = '<li class="notification-item">Could not load notifications.</li>';
    }
}

// ✅ This function is now linked to real data
function updateNotificationBell(count) {
    const badge = document.querySelector('.notification-count');
    if (!badge) return;
    badge.textContent = count;
    badge.style.display = count > 0 ? 'flex' : 'none';
}

function initCameraModal() {
    const openCameraBtn = document.getElementById('openCameraBtn');
    const cameraModal = document.getElementById('cameraModal');
    const closeCamera = document.getElementById('closeCamera');
    const cancelCameraBtn = document.getElementById('cancelCameraBtn');
    const captureBtn = document.getElementById('captureBtn');
    
    openCameraBtn?.addEventListener('click', openCameraModal);
    closeCamera?.addEventListener('click', closeCameraModal);
    cancelCameraBtn?.addEventListener('click', closeCameraModal);
    captureBtn?.addEventListener('click', handleCaptureAndSend);
    
    // The rest of your camera logic (live camera, upload photo) can be added here if needed
}

// --- 4. DYNAMIC ACTIONS ---

async function handleCaptureAndSend() {
    const sessionId = document.getElementById('sessionIdInput').value;
    const imageFile = document.getElementById('photoUpload').files[0]; // Assuming you have an input with id="photoUpload"
    if (!sessionId || !imageFile) {
        return alert("Please provide both a Session ID and an image.");
    }
    const formData = new FormData();
    formData.append('image', imageFile);
    formData.append('session_id', sessionId);

    const btn = document.getElementById('captureBtn');
    btn.disabled = true; btn.innerText = 'Processing...';

    try {
        const result = await recognizeFaces(formData); // from api.js
        
        // Add a temporary notification to the UI
        const notificationList = document.getElementById('notificationList');
        const item = document.createElement('li');
        item.className = 'notification-item';
        item.innerHTML = `<i class="fas fa-robot"></i><p>${result.message}</p>`;
        notificationList.prepend(item);

        alert(`Success: ${result.message}`);
        
        // Refresh all dashboard data
        loadDashboardData();
        closeCameraModal();
    } catch (error) {
        alert(`Recognition Failed: ${error.message}`);
    } finally {
        btn.disabled = false; btn.innerText = 'Capture & Send';
    }
}

function openCameraModal() {
    // Reset form elements
    document.getElementById('sessionIdInput').value = '';
    document.getElementById('photoUpload').value = '';
    const preview = document.getElementById('uploadPreview');
    if (preview) {
        preview.src = '#';
        preview.style.display = 'none';
    }
    document.getElementById('cameraModal').style.display = 'flex';
}

function closeCameraModal() {
    // Your existing stopCamera() logic can be integrated here
    document.getElementById('cameraModal').style.display = 'none';
}

function initChart() {
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

function handleLogout() {
    logout().then(() => {
        localStorage.clear();
        window.location.href = 'home.html';
    }).catch(err => alert("Logout failed."));
}