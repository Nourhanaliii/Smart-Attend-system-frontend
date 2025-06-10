 // Initialize notification system
        const initNotifications = () => {
            const notificationBell = document.querySelector('.notification-bell');
            const notificationPopup = document.getElementById('notificationPopup');
            const closeNotifications = document.getElementById('closeNotifications');
            const notificationList = document.getElementById('notificationList');
            const notificationCount = document.querySelector('.notification-count');
            
            // Load notification state from localStorage
            const loadNotificationState = () => {
                const readNotifications = JSON.parse(localStorage.getItem('readNotifications')) || [];
                const notificationItems = notificationList.querySelectorAll('.notification-item');
                
                notificationItems.forEach(item => {
                    const id = item.getAttribute('data-id');
                    if (readNotifications.includes(id)) {
                        item.classList.remove('unread');
                        item.classList.add('read');
                    } else {
                        item.classList.add('unread');
                        item.classList.remove('read');
                    }
                });
                
                updateNotificationCount();
            };
            
            // Update notification badge count
            const updateNotificationCount = () => {
                const unreadItems = notificationList.querySelectorAll('.notification-item.unread').length;
                notificationCount.textContent = unreadItems;
                
                if (unreadItems > 0) {
                    notificationCount.style.display = 'flex';
                    notificationBell.classList.add('pulse');
                } else {
                    notificationCount.style.display = 'none';
                    notificationBell.classList.remove('pulse');
                }
            };
            
            // Mark notification as read
            const markNotificationAsRead = (id) => {
                const readNotifications = JSON.parse(localStorage.getItem('readNotifications') )|| [];
                if (!readNotifications.includes(id)) {
                    readNotifications.push(id);
                    localStorage.setItem('readNotifications', JSON.stringify(readNotifications));
                    
                    const notificationItem = document.querySelector(`.notification-item[data-id="${id}"]`);
                    if (notificationItem) {
                        notificationItem.classList.remove('unread');
                        notificationItem.classList.add('read');
                        updateNotificationCount();
                    }
                }
            };
            
            // Toggle notification popup
            const toggleNotificationPopup = () => {
                notificationPopup.classList.toggle('active');
                
                if (notificationPopup.classList.contains('active')) {
                    // Add a small delay for animation effect
                    setTimeout(() => {
                        notificationPopup.style.transform = 'translateY(0)';
                        notificationPopup.style.opacity = '1';
                    }, 10);
                }
            };
            
            // Event listeners
            notificationBell.addEventListener('click', (e) => {
                e.stopPropagation();
                toggleNotificationPopup();
            });
            
            closeNotifications.addEventListener('click', () => {
                notificationPopup.classList.remove('active');
            });
            
            document.addEventListener('click', (e) => {
                if (!notificationPopup.contains(e.target)) {
                    notificationPopup.classList.remove('active');
                }
            });
            
            notificationList.addEventListener('click', (e) => {
                const item = e.target.closest('.notification-item');
                if (item) {
                    const id = item.getAttribute('data-id');
                    markNotificationAsRead(id);
                }
            });
            
            // Initialize notifications
            loadNotificationState();
            
            // Add a new notification for demonstration
            setTimeout(() => {
                const newNotification = document.createElement('li');
                newNotification.className = 'notification-item unread';
                newNotification.setAttribute('data-id', '6');
                newNotification.innerHTML = `
                    <i class="fas fa-clock"></i>
                    <p>Class starting in 5 minutes: Web Development</p>
                `;
                notificationList.prepend(newNotification);
                updateNotificationCount();
            }, 5000);
            
            // Return functions for external access
            return { updateNotificationCount, markNotificationAsRead };
        };
        
        // Initialize sidebar
        const initSidebar = () => {
            const sidebar = document.querySelector('.sidebar');
            const hamburger = document.querySelector('.hamburger');
            
            hamburger.addEventListener('click', () => {
                sidebar.classList.toggle('active');
            });
        };
        
        // Initialize camera modal
        const initCameraModal = () => {
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
            const sessionIdInput = document.getElementById('sessionId');
            
            let cameraStream = null;
            
            openCameraBtn.addEventListener('click', function() {
                cameraModal.style.display = 'flex';
                sessionIdInput.value = '';
                showLiveCamera();
            });
            
            closeCamera.addEventListener('click', closeCameraModal);
            
            function showLiveCamera() {
                liveCameraView.style.display = 'block';
                uploadPhotoView.style.display = 'none';
                openLiveCamera.classList.add('active');
                openUploadPhoto.classList.remove('active');
                startCamera();
            }
            
            function showUploadPhoto() {
                liveCameraView.style.display = 'none';
                uploadPhotoView.style.display = 'block';
                openLiveCamera.classList.remove('active');
                openUploadPhoto.classList.add('active');
                stopCamera();
            }
            
            async function startCamera() {
                try {
                    stopCamera();
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
            
            function stopCamera() {
                if (cameraStream) {
                    cameraStream.getTracks().forEach(track => track.stop());
                    cameraStream = null;
                }
                if (cameraView.srcObject) {
                    cameraView.srcObject = null;
                }
            }
            
            captureBtn.addEventListener('click', function() {
                if (!sessionIdInput.value) {
                    alert('Please enter a Session ID before capturing');
                    return;
                }
                
                if (liveCameraView.style.display !== 'none') {
                    const canvas = document.createElement('canvas');
                    canvas.width = cameraView.videoWidth;
                    canvas.height = cameraView.videoHeight;
                    canvas.getContext('2d').drawImage(cameraView, 0, 0);
                    
                    const photoData = canvas.toDataURL('image/jpeg', 0.9);
                    showCaptureEffect();
                    
                    console.log('Photo captured for session:', sessionIdInput.value);
                    alert('Attendance captured successfully!');
                    closeCameraModal();
                } else if (uploadPreview.style.display !== 'none') {
                    console.log('Photo uploaded for session:', sessionIdInput.value);
                    alert('Attendance uploaded successfully!');
                    closeCameraModal();
                }
            });
            
            photoUpload.addEventListener('change', function(e) {
                if (e.target.files && e.target.files[0]) {
                    const reader = new FileReader();
                    reader.onload = function(event) {
                        uploadPreview.src = event.target.result;
                        uploadPreview.style.display = 'block';
                    }
                    reader.readAsDataURL(e.target.files[0]);
                }
            });
            
            function closeCameraModal() {
                stopCamera();
                cameraModal.style.display = 'none';
            }
            
            openLiveCamera.addEventListener('click', showLiveCamera);
            openUploadPhoto.addEventListener('click', showUploadPhoto);
            cameraModal.addEventListener('click', function(e) {
                if (e.target === this) closeCameraModal();
            });
            
            function showCaptureEffect() {
                const flash = document.createElement('div');
                flash.style.position = 'fixed';
                flash.style.top = '0';
                flash.style.left = '0';
                flash.style.width = '100%';
                flash.style.height = '100%';
                flash.style.backgroundColor = 'white';
                flash.style.opacity = '0.8';
                flash.style.zIndex = '2000';
                flash.style.animation = 'fadeOut 0.5s forwards';
                document.body.appendChild(flash);
                setTimeout(() => document.body.removeChild(flash), 500);
            }
        };
        
        // Initialize chart
        const initChart = () => {
            const ctx = document.getElementById('attendanceChart').getContext('2d');
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
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        x: {
                            ticks: {
                                autoSkip: true,
                                maxTicksLimit: 7
                            }
                        }
                    }
                }
            });
        };
        
        // Initialize search
        const initSearch = () => {
            document.querySelector('.search-bar').addEventListener('input', function(e) {
                const term = e.target.value.toLowerCase();
                document.querySelectorAll('tbody tr').forEach(row => {
                    row.style.display = row.textContent.toLowerCase().includes(term) ? '' : 'none';
                });
            });
        };
        
        // Logout function
        const logoutUser = () => {
            alert('You have been logged out!');
            window.location.href = 'home.html';
        };
        
        // Initialize all components
        document.addEventListener('DOMContentLoaded', () => {
            initSidebar();
            initNotifications();
            initCameraModal();
            initChart();
            initSearch();
        });