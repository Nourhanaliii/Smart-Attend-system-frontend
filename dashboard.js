// =================== dashboard.js (Final Integrated Version) ===================

document.addEventListener('DOMContentLoaded', () => {
    checkAuthAndInit();
});

function checkAuthAndInit() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
        alert('You are not logged in.');
        window.location.href = 'home.html';
        return;
    }
    setupEventListeners();
    loadDashboardData();
    initializeChart(); // لا ننسى تهيئة الرسم البياني
}

// --- 1. DATA FETCHING AND RENDERING ---
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
    if (element) element.textContent = (value !== null && value !== undefined) ? value : '0';
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
        const row = tableBody.insertRow(0); // Insert at the top
        row.innerHTML = `<td>${log.student_name}</td><td>${log.section_name}</td><td>${log.time}</td><td>${log.instructor_name}</td><td>${log.level}</td>`;
    });
}

// --- 2. EVENT LISTENERS SETUP ---
function setupEventListeners() {
    document.querySelector('.hamburger')?.addEventListener('click', () => document.querySelector('.sidebar')?.classList.toggle('active'));
    document.querySelector('a[onclick="handleLogout()"]')?.addEventListener('click', (e) => { e.preventDefault(); handleLogout(); });
    document.getElementById('notification-bell')?.addEventListener('click', toggleNotificationsPanel);
    document.getElementById('closeNotifications')?.addEventListener('click', toggleNotificationsPanel);
    
    // Camera Modal Listeners
    document.getElementById('openCameraBtn')?.addEventListener('click', openCameraModal);
    document.getElementById('closeCamera')?.addEventListener('click', closeCameraModal);
    document.getElementById('cancelCameraBtn')?.addEventListener('click', closeCameraModal);
    document.getElementById('recognizeBtn')?.addEventListener('click', handleFaceRecognition);
    document.getElementById('photoUpload')?.addEventListener('change', (e) => {
        const preview = document.getElementById('uploadPreview');
        const file = e.target.files[0];
        if (file && preview) {
            const reader = new FileReader();
            reader.onload = (event) => { preview.src = event.target.result; preview.style.display = 'block'; };
            reader.readAsDataURL(file);
        }
    });
}

// --- 3. NOTIFICATIONS LOGIC ---
function toggleNotificationsPanel(event) {
    event?.stopPropagation();
    const panel = document.getElementById('notificationPopup');
    panel.classList.toggle('active');
    if (panel.classList.contains('active')) {
        populateNotifications();
    }
}

async function populateNotifications() {
    const list = document.getElementById('notificationList');
    list.innerHTML = '<li class="notification-item">Loading...</li>';
    try {
        const requests = await getAdminNotifications();
        list.innerHTML = '';
        if (requests.length === 0) {
            list.innerHTML = '<li class="notification-item">No new requests.</li>';
            return;
        }
        requests.forEach(req => {
            const item = document.createElement('li');
            item.className = 'notification-item unread';
            item.innerHTML = `<i class="fas fa-exclamation-circle"></i><p>${req.message}</p>`;
            list.appendChild(item);
        });
    } catch (error) {
        list.innerHTML = '<li class="notification-item">Could not load notifications.</li>';
    }
}

function updateNotificationBell(count) {
    const badge = document.querySelector('.notification-count');
    if (!badge) return;
    badge.textContent = count;
    badge.style.display = count > 0 ? 'flex' : 'none';
    const bell = document.getElementById('notification-bell');
    if (count > 0) {
        bell.classList.add('pulse');
    } else {
        bell.classList.remove('pulse');
    }
}

// --- 4. CAMERA & FACE RECOGNITION ---
function openCameraModal() {
    document.getElementById('sessionIdInput').value = '';
    document.getElementById('photoUpload').value = '';
    document.getElementById('uploadPreview').style.display = 'none';
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
        
        // إضافة إشعار بنتيجة التعرف
        const notificationList = document.getElementById('notificationList');
        const item = document.createElement('li');
        item.className = 'notification-item';
        item.innerHTML = `<i class="fas fa-users"></i><p>${result.message}</p>`;
        notificationList.prepend(item);

        alert(`Success: ${result.message}`);
        
        // تحديث كل بيانات الداشبورد
        loadDashboardData();
        closeCameraModal();

    } catch (error) {
        alert(`Recognition Failed: ${error.message}`);
    } finally {
        btn.disabled = false;
        btn.innerText = 'Send';
    }
}

// --- 5. CHART & LOGOUT ---
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
async function handleLogout() {
    try {
        await logout();
        localStorage.clear();
        window.location.href = 'home.html';
    } catch (error) {
        alert("Logout failed.");
    }
}