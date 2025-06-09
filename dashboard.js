// =================== dashboard.js (Final and Complete Version) ===================

document.addEventListener('DOMContentLoaded', () => {
    checkAuthAndInit();
});

function checkAuthAndInit() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
        alert('You are not logged in. Redirecting...');
        window.location.href = 'home.html';
        return;
    }
    const userAvatar = document.getElementById('user-avatar-img');
    if (user.avatar && userAvatar) {
        userAvatar.src = `${API_BASE_URL}${user.avatar}`;
    }
    setupEventListeners();
    loadDashboardData();
    initializeChart();
}

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
    }
}

function updateStatCard(elementId, value) {
    const element = document.getElementById(elementId);
    if (element) element.textContent = value ?? '0';
}

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
    document.querySelector('.hamburger')?.addEventListener('click', () => document.querySelector('.sidebar')?.classList.toggle('active'));
    document.querySelector('a[onclick="handleLogout()"]')?.addEventListener('click', (e) => { e.preventDefault(); handleLogout(); });
    document.getElementById('notification-bell')?.addEventListener('click', toggleNotificationsPanel);
    document.getElementById('openCameraBtn')?.addEventListener('click', openCameraModal);
    document.getElementById('closeCamera')?.addEventListener('click', closeCameraModal);
    document.getElementById('recognizeBtn')?.addEventListener('click', handleFaceRecognition);
    document.getElementById('photoUpload')?.addEventListener('change', e => {
        const preview = document.getElementById('uploadPreview');
        const file = e.target.files[0];
        if (file && preview) {
            const reader = new FileReader();
            reader.onload = function(event) {
                preview.src = event.target.result;
                preview.style.display = 'block';
            }
            reader.readAsDataURL(file);
        }
    });
}

function toggleNotificationsPanel(event) {
    event.stopPropagation(); // Prevent click from closing the panel immediately
    const panel = document.getElementById('notifications-panel');
    const isVisible = panel.style.display === 'block';
    if (isVisible) {
        panel.style.display = 'none';
    } else {
        populateNotifications();
        panel.style.display = 'block';
    }
}

async function populateNotifications() {
    const list = document.getElementById('notifications-list');
    list.innerHTML = '<p>Loading...</p>';
    try {
        const requests = await getAttendanceRequests();
        const recognized = JSON.parse(localStorage.getItem('lastRecognition')) || [];
        list.innerHTML = '';
        if (requests.length === 0 && recognized.length === 0) {
            list.innerHTML = '<div class="notification-item">No new notifications.</div>';
            return;
        }
        requests.forEach(req => {
            const item = document.createElement('div');
            item.className = 'notification-item';
            item.innerHTML = `New request from <strong>${req.student.username}</strong>. <a href="request_list.html">Review</a>`;
            list.appendChild(item);
        });
        recognized.forEach(rec => {
            const item = document.createElement('div');
            item.className = 'notification-item';
            item.innerHTML = `<strong>${rec.name}</strong> was marked as attended.`;
            list.appendChild(item);
        });
    } catch (error) {
        list.innerHTML = '<div class="notification-item">Could not load notifications.</div>';
    }
}

// --- Camera and Face Recognition Logic ---

function openCameraModal() { document.getElementById('cameraModal')?.style.display = 'flex'; }
function closeCameraModal() { document.getElementById('cameraModal')?.style.display = 'none'; }

async function handleFaceRecognition() {
    const sessionId = document.getElementById('sessionIdInput').value;
    const imageFile = document.getElementById('photoUpload').files[0];

    if (!sessionId || !imageFile) {
        return alert("Please provide both a Session ID and an image.");
    }

    const formData = new FormData();
    formData.append('image', imageFile);
    formData.append('session_id', sessionId);

    const btn = document.getElementById('recognizeBtn');
    btn.disabled = true;
    btn.innerText = 'Processing...';

    try {
        const result = await recognizeFaces(formData);
        alert(result.message);
        localStorage.setItem('lastRecognition', JSON.stringify(result.recognized_students));
        loadDashboardData();
        populateNotifications();
        closeCameraModal();
    } catch (error) {
        alert(`Recognition Failed: ${error.message}`);
    } finally {
        btn.disabled = false;
        btn.innerText = 'Recognize & Mark Attendance';
    }
}

// --- Chart and Logout ---
function initializeChart() { /* ... same as before ... */ }
async function handleLogout() { /* ... same as before ... */ }