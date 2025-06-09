// =================== dashboard.js (Final Integrated Version) ===================

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

// --- Data Fetching and Rendering ---
async function loadDashboardData() { /* ... same as before ... */ }
function updateStatCard(id, value) { /* ... same as before ... */ }
function updateNotificationBell(count) { /* ... same as before ... */ }
function renderAttendanceHistory(history) { /* ... same as before ... */ }

// --- Event Listeners and UI ---
function setupEventListeners() {
    // General UI
    document.querySelector('.hamburger')?.addEventListener('click', () => document.querySelector('.sidebar')?.classList.toggle('active'));
    document.querySelector('a[onclick="handleLogout()"]')?.addEventListener('click', (e) => { e.preventDefault(); handleLogout(); });
    
    // Notifications
    document.getElementById('notification-bell')?.addEventListener('click', toggleNotificationsPanel);
    
    // Camera
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

// --- Notifications Logic ---
function toggleNotificationsPanel(event) { /* ... same as before ... */ }
async function populateNotifications() { /* ... same as before ... */ }

// --- Camera and Face Recognition Logic ---
function openCameraModal() {
    // Reset the form inside the modal
    document.getElementById('sessionIdInput').value = '';
    document.getElementById('photoUpload').value = '';
    const preview = document.getElementById('uploadPreview');
    preview.src = '#';
    preview.style.display = 'none';
    
    // Show the modal
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
        const result = await recognizeFaces(formData); // from api.js
        
        // Store result in localStorage to be displayed in the notification panel
        localStorage.setItem('lastRecognition', JSON.stringify(result));
        
        alert(`Success: ${result.message}`);
        
        // Refresh dashboard data and notifications
        loadDashboardData();
        
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