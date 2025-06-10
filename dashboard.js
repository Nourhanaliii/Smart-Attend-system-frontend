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
    
    initSidebar();
    initNotifications();
    initCameraModal();
    initChart();
    
    loadDashboardData();
}

// --- 1. DATA & UI ---
async function loadDashboardData() {
    try {
        const stats = await getDashboardStats();
        updateStatCard('total-attendance-value', stats.total_attendance);
        updateStatCard('active-students-value', stats.active_students_count);
        updateStatCard('pending-requests-value', stats.pending_requests_count);
        updateNotificationBell(stats.pending_requests_count);
        renderAttendanceHistory(stats.attendance_history);
    } catch (error) {
        console.error("Dashboard data error:", error);
    }
}

function updateStatCard(elementId, value) {
    const element = document.getElementById(elementId);
    if (element) element.textContent = (value !== null && value !== undefined) ? value : '...';
}

function renderAttendanceHistory(history) {
    const tableBody = document.getElementById('attendance-history-body');
    if (!tableBody) return;

    tableBody.innerHTML = '';
    if (!history || history.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="5">No recent history.</td></tr>';
        return;
    }
    history.forEach(log => {
        const row = tableBody.insertRow(0);
        row.innerHTML = `<td>${log.student_name}</td><td>${log.section_name}</td><td>${log.time}</td><td>${log.instructor_name}</td><td>${log.level}</td>`;
    });
}

// --- 2. INITIALIZERS from your original code ---
function initSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const hamburger = document.querySelector('.hamburger');
    if(hamburger && sidebar) hamburger.addEventListener('click', () => {
        sidebar.classList.toggle('active');
    });
}

function initNotifications() {
    const bell = document.getElementById('notification-bell');
    const panel = document.getElementById('notificationPopup');
    const closeBtn = document.getElementById('closeNotifications');
    
    bell?.addEventListener('click', (e) => {
        e.stopPropagation();
        panel.classList.toggle('active');
        if (panel.classList.contains('active')) {
            populateNotifications();
            updateNotificationBell(0);
        }
    });
    
    closeBtn?.addEventListener('click', () => panel.classList.remove('active'));
    document.addEventListener('click', (e) => {
        if (!panel?.contains(e.target) && !bell?.contains(e.target)) {
            panel?.classList.remove('active');
        }
    });
}

function initCameraModal() {
    const openCameraBtn = document.getElementById('openCameraBtn');
    const cameraModal = document.getElementById('cameraModal');
    const closeCamera = document.getElementById('closeCamera');
    const cancelCameraBtn = document.getElementById('cancelCameraBtn');
    const captureBtn = document.getElementById('captureBtn');
    const openLiveCamera = document.getElementById('openLiveCamera');
    const openUploadPhoto = document.getElementById('openUploadPhoto');
    const photoUpload = document.getElementById('photoUpload');

    openCameraBtn?.addEventListener('click', openCameraModal);
    closeCamera?.addEventListener('click', closeCameraModal);
    cancelCameraBtn?.addEventListener('click', closeCameraModal);
    openLiveCamera?.addEventListener('click', showLiveCameraView);
    openUploadPhoto?.addEventListener('click', showUploadPhotoView);
    captureBtn?.addEventListener('click', handleCaptureAndSend);
    photoUpload?.addEventListener('change', handlePhotoUpload);
}

// --- 3. DYNAMIC LOGIC (Notifications, Camera) ---
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

function updateNotificationBell(count) {
    const badge = document.querySelector('.notification-count');
    if (!badge) return;
    badge.textContent = count;
    const bell = document.getElementById('notification-bell');
    if (count > 0) {
        badge.style.display = 'flex';
        bell?.classList.add('pulse');
    } else {
        badge.style.display = 'none';
        bell?.classList.remove('pulse');
    }
}

let cameraStream = null;
let currentImageBlob = null;

function openCameraModal() { document.getElementById('cameraModal').style.display = 'flex'; showLiveCameraView(); }
function closeCameraModal() { document.getElementById('cameraModal').style.display = 'none'; stopCamera(); }

function showLiveCameraView() {
    document.getElementById('liveCameraView').style.display = 'block';
    document.getElementById('uploadPhotoView').style.display = 'none';
    document.getElementById('openLiveCamera').classList.add('active');
    document.getElementById('openUploadPhoto').classList.remove('active');
    startCamera();
}

function showUploadPhotoView() {
    document.getElementById('liveCameraView').style.display = 'none';
    document.getElementById('uploadPhotoView').style.display = 'block';
    document.getElementById('openLiveCamera').classList.remove('active');
    document.getElementById('openUploadPhoto').classList.add('active');
    stopCamera();
}

async function startCamera() {
    try {
        stopCamera();
        cameraStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
        document.getElementById('cameraView').srcObject = cameraStream;
    } catch (err) { alert('Could not access camera.'); }
}

function stopCamera() {
    if (cameraStream) cameraStream.getTracks().forEach(track => track.stop());
}

function handlePhotoUpload(event) {
    const file = event.target.files[0];
    if (file) {
        currentImageBlob = file;
        const reader = new FileReader();
        reader.onload = e => { document.getElementById('uploadPreview').src = e.target.result; };
        reader.readAsDataURL(file);
        document.getElementById('uploadPreview').style.display = 'block';
    }
}

async function handleCaptureAndSend() {
    const sessionId = document.getElementById('sessionIdInput').value;
    if (!sessionId) return alert("Please enter a Session ID.");

    let imageToSend = null;
    if (document.getElementById('uploadPhotoView').style.display !== 'none') {
        if (!currentImageBlob) return alert("Please upload a photo first.");
        imageToSend = currentImageBlob;
    } else {
        const video = document.getElementById('cameraView');
        if (!video.srcObject) return alert("Live camera is not active.");
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth; canvas.height = video.videoHeight;
        canvas.getContext('2d').drawImage(video, 0, 0);
        imageToSend = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg'));
    }
    processRecognition(imageToSend, sessionId);
}

async function processRecognition(imageBlob, sessionId) {
    const formData = new FormData();
    formData.append('image', imageBlob);
    formData.append('session_id', sessionId);

    const btn = document.getElementById('captureBtn');
    btn.disabled = true; btn.innerText = 'Processing...';

    try {
        const result = await recognizeFaces(formData);
        alert(`Success: ${result.message}`);
        loadDashboardData();
        populateNotifications();
        closeCameraModal();
    } catch (error) {
        alert(`Recognition Failed: ${error.message}`);
    } finally {
        btn.disabled = false; btn.innerText = 'Send';
        currentImageBlob = null;
    }
}

// --- 4. CHART & LOGOUT ---
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
                borderColor: '#4b7bec', backgroundColor: 'rgba(75, 123, 236, 0.2)', fill: true
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