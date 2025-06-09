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
// === إدارة الكاميرا الرئيسية ===
    document.addEventListener('DOMContentLoaded', function() {
    const openCameraBtn = document.getElementById('openCameraBtn');
    const cameraModal = document.getElementById('cameraModal');
    const cameraView = document.getElementById('cameraView');
    const captureBtn = document.getElementById('captureBtn');
    const closeCamera = document.getElementById('closeCamera');
    const openLiveCamera = document.getElementById('openLiveCamera');
    const openUploadPhoto = document.getElementById('openUploadPhoto');
    const liveCameraView = document.getElementById('liveCameraView');
    const uploadPhotoView = document.getElementById('uploadPhotoView');
    const photoUpload = document.getElementById('photoUpload');
    const uploadPreview = document.getElementById('uploadPreview');
    
    let cameraStream = null;
    let capturedPhotos = [];
    let currentPhoto = null;
    let currentModalType = ''; // 'add' or 'edit' or 'main'

    // Open main camera
    openCameraBtn.addEventListener('click', function() {
        currentModalType = 'main';
        cameraModal.style.display = 'flex';
        showLiveCamera();
    });

    // Open camera for student photo
    function openCameraForStudent(type = 'add') {
        currentModalType = type;
        cameraModal.style.display = 'flex';
        showLiveCamera();
    }

    // Show live camera view
    function showLiveCamera() {
        liveCameraView.style.display = 'block';
        uploadPhotoView.style.display = 'none';
        openLiveCamera.classList.add('active');
        openUploadPhoto.classList.remove('active');
        startCamera();
    }

    // Show upload photo view
    function showUploadPhoto() {
        liveCameraView.style.display = 'none';
        uploadPhotoView.style.display = 'block';
        openLiveCamera.classList.remove('active');
        openUploadPhoto.classList.add('active');
        stopCamera();
    }

    // Start camera
    async function startCamera() {
        try {
            stopCamera(); // Stop any active camera
            
            cameraStream = await navigator.mediaDevices.getUserMedia({ 
                video: { 
                    facingMode: 'user',
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                },
                audio: false 
            });
            
            cameraView.srcObject = cameraStream;
        } catch (err) {
            console.error('Camera error:', err);
            alert('Could not access the camera. Please check permissions.');
        }
    }

    // Stop camera
    function stopCamera() {
        if (cameraStream) {
            cameraStream.getTracks().forEach(track => {
                track.stop();
            });
            cameraStream = null;
        }
        
        if (cameraView.srcObject) {
            cameraView.srcObject = null;
        }
    }

    // Capture photo
    captureBtn.addEventListener('click', function() {
        if (liveCameraView.style.display !== 'none') {
            // Capture from live camera
            const canvas = document.createElement('canvas');
            canvas.width = cameraView.videoWidth;
            canvas.height = cameraView.videoHeight;
            canvas.getContext('2d').drawImage(cameraView, 0, 0);
            
            currentPhoto = canvas.toDataURL('image/jpeg', 0.9);
            showCaptureEffect();
        }
        
        // Handle the captured/uploaded photo based on context
        if (currentModalType === 'add' || currentModalType === 'edit') {
            const previewId = currentModalType === 'add' ? 'newImagePreview' : 'editImagePreview';
            const preview = document.getElementById(previewId);
            preview.src = currentPhoto;
            preview.style.display = 'block';
            closeCameraModal();
        } else {
            // Main camera functionality
            savePhotoToDevice(currentPhoto);
        }
    });

    // Upload photo
    photoUpload.addEventListener('change', function(e) {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            
            reader.onload = function(event) {
                currentPhoto = event.target.result;
                uploadPreview.src = currentPhoto;
                uploadPreview.style.display = 'block';
            }
            
            reader.readAsDataURL(e.target.files[0]);
        }
    });

    // Close camera modal
    function closeCameraModal() {
        stopCamera();
        cameraModal.style.display = 'none';
    }

    // Event listeners
    openLiveCamera.addEventListener('click', showLiveCamera);
    openUploadPhoto.addEventListener('click', showUploadPhoto);
    closeCamera.addEventListener('click', closeCameraModal);
    cameraModal.addEventListener('click', function(e) {
        if (e.target === this) {
            closeCameraModal();
        }
    });

    // Save photo to device (for main camera)
    function savePhotoToDevice(imageData) {
        const link = document.createElement('a');
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        link.download = `photo-${timestamp}.jpg`;
        link.href = imageData;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        capturedPhotos.push(imageData);
        localStorage.setItem('capturedPhotos', JSON.stringify(capturedPhotos));
        console.log('Photo saved to device and local storage');
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