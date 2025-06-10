// Initialize dashboard with API data
const initDashboard = async () => {
    try {
        // Load stats data
        const stats = await getDashboardStats();
        updateDashboardCards(stats);
        updateAttendanceHistory(stats.attendance_history);
        
        // Load notifications
        const notifications = await getAdminNotifications();
        updateNotifications(notifications);
        
    } catch (error) {
        console.error("Failed to load dashboard data:", error);
        alert("Failed to load dashboard data. Please try again.");
    }
};

// Update dashboard cards with stats
const updateDashboardCards = (stats) => {
    document.querySelector('.dashboard-card:nth-child(1) h2').textContent = stats.total_attendance;
    document.querySelector('.dashboard-card:nth-child(2) h2').textContent = stats.active_students_count;
    document.querySelector('.dashboard-card:nth-child(4) h2').textContent = stats.pending_requests_count;
};

// Update attendance history table
const updateAttendanceHistory = (history) => {
    const tbody = document.querySelector('.attendance-history tbody');
    tbody.innerHTML = '';
    
    history.forEach(record => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${record.student_name}</td>
            <td>${record.section_name}</td>
            <td>${record.time}</td>
            <td>${record.instructor_name}</td>
            <td>Level ${record.level}</td>
        `;
        tbody.appendChild(row);
    });
};

// Update notifications
const updateNotifications = (notifications) => {
    const notificationList = document.getElementById('notificationList');
    const notificationCount = document.querySelector('.notification-count');
    
    notificationList.innerHTML = '';
    let unreadCount = 0;
    
    notifications.forEach(notif => {
        const item = document.createElement('li');
        item.className = `notification-item ${notif.read ? 'read' : 'unread'}`;
        item.setAttribute('data-id', notif.id);
        item.innerHTML = `
            <i class="fas ${getNotificationIcon(notif.type)}"></i>
            <p>${notif.message}</p>
        `;
        notificationList.appendChild(item);
        
        if (!notif.read) unreadCount++;
    });
    
    notificationCount.textContent = unreadCount;
    notificationCount.style.display = unreadCount > 0 ? 'flex' : 'none';
};

// Helper function to get icon based on notification type
const getNotificationIcon = (type) => {
    const icons = {
        'new_request': 'fa-user-plus',
        'recognition_result': 'fa-camera',
        'attendance_approved': 'fa-check-circle',
        'attendance_denied': 'fa-times-circle',
        'default': 'fa-bell'
    };
    return icons[type] || icons.default;
};

// Modify camera modal functions to use face recognition API
const initCameraModal = () => {
    // ... (الكود السابق يبقى كما هو حتى captureBtn event listener)
    
    captureBtn.addEventListener('click', async function() {
        if (!sessionIdInput.value) {
            alert('Please enter a Session ID');
            return;
        }
        
        try {
            let imageFile;
            
            if (liveCameraView.style.display !== 'none') {
                // Capture from live camera
                const canvas = document.createElement('canvas');
                canvas.width = cameraView.videoWidth;
                canvas.height = cameraView.videoHeight;
                canvas.getContext('2d').drawImage(cameraView, 0, 0);
                
                canvas.toBlob(async (blob) => {
                    imageFile = new File([blob], 'capture.jpg', { type: 'image/jpeg' });
                    await processFaceRecognition(imageFile);
                }, 'image/jpeg', 0.9);
                
            } else if (uploadPreview.style.display !== 'none') {
                // Use uploaded photo
                const fileInput = document.getElementById('photoUpload');
                if (fileInput.files.length > 0) {
                    imageFile = fileInput.files[0];
                    await processFaceRecognition(imageFile);
                }
            }
            
        } catch (error) {
            console.error("Face recognition error:", error);
            alert("Failed to process attendance. Please try again.");
        }
    });
    
    // Process face recognition and update UI
    const processFaceRecognition = async (imageFile) => {
        const response = await recognizeFaces(imageFile, sessionIdInput.value);
        
        // Update notifications with recognition message
        const notifications = await getAdminNotifications();
        updateNotifications(notifications);
        
        // Refresh dashboard stats
        const stats = await getDashboardStats();
        updateDashboardCards(stats);
        updateAttendanceHistory(stats.attendance_history);
        
        showCaptureEffect();
        alert(response.message);
        closeCameraModal();
    };
    
    // ... (بقية الكود يبقى كما هو)
};

// Initialize all components
document.addEventListener('DOMContentLoaded', () => {
    initSidebar();
    initNotifications();
    initCameraModal();
    initChart();
    initSearch();
    initDashboard(); // Load initial data
});