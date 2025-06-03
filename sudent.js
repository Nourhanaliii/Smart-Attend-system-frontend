// === تفعيل القائمة الجانبية ===
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
  



    // === إدارة الطلاب ===
    let students = JSON.parse(localStorage.getItem('studentsData')) || [
        { name: "Malak Ahmed", id: "2101206", password: "pass123", level: "Level 4", attendance: 5, photo: "" },
        { name: "Ali Hassan", id: "2101207", password: "pass456", level: "Level 3", attendance: 4, photo: "" },
        { name: "Sara Khalid", id: "2101208", password: "pass789", level: "Level 2", attendance: 3, photo: "" },
        { name: "Omar Saeed", id: "2101209", password: "pass101", level: "Level 4", attendance: 5, photo: "" },
        { name: "Laila Noor", id: "2101210", password: "pass202", level: "Level 1", attendance: 2, photo: "" }
    ];

    const studentsTable = document.getElementById('studentsTable');
    const addStudentModal = document.getElementById('addStudentModal');
    const editStudentModal = document.getElementById('editStudentModal');

    let editIndex = null;
    let currentPhoto = null;

    // عرض جدول الطلاب
    function renderTable(data = students) {
        if (!studentsTable) return;
        
        studentsTable.innerHTML = '';
        data.forEach((student, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>
                    <img src="${student.photo || 'https://via.placeholder.com/50?text=No+Photo'}" 
                         class="student-photo" 
                         alt="Student Photo">
                </td>
                <td>${student.name}</td>
                <td>${student.id}</td>
                <td class="password-cell">${student.password}</td>
                <td>${student.level}</td>
                <td class="rating">${'★'.repeat(student.attendance)}${'☆'.repeat(5 - student.attendance)}</td>
                <td class="actions">
                    <button class="edit" onclick="openEditModal(${index})">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="delete" onclick="deleteStudent(${index})">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </td>
            `;
            studentsTable.appendChild(row);
        });
        
        localStorage.setItem('studentsData', JSON.stringify(students));
    }


    // البحث في الهيدر العلوي
document.querySelector('.search-bar').addEventListener('input', function(e) {
    const searchTerm = e.target.value.toLowerCase();
    const filteredStudents = students.filter(student => {
        return student.name.toLowerCase().includes(searchTerm) || 
               student.id.toLowerCase().includes(searchTerm);
    });
    renderTable(filteredStudents);
});  


    // تطبيق الفلاتر
  // تطبيق الفلاتر (الإصدار المعدل)
function applyFilters() {
    const search = document.getElementById('search')?.value.toLowerCase();
    const level = document.getElementById('level')?.value;
    const attendance = document.getElementById('attendance')?.value;

    const filteredStudents = students.filter(student => {
        const matchesSearch = !search || 
            student.name.toLowerCase().includes(search) || 
            student.id.toLowerCase().includes(search);
        
        const matchesLevel = !level || student.level === level;
        const matchesAttendance = !attendance || student.attendance === parseInt(attendance);

        return matchesSearch && matchesLevel && matchesAttendance;
    });

    renderTable(filteredStudents);
}

// إعادة تعيين الفلاتر (الإصدار المعدل)
window.resetFilters = function() {
    document.getElementById('search').value = '';
    document.getElementById('level').value = '';
    document.getElementById('attendance').value = '';
    renderTable();
}

    // حذف طالب
    window.deleteStudent = function(index) {
        if (confirm('Are you sure you want to delete this student?')) {
            students.splice(index, 1);
            renderTable();
        }
    }

    // فتح نافذة إضافة طالب
    window.openAddModal = function() {
        if (!addStudentModal) return;
        
        document.getElementById('newStudentName').value = '';
        document.getElementById('newStudentID').value = '';
        document.getElementById('newStudentPassword').value = '';
        document.getElementById('newStudentLevel').value = '';
        document.getElementById('newStudentAttendance').value = '';
        
        const newImagePreview = document.getElementById('newImagePreview');
        if (newImagePreview) {
            newImagePreview.src = '';
            newImagePreview.style.display = 'none';
        }
        
        const newStudentImage = document.getElementById('newStudentImage');
        if (newStudentImage) newStudentImage.value = '';
        
        currentPhoto = null;
        addStudentModal.style.display = 'flex';
    }

    // إغلاق نافذة إضافة طالب
    window.closeAddModal = function() {
        if (addStudentModal) addStudentModal.style.display = 'none';
    }

    // فتح نافذة تعديل طالب
    window.openEditModal = function(index) {
        if (!editStudentModal) return;
        
        editIndex = index;
        const student = students[index];
        
        document.getElementById('editStudentName').value = student.name;
        document.getElementById('editStudentID').value = student.id;
        document.getElementById('editStudentPassword').value = student.password;
        document.getElementById('editStudentLevel').value = student.level;
        document.getElementById('editStudentAttendance').value = student.attendance;
        
        const editImagePreview = document.getElementById('editImagePreview');
        if (editImagePreview) {
            editImagePreview.src = student.photo || 'https://via.placeholder.com/150?text=No+Photo';
            editImagePreview.style.display = student.photo ? 'block' : 'none';
        }
        
        const editStudentImage = document.getElementById('editStudentImage');
        if (editStudentImage) editStudentImage.value = '';
        
        currentPhoto = student.photo;
        editStudentModal.style.display = 'flex';
    }

    // إغلاق نافذة تعديل طالب
    window.closeEditModal = function() {
        if (editStudentModal) editStudentModal.style.display = 'none';
    }

// معاينة الصورة قبل رفعها (للإضافة)
window.previewNewImage = function(event) {
    const input = event.target;
    const newImagePreview = document.getElementById('newImagePreview');
    const uploadLabel = document.getElementById('newUploadLabel');
    
    if (input.files && input.files[0] && newImagePreview) {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            currentPhoto = e.target.result;
            newImagePreview.src = currentPhoto;
            newImagePreview.style.display = 'block';
            if (uploadLabel) uploadLabel.textContent = 'Change Photo';
        }
        
        reader.readAsDataURL(input.files[0]);
    }
}

// معاينة الصورة قبل رفعها (للتعديل)
window.previewEditImage = function(event) {
    const input = event.target;
    const editImagePreview = document.getElementById('editImagePreview');
    const editUploadLabel = document.getElementById('editUploadLabel');
    
    if (input.files && input.files[0] && editImagePreview) {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            currentPhoto = e.target.result;
            editImagePreview.src = currentPhoto;
            editImagePreview.style.display = 'block';
            if (editUploadLabel) editUploadLabel.textContent = 'Change Photo';
        }
        
        reader.readAsDataURL(input.files[0]);
    }
}
    // إضافة طالب جديد
    window.addStudent = function() {
        const name = document.getElementById('newStudentName')?.value.trim();
        const id = document.getElementById('newStudentID')?.value.trim();
        const password = document.getElementById('newStudentPassword')?.value.trim();
        const level = document.getElementById('newStudentLevel')?.value;
        const attendance = document.getElementById('newStudentAttendance')?.value;

        if (!name || !id || !password || !level || !attendance) {
            alert("Please fill in all required fields.");
            return;
        }

        if (attendance < 1 || attendance > 5) {
            alert("Attendance must be between 1 and 5.");
            return;
        }

        const newStudent = {
            name,
            id,
            password,
            level,
            attendance: parseInt(attendance),
            photo: currentPhoto || ''
        };

        students.push(newStudent);
        renderTable();
        closeAddModal();
    }

    // حفظ تعديلات الطالب
    window.saveStudentEdit = function() {
        const name = document.getElementById('editStudentName')?.value.trim();
        const id = document.getElementById('editStudentID')?.value.trim();
        const password = document.getElementById('editStudentPassword')?.value.trim();
        const level = document.getElementById('editStudentLevel')?.value;
        const attendance = document.getElementById('editStudentAttendance')?.value;

        if (!name || !id || !password || !level || !attendance) {
            alert("Please fill in all required fields.");
            return;
        }

        if (attendance < 1 || attendance > 5) {
            alert("Attendance must be between 1 and 5.");
            return;
        }

        students[editIndex] = {
            name,
            id,
            password,
            level,
            attendance: parseInt(attendance),
            photo: currentPhoto || students[editIndex].photo || ''
        };

        renderTable();
        closeEditModal();
    }

    // أحداث الفلاتر
    const searchInput = document.getElementById('search');
    const levelSelect = document.getElementById('level');
    const attendanceSelect = document.getElementById('attendance');

    if (searchInput) searchInput.addEventListener('input', applyFilters);
    if (levelSelect) levelSelect.addEventListener('change', applyFilters);
    if (attendanceSelect) attendanceSelect.addEventListener('change', applyFilters);

    // التحميل الأولي
    renderTable();
