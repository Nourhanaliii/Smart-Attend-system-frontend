// =================== dashboard.js (Final Integrated Version) ===================

// --- 1. Initialization ---
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
    setupEventListeners();
    loadDashboardData();
    initializeChart();
}

// --- 2. Data Fetching and Rendering ---
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
    if (element) {
        // ✅ هذا هو التصحيح: طريقة أكثر أمانًا وتوافقًا للتحقق من القيمة.
        element.textContent = (value !== null && value !== undefined) ? value : '0';
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

// --- 3. Event Listeners Setup ---
function setupEventListeners() {
    document.querySelector('.hamburger')?.addEventListener('click', () => document.querySelector('.sidebar')?.classList.toggle('active'));
    document.querySelector('a[onclick="handleLogout()"]')?.addEventListener('click', (e) => { e.preventDefault(); handleLogout(); });
    document.getElementById('notification-bell')?.addEventListener('click', toggleNotificationsPanel);
    document.getElementById('openCameraBtn')?.addEventListener('click', openCameraModal);
    document.getElementById('closeCamera')?.addEventListener('click', closeCameraModal);
    document.getElementById('cancelCameraBtn')?.addEventListener('click', closeCameraModal);
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

// --- 4. Notifications Logic ---
function toggleNotificationsPanel(event) {
    event.stopPropagation();
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
    list.innerHTML = '<div class="notification-item">Loading...</div>';
    try {
        const requests = await getAdminNotifications();
        const recognitionResult = JSON.parse(localStorage.getItem('lastRecognition'));
        
        list.innerHTML = '';
        let hasNotifications = false;

        if (recognitionResult) {
            const item = document.createElement('div');
            item.className = 'notification-item';
            item.innerHTML = `<strong>Scan Result:</strong> ${recognitionResult.message}`;
            list.appendChild(item);
            localStorage.removeItem('lastRecognition');
            hasNotifications = true;
        }

        requests.forEach(req => {
            const item = document.createElement('div');
            item.className = 'notification-item';
            item.innerHTML = `New request from <strong>${req.student.username}</strong>. <a href="request_list.html">Review</a>`;
            list.appendChild(item);
            hasNotifications = true;
        });
        
        if (!hasNotifications) {
            list.innerHTML = '<div class="notification-item">No new notifications.</div>';
        }

        updateNotificationBell(requests.length);

    } catch (error) {
        list.innerHTML = '<div class="notification-item">Could not load notifications.</div>';
    }
}

// --- 5. Camera and Face Recognition Logic ---
function openCameraModal() {
    document.getElementById('sessionIdInput').value = '';
    document.getElementById('photoUpload').value = '';
    const preview = document.getElementById('uploadPreview');
    preview.src = '#';
    preview.style.display = 'none';
    document.getElementById('cameraModal')?.style.display = 'flex';
}

function closeCameraModal() {
    document.getElementById('cameraModal')?.style.display = 'none';
}

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
        localStorage.setItem('lastRecognition', JSON.stringify(result));
        alert(`Success: ${result.message}`);
        loadDashboardData();
        closeCameraModal();
    } catch (error) {
        alert(`Recognition Failed: ${error.message}`);
    } finally {
        btn.disabled = false;
        btn.innerText = 'Send';
    }
}

// --- 6. Chart and Logout ---
function initializeChart() { /* ... same as before ... */ }
async function handleLogout() { /* ... same as before ... */ }

