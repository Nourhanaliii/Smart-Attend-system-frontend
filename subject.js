// =================== subject.js (النسخة الكاملة والمدمجة والنهائية) ===================

// --- الجزء 1: الإعداد العام والتحميل الأولي ---
document.addEventListener('DOMContentLoaded', () => {
    // التحقق من أن المستخدم مسجل دخوله وهو من فريق العمل
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || !user.is_staff) {
        alert('You do not have permission to view this page.');
        window.location.href = 'home.html';
        return;
    }
    
    // ربط الأحداث العامة (القائمة الجانبية، الكاميرا)
    setupGeneralEventListeners();
    
    // ربط أحداث صفحة الكورسات
    setupCoursePageEventListeners();
    
    // جلب وعرض الكورسات عند تحميل الصفحة
    loadAndRenderCourses();
});

let allCoursesData = []; // لتخزين البيانات الأصلية للبحث

// --- الجزء 2: الدوال العامة (يمكن وضعها في ملف منفصل لاحقًا) ---

function setupGeneralEventListeners() {
    // تفعيل القائمة الجانبية
    const sidebar = document.querySelector('.sidebar');
    const hamburger = document.querySelector('.hamburger');
    if (hamburger && sidebar) {
        hamburger.addEventListener('click', () => sidebar.classList.toggle('active'));
    }

    // إدارة الكاميرا الرئيسية
    setupCameraLogic();
}

async function handleLogout() {
    try {
        await logout(); // من api.js
        localStorage.clear(); // مسح كل شيء لضمان الخروج النظيف
        window.location.href = 'home.html';
    } catch (error) {
        alert(`Logout failed: ${error.message}`);
    }
}
// في ملف HTML، يجب تغيير onclick="logoutUser()" إلى onclick="handleLogout()"

// --- الجزء 3: منطق الكاميرا (من الكود الأصلي) ---

function setupCameraLogic() {
    const openCameraBtn = document.getElementById('openCameraBtn');
    const cameraModal = document.getElementById('cameraModal');
    if (!openCameraBtn || !cameraModal) return;

    const captureBtn = document.getElementById('captureBtn');
    const closeCamera = document.getElementById('closeCamera');
    
    // فتح الكاميرا
    openCameraBtn.addEventListener('click', () => {
        // ... سيتم ربط هذا لاحقًا بوظيفة تسجيل الحضور ...
        alert("Camera for attendance will be implemented here.");
    });
    
    // إغلاق الكاميرا
    closeCamera.addEventListener('click', () => {
        cameraModal.style.display = 'none';
    });
}

// --- الجزء 4: منطق صفحة الكورسات (CRUD) ---

async function loadAndRenderCourses() {
    const courseGrid = document.getElementById('courseGrid');
    courseGrid.innerHTML = '<p>Loading courses...</p>';
    try {
        const courses = await getAllCourses(); // من api.js
        allCoursesData = courses;
        renderCourses(courses);
    } catch (error) {
        courseGrid.innerHTML = `<p>Error loading courses: ${error.message}</p>`;
    }
}

function renderCourses(courseList) {
    const courseGrid = document.getElementById('courseGrid');
    courseGrid.innerHTML = '';

    if (courseList.length === 0) {
        courseGrid.innerHTML = '<p>No courses found.</p>';
        return;
    }

    courseList.forEach(course => {
        const courseCard = document.createElement('div');
        courseCard.className = 'course-card';
        // بناء رابط الصورة الكامل
        const imageUrl = course.image ? `${API_BASE_URL}${course.image}` : 'https://via.placeholder.com/300x150?text=No+Image';

        courseCard.innerHTML = `
            <div class="level-badge">${course.level}</div>
            <img src="${imageUrl}" alt="${course.name}">
            <h3>${course.name}</h3>
            <div class="course-details">
                <p><i class="fas fa-chalkboard-teacher"></i>Instructor ID: ${course.instructor}</p>
                <p><i class="far fa-calendar-alt"></i>Schedule: ${course.day} at ${course.time}</p>
                <p><i class="fas fa-layer-group"></i>Level: ${course.level}</p>
                <p><i class="fas fa-clock"></i>Sessions: ${course.number_of_sessions}</p>
                <p><i class="far fa-calendar-check"></i>Start Date: ${course.start_date}</p>
            </div>
            <button class="edit-btn" onclick="openEditModal(${course.id})">Edit</button>
        `;
        courseGrid.appendChild(courseCard);
    });
}

function setupCoursePageEventListeners() {
    document.querySelector('.add-button').addEventListener('click', openModal);
    document.querySelector('#addModal .close-button').addEventListener('click', closeModal);
    document.getElementById('courseForm').addEventListener('submit', handleAddCourse);
    document.getElementById('fileInput').addEventListener('change', (e) => previewImage(e, 'preview'));
}

async function handleAddCourse(event) {
    event.preventDefault(); 
    const form = event.target;
    const submitBtn = form.querySelector('button[type="submit"]');

    // ملاحظة: بما أن الباكاند يتوقع JSON، لن نستخدم FormData هذه المرة
    // إلا إذا أردنا رفع صورة. سنقوم بتبسيطها الآن بدون صورة.
    const courseData = {
        name: document.getElementById('courseName').value,
        level: parseInt(document.getElementById('level').value, 10),
        number_of_sessions: parseInt(document.getElementById('sessions').value, 10),
        start_date: document.getElementById('startDate').value,
        instructor: parseInt(document.getElementById('instructor').value, 10),
        day: document.getElementById('day').value,
        time: document.getElementById('time').value,
    };
    
    // التحقق من صحة المدخلات
    if (!courseData.name || !courseData.level || !courseData.number_of_sessions || !courseData.start_date || !courseData.instructor || !courseData.day || !courseData.time) {
        alert("Please fill all fields.");
        return;
    }

    submitBtn.innerText = 'Adding...';
    submitBtn.disabled = true;

    try {
        await addCourse(courseData); // استدعاء دالة الـ API
        alert('Course added successfully!');
        closeModal();
        loadAndRenderCourses(); // إعادة تحميل القائمة
    } catch (error) {
        alert(`Failed to add course: ${error.message}`);
    } finally {
        submitBtn.innerText = 'Add Course';
        submitBtn.disabled = false;
    }
}

// دوال مساعدة للواجهة
function openModal() { document.getElementById('addModal').style.display = 'block'; }
function closeModal() {
    document.getElementById('addModal').style.display = 'none';
    document.getElementById('courseForm').reset();
    document.getElementById('preview').style.display = 'none';
}
function previewImage(event, previewId) {
    const reader = new FileReader();
    reader.onload = () => {
        document.getElementById(previewId).src = reader.result;
        document.getElementById(previewId).style.display = 'block';
    };
    if (event.target.files[0]) {
        reader.readAsDataURL(event.target.files[0]);
    }
}

// دالة تعديل الكورس (مستقبلية، تحتاج endpoint)
function openEditModal(courseId) {
    alert(`Editing for course ID ${courseId} is not implemented yet.`);
}