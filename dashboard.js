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
    initializeChart();
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
        const row = tableBody.insertRow();
        row.innerHTML = `<td>${log.student_name}</td><td>${log.section_name}</td><td>${log.time}</td><td>${log.instructor_name}</td><td>${log.level}</td>`;
    });
}

// --- 2. EVENT LISTENERS ---
function setupEventListeners() {
    document.querySelector('.hamburger')?.addEventListener('click', () => document.querySelector('.sidebar')?.classList.toggle('active'));
    document.querySelector('a[onclick="handleLogout()"]')?.addEventListener('click', (e) => { e.preventDefault(); handleLogout(); });
    document.getElementById('notification-bell')?.addEventListener('click', toggleNotificationsPanel);
    document.getElementById('closeNotifications')?.addEventListener('click', toggleNotificationsPanel);
    
    // Camera Modal Listeners
    document.getElementById('openCameraBtn')?.addEventListener('click', openCameraModal);
    document.getElementById('closeCamera')?.addEventListener('click', closeCameraModal);
    document.getElementById('cancelCameraBtn')?.addEventListener('click', closeCameraModal);
    document.getElementById('openLiveCamera')?.addEventListener('click', showLiveCameraView);
    document.getElementById('openUploadPhoto')?.addEventListener('click', showUploadPhotoView);
    document.getElementById('captureAndSendBtn')?.addEventListener('click', handleCaptureAndSend);
    document.getElementById('photoUpload')?.addEventListener('change', handlePhotoUpload);
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
        } else {
            requests.forEach(req => {
                const item = document.createElement('li');
                item.className = 'notification-item unread';
                item.innerHTML = `<i class="fas fa-exclamation-circle"></i><p>New request from <strong>${req.student.username}</strong></p>`;
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
    badge.style.display = count > 0 ? 'flex' : 'none';
}

// --- 4. CAMERA & FACE RECOGNITION ---
let cameraStream = null;
let currentImageBlob = null;

function openCameraModal() { document.getElementById('cameraModal').style.display = 'flex'; }
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
    } catch (err) { alert('Could not access the camera.'); }
}

function stopCamera() {
    if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
        cameraStream = null;
    }
}

function handlePhotoUpload(event) {
    const file = event.target.files[0];
    if (file) {
        currentImageBlob = file;
        const reader = new FileReader();
        reader.onload = e => {
            document.getElementById('uploadPreview').src = e.target.result;
            document.getElementById('uploadPreview').style.display = 'block';
        };
        reader.readAsDataURL(file);
    }
}

async function handleCaptureAndSend() {
    const sessionId = document.getElementById('sessionIdInput').value;
    if (!sessionId) {
        return alert("Please enter a Session ID.");
    }
    // Check if we are in upload mode and have a file, or in live camera mode
    if (document.getElementById('uploadPhotoView').style.display !== 'none') {
        if (!currentImageBlob) return alert("Please upload a photo first.");
        processRecognition(currentImageBlob, sessionId);
    } else {
        const video = document.getElementById('cameraView');
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext('2d').drawImage(video, 0, 0);
        canvas.toBlob(blob => processRecognition(blob, sessionId), 'image/jpeg');
    }
}

async function processRecognition(imageBlob, sessionId) {
    const formData = new FormData();
    formData.append('image', imageBlob);
    formData.append('session_id', sessionId);

    const btn = document.getElementById('captureAndSendBtn');
    btn.disabled = true;
    btn.innerText = 'Processing...';

    try {
        const result = await recognizeFaces(formData);
        const notificationList = document.getElementById('notificationList');
        const item = document.createElement('li');
        item.className = 'notification-item';
        item.innerHTML = `<i class="fas fa-users"></i><p>${result.message}</p>`;
        notificationList.prepend(item);
        
        alert(`Success: ${result.message}`);
        loadDashboardData();
        closeCameraModal();
    } catch (error) {
        alert(`Recognition Failed: ${error.message}`);
    } finally {
        btn.disabled = false;
        btn.innerText = 'Capture & Send';
        currentImageBlob = null;
    }
}

// --- 5. CHART & LOGOUT ---
function initializeChart() { /* ... same as before ... */ }
async function handleLogout() { /* ... same as before ... */ }