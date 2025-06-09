

    // === تفعيل القائمة الجانبية ===
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

  

// === تعريف دالة تسجيل الخروج ===
function logoutUser() {
    // تنفيذ عملية تسجيل الخروج
    alert('You have been logged out!');
    // إعادة التوجيه إلى صفحة تسجيل الدخول
    window.location.href = 'home.html';
}


    // === تهيئة الرسم البياني ===
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
            maintainAspectRatio: false, // التأكد من أن الرسم البياني لا يتسبب في التمرير
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

    // === بحث الجدول ===
    document.querySelector('.search-bar').addEventListener('input', function(e) {
        const term = e.target.value.toLowerCase();
        document.querySelectorAll('tbody tr').forEach(row => {
            row.style.display = row.textContent.toLowerCase().includes(term) 
                ? '' 
                : 'none';
        });
    });
    