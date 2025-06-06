const sidebar = document.querySelector('.sidebar');
const hamburger = document.querySelector('.hamburger');

hamburger.addEventListener('click', () => {
    sidebar.classList.toggle('active');
});

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
  
    // Flash effect
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
        
        setTimeout(() => {
            document.body.removeChild(flash);
        }, 500);
    }
  
    // Load saved photos
    function loadSavedPhotos() {
        const savedPhotos = localStorage.getItem('capturedPhotos');
        if (savedPhotos) {
            capturedPhotos = JSON.parse(savedPhotos);
            console.log('Loaded saved photos:', capturedPhotos.length);
        }
    }
    
    loadSavedPhotos();
  });
  
    
  

// === تعريف دالة تسجيل الخروج ===
function logoutUser() {
    // تنفيذ عملية تسجيل الخروج
    alert('You have been logged out!');
    // إعادة التوجيه إلى صفحة تسجيل الدخول
    window.location.href = 'home.html';
}



const daysOrder = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'];
        let currentWeek = 1;

        const baseCourses = {
            'Saturday': { '10:00': { name: 'Computer Graphics', color: '#00cec9' } },
            'Sunday': { '14:00': { name: 'Network', color: '#e84393' } },
            'Monday': { 
                '09:00': { name: 'Math 1', color: '#3498db' },
                '11:00': { name: 'AI', color: '#e74c3c' }
            },
            'Tuesday': { '16:00': { name: 'Software', color: '#e67e22' } },
            'Wednesday': { '10:00': { name: 'Machine Learning', color: '#2ecc71' } },
            'Thursday': { '13:00': { name: 'UI/UX', color: '#9b59b6' } }
        };

        const courses = { 1: {}, 2: {}, 3: {} };

        // Initialize weeks
        for (let week = 1; week <= 3; week++) {
            daysOrder.forEach(day => {
                courses[week][day] = {};
                if (baseCourses[day]) {
                    Object.entries(baseCourses[day]).forEach(([time, course]) => {
                        courses[week][day][time] = [{
                            name: course.name,
                            color: course.color
                        }];
                    });
                }
            });
        }

        document.getElementById('addCourseBtn').addEventListener('click', () => {
            document.getElementById('popup-overlay').style.display = 'flex';
        });

        document.getElementById('closePopup').addEventListener('click', () => {
            document.getElementById('popup-overlay').style.display = 'none';
        });

        document.getElementById('courseForm').addEventListener('submit', (e) => {
            e.preventDefault();
            addCourse();
        });

        function addCourse() {
            const week = parseInt(document.getElementById('courseWeek').value);
            const day = document.getElementById('courseDay').value;
            let time = document.getElementById('courseTime').value;
            const name = document.getElementById('courseName').value;

            // Convert time format (HH:MM AM/PM to HH:MM)
            time = time.slice(0, 5);
            
            if (!courses[week][day][time]) {
                courses[week][day][time] = [];
            }

            courses[week][day][time].push({
                name,
                color: '#000080'
            });

            updateSchedule();
            document.getElementById('popup-overlay').style.display = 'none';
            document.getElementById('courseForm').reset();
        }

        function updateSchedule() {
            const tbody = document.querySelector('#scheduleTable tbody');
            tbody.innerHTML = '';

            for (let hour = 8; hour <= 18; hour++) {
                const row = document.createElement('tr');
                row.innerHTML = `<td>${hour}:00</td><td></td><td></td><td></td><td></td><td></td><td></td>`;

                daysOrder.forEach((day, index) => {
                    const time = `${hour}:00`;
                    const cell = row.children[index + 1];
                    
                    if (courses[currentWeek][day]?.[time]) {
                        courses[currentWeek][day][time].forEach(course => {
                            const courseDiv = document.createElement('div');
                            courseDiv.className = 'course-event';
                            courseDiv.textContent = course.name;
                            courseDiv.style.backgroundColor = course.color;

                            // Highlight functionality
                            courseDiv.addEventListener('mouseover', () => {
                                row.firstElementChild.classList.add('highlight');
                                document.querySelector(`th:nth-child(${index + 2})`).classList.add('highlight');
                            });

                            courseDiv.addEventListener('mouseout', () => {
                                row.firstElementChild.classList.remove('highlight');
                                document.querySelector(`th:nth-child(${index + 2})`).classList.remove('highlight');
                            });

                            cell.appendChild(courseDiv);
                        });
                    }
                });

                tbody.appendChild(row);
            }
        }

        document.getElementById('prevWeek').addEventListener('click', () => {
            if (currentWeek > 1) {
                currentWeek--;
                document.getElementById('currentWeek').textContent = `Week ${currentWeek}`;
                updateSchedule();
            }
        });

        document.getElementById('nextWeek').addEventListener('click', () => {
            if (currentWeek < 3) {
                currentWeek++;
                document.getElementById('currentWeek').textContent = `Week ${currentWeek}`;
                updateSchedule();
            }
        });

        // Initial update
        updateSchedule();