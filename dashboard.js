document.addEventListener('DOMContentLoaded', () => {
    checkAuthAndInit();
});

function checkAuthAndInit() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || !user.is_staff) {
        window.location.href = 'home.html';
        return;
    }
    setupEventListeners();
    loadDashboardData();
    initializeChart();
}

async function loadDashboardData() {
    try {
        const stats = await getDashboardStats();
        updateStatCard('total-attendance-value', stats.total_attendance);
        updateStatCard('active-students-value', stats.active_students_count);
        updateStatCard('pending-requests-value', stats.pending_requests_count);
        updateNotificationBell(stats.pending_requests_count);
        renderAttendanceHistory(stats.attendance_history);
    } catch (error) { console.error("Failed to load dashboard data:", error); }
}

function updateStatCard(elementId, value) { /* ... same as before ... */ }
function renderAttendanceHistory(history) { /* ... same as before ... */ }

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
            reader.onload = function(event) { preview.src = event.target.result; preview.style.display = 'block'; }
            reader.readAsDataURL(file);
        }
    });
}

function toggleNotificationsPanel(event) {
    event.stopPropagation();
    const panel = document.getElementById('notifications-panel');
    if (panel.style.display === 'block') {
        panel.style.display = 'none';
    } else {
        populateNotifications();
        panel.style.display = 'block';
        updateNotificationBell(0); // Reset badge count when opened
    }
}

async function populateNotifications() {
    const list = document.getElementById('notifications-list');
    list.innerHTML = '<p>Loading...</p>';
    try {
        const adminNotifications = await getAdminNotifications();
        const recognitionResult = JSON.parse(localStorage.getItem('lastRecognition'));
        
        list.innerHTML = '';
        let hasNotifications = false;

        if (recognitionResult) {
            const item = document.createElement('div');
            item.className = 'notification-item';
            item.innerHTML = `<strong>Scan Result:</strong> ${recognitionResult.message}`;
            list.appendChild(item);
            localStorage.removeItem('lastRecognition'); // Clear after showing
            hasNotifications = true;
        }

        adminNotifications.forEach(req => {
            const item = document.createElement('div');
            item.className = 'notification-item';
            item.innerHTML = `New request from <strong>${req.student.username}</strong>. <a href="request_list.html">Review</a>`;
            list.appendChild(item);
            hasNotifications = true;
        });
        
        if (!hasNotifications) {
            list.innerHTML = '<div class="notification-item">No new notifications.</div>';
        }
    } catch (error) {
        list.innerHTML = '<div class="notification-item">Could not load notifications.</div>';
    }
}

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
        localStorage.setItem('lastRecognition', JSON.stringify(result)); // Store result to show in panel
        alert(`Success: ${result.message}`);
        loadDashboardData();
        closeCameraModal();
    } catch (error) {
        alert(`Recognition Failed: ${error.message}`);
    } finally {
        btn.disabled = false;
        btn.innerText = 'Recognize & Mark Attendance';
    }
}

async function handleLogout() { /* ... same as before ... */ }
function initializeChart() { /* ... same as before ... */ }