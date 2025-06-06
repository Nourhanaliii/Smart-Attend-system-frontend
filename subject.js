// دالة لإدارة القائمة الجانبية
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
          const previewId = currentModalType === 'add' ? 'preview' : 'editPreview';
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

// متغير لتخزين الكورسات
let courses = [
    {
        id: 1,
        name: 'AI',
        image: 'Ai.jpeg',
        instructor: 'Dr. Ahmed Ali',
        day: 'Monday',
        time: '10:00',
        level: 3,
        sessions: 12,
        startDate: '2023-10-01'
    },
    {
        id: 2,
        name: 'Software',
        image: 'software.jpeg',
        instructor: 'Prof. Sarah Smith',
        day: 'Tuesday',
        time: '14:30',
        level: 2,
        sessions: 10,
        startDate: '2023-10-02'
    },
    {
        id: 3,
        name: 'Network',
        image: 'network.jpeg',
        instructor: 'Eng. Omar Hassan',
        day: 'Wednesday',
        time: '09:00',
        level: 4,
        sessions: 8,
        startDate: '2023-10-03'
    },
    {
        id: 4,
        name: 'UI/UX',
        image: 'ui ux.jpeg',
        instructor: 'Designer Layla Ahmed',
        day: 'Thursday',
        time: '11:00',
        level: 1,
        sessions: 6,
        startDate: '2023-10-04'
    },
    {
        id: 5,
        name: 'Computer Graphic',
        image: 'Computer.jpeg',
        instructor: 'Dr. Mohammed Khalid',
        day: 'Friday',
        time: '13:00',
        level: 3,
        sessions: 10,
        startDate: '2023-10-05'
    },
    {
        id: 6,
        name: 'Machine Learning',
        image: 'ml.jpeg',
        instructor: 'Prof. Fatima Mahmoud',
        day: 'Saturday',
        time: '15:00',
        level: 4,
        sessions: 12,
        startDate: '2023-10-06'
    }
];

// عرض الكورسات عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    renderCourses();
});

// عرض الكورسات في الشبكة
function renderCourses() {
    const courseGrid = document.getElementById('courseGrid');
    courseGrid.innerHTML = '';
    
    courses.forEach(course => {
        const courseCard = document.createElement('div');
        courseCard.className = 'course-card';
        courseCard.innerHTML = `
            <div class="level-badge">${course.level}</div>
            <img src="${course.image}" alt="${course.name}">
            <h3>${course.name}</h3>
            <div class="course-details">
                <p><i class="fas fa-chalkboard-teacher"></i>Instructor: ${course.instructor}</p>
                <p><i class="far fa-calendar-alt"></i>Schedule: ${course.day} at ${formatTime(course.time)}</p>
                <p><i class="fas fa-layer-group"></i>Level: ${course.level}</p>
                <p><i class="fas fa-clock"></i>Sessions: ${course.sessions}</p>
                <p><i class="far fa-calendar-check"></i>Start Date: ${formatDate(course.startDate)}</p>
            </div>
            <button class="edit-btn" onclick="openEditModal(${course.id})">Edit</button>
        `;
        courseGrid.appendChild(courseCard);
    });
}

// فتح نافذة إضافة كورس جديد
function openModal() {
    document.getElementById('addModal').style.display = 'block';
}

// إغلاق نافذة إضافة كورس جديد
function closeModal() {
    document.getElementById('addModal').style.display = 'none';
    document.getElementById('courseForm').reset();
    document.getElementById('preview').style.display = 'none';
}

// معاينة الصورة قبل رفعها
function previewImage(event) {
    const reader = new FileReader();
    reader.onload = function() {
        const preview = document.getElementById('preview');
        preview.style.display = 'block';
        preview.src = reader.result;
    };
    reader.readAsDataURL(event.target.files[0]);
}

// معاينة الصورة في نافذة التعديل
function previewEditImage(event) {
    const reader = new FileReader();
    reader.onload = function() {
        const preview = document.getElementById('editPreview');
        preview.style.display = 'block';
        preview.src = reader.result;
    };
    reader.readAsDataURL(event.target.files[0]);
}

// إضافة كورس جديد
function addCourse(e) {
    e.preventDefault();
    
    const courseName = document.getElementById('courseName').value;
    const level = document.getElementById('level').value;
    const sessions = document.getElementById('sessions').value;
    const startDate = document.getElementById('startDate').value;
    const instructor = document.getElementById('instructor').value;
    const day = document.getElementById('day').value;
    const time = document.getElementById('time').value;
    const imageSrc = document.getElementById('preview').src || 'default-course.jpg';
    
    const newCourse = {
        id: courses.length + 1,
        name: courseName,
        image: imageSrc,
        instructor: instructor,
        day: day,
        time: time,
        level: parseInt(level),
        sessions: parseInt(sessions),
        startDate: startDate
    };
    
    courses.push(newCourse);
    renderCourses();
    closeModal();
}

// فتح نافذة تعديل الكورس
function openEditModal(courseId) {
    const course = courses.find(c => c.id === courseId);
    if (!course) return;
    
    document.getElementById('editCourseId').value = course.id;
    document.getElementById('editCourseName').value = course.name;
    document.getElementById('editLevel').value = course.level;
    document.getElementById('editSessions').value = course.sessions;
    document.getElementById('editStartDate').value = course.startDate;
    document.getElementById('editInstructor').value = course.instructor;
    document.getElementById('editDay').value = course.day;
    document.getElementById('editTime').value = course.time;
    
    const preview = document.getElementById('editPreview');
    preview.src = course.image;
    preview.style.display = 'block';
    
    document.getElementById('editModal').style.display = 'block';
}

// إغلاق نافذة تعديل الكورس
function closeEditModal() {
    document.getElementById('editModal').style.display = 'none';
}

// تحديث بيانات الكورس
function updateCourse(e) {
    e.preventDefault();
    
    const courseId = parseInt(document.getElementById('editCourseId').value);
    const course = courses.find(c => c.id === courseId);
    if (!course) return;
    
    course.name = document.getElementById('editCourseName').value;
    course.level = parseInt(document.getElementById('editLevel').value);
    course.sessions = parseInt(document.getElementById('editSessions').value);
    course.startDate = document.getElementById('editStartDate').value;
    course.instructor = document.getElementById('editInstructor').value;
    course.day = document.getElementById('editDay').value;
    course.time = document.getElementById('editTime').value;
    
    const preview = document.getElementById('editPreview');
    if (preview.style.display === 'block') {
        course.image = preview.src;
    }
    
    renderCourses();
    closeEditModal();
}

// تحويل الوقت إلى صيغة 12 ساعة
function formatTime(timeString) {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    return hour > 12 ? 
        `${hour - 12}:${minutes} PM` : 
        `${hour}:${minutes} AM`;
}

// تنسيق التاريخ لعرضه بشكل أفضل
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

// إغلاق النوافذ عند النقر خارجها
window.onclick = function(event) {
    const addModal = document.getElementById('addModal');
    const editModal = document.getElementById('editModal');
    
    if (event.target === addModal) {
        closeModal();
    }
    
    if (event.target === editModal) {
        closeEditModal();
    }
}