// =================== student.js (النسخة الكاملة والمدمجة) ===================

// --- الجزء 1: الإعداد العام والتحميل الأولي ---
document.addEventListener('DOMContentLoaded', () => {
    // التحقق من أن المستخدم مسجل دخوله وهو من فريق العمل
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || !user.is_staff) {
        alert('You do not have permission to view this page. Redirecting...');
        window.location.href = 'home.html';
        return;
    }
    
    // ربط الأحداث العامة (القائمة الجانبية، الكاميرا)
    setupGeneralEventListeners();
    
    // ربط أحداث صفحة الطلاب (إضافة، تعديل، فلاتر)
    setupStudentPageEventListeners();
    
    // جلب وعرض الطلاب عند تحميل الصفحة
    loadAndRenderStudents();
});


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

/**
 * دالة لتسجيل الخروج (لأنها مستخدمة في كل الصفحات)
 */
async function handleLogout() {
    try {
        await logout(); // من ملف api.js
        localStorage.removeItem('user');
        window.location.href = 'home.html';
    } catch (error) {
        alert(`Logout failed: ${error.message}`);
    }
}
// في ملف HTML، يجب تغيير onclick="logoutUser()" إلى onclick="handleLogout()"


// --- الجزء 3: منطق الكاميرا (من الكود الأصلي) ---

let currentPhotoForStudent = null; // متغير لتخزين الصورة الملتقطة للطالب

function setupCameraLogic() {
    const openCameraBtn = document.getElementById('openCameraBtn');
    const cameraModal = document.getElementById('cameraModal');
    if (!openCameraBtn || !cameraModal) return;

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
    let currentModalType = ''; // 'add', 'edit', 'main'

    // فتح الكاميرا
    openCameraBtn.addEventListener('click', () => {
        currentModalType = 'main'; // هذه الكاميرا لتسجيل الحضور العام
        cameraModal.style.display = 'flex';
        showLiveCamera();
    });

    const closeCameraModal = () => {
        stopCamera();
        cameraModal.style.display = 'none';
    };

    const showLiveCamera = () => {
        liveCameraView.style.display = 'block';
        uploadPhotoView.style.display = 'none';
        openLiveCamera.classList.add('active');
        openUploadPhoto.classList.remove('active');
        startCamera();
    };
    
    const showUploadPhoto = () => {
        liveCameraView.style.display = 'none';
        uploadPhotoView.style.display = 'block';
        openLiveCamera.classList.remove('active');
        openUploadPhoto.classList.add('active');
        stopCamera();
    };

    const startCamera = async () => {
        try {
            stopCamera();
            cameraStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
            cameraView.srcObject = cameraStream;
        } catch (err) {
            console.error('Camera error:', err);
            alert('Could not access the camera.');
        }
    };
    
    const stopCamera = () => {
        if (cameraStream) {
            cameraStream.getTracks().forEach(track => track.stop());
        }
    };

    captureBtn.addEventListener('click', () => {
        // ... سيتم ربط هذا الزر لاحقًا بوظيفة تسجيل الحضور ...
        // حاليًا، سيقوم بالتقاط الصورة فقط
        alert("Capture button clicked. Face recognition API will be connected here.");
    });
    
    openLiveCamera.addEventListener('click', showLiveCamera);
    openUploadPhoto.addEventListener('click', showUploadPhoto);
    closeCamera.addEventListener('click', closeCameraModal);
}

// --- الجزء 4: منطق صفحة الطلاب (CRUD Operations) ---

let allStudentsData = []; // لتخزين بيانات الطلاب الأصلية للبحث والفلترة

function setupStudentPageEventListeners() {
    document.querySelector('.add-student button').addEventListener('click', openAddModal);
    document.querySelector('#addStudentModal .save').addEventListener('click', handleAddStudent);
    document.querySelector('#addStudentModal .cancel').addEventListener('click', closeAddModal);
    document.querySelector('#editStudentModal .save').addEventListener('click', handleSaveStudentEdit);
    document.querySelector('#editStudentModal .cancel').addEventListener('click', closeEditModal);
    document.getElementById('search').addEventListener('input', applyFilters);
    document.getElementById('level').addEventListener('change', applyFilters);
    document.getElementById('attendance').addEventListener('change', applyFilters);
    document.querySelector('.filters button').addEventListener('click', resetFilters);
    document.getElementById('newStudentImage').addEventListener('change', (e) => previewImage(e, 'newImagePreview'));
    document.getElementById('editStudentImage').addEventListener('change', (e) => previewImage(e, 'editImagePreview'));
}

async function loadAndRenderStudents() {
    const tableBody = document.getElementById('studentsTable');
    tableBody.innerHTML = `<tr><td colspan="7">Loading students...</td></tr>`;
    try {
        const students = await getAllStudents(); // من api.js
        allStudentsData = students;
        renderTable(students);
    } catch (error) {
        tableBody.innerHTML = `<tr><td colspan="7">Error loading data.</td></tr>`;
    }
}

// في ملف student.js

function renderTable(studentsToRender) {
    const tableBody = document.getElementById('studentsTable');
    tableBody.innerHTML = '';
    
    if (studentsToRender.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="7">No students found.</td></tr>`;
        return;
    }

    studentsToRender.forEach(student => {
        const row = document.createElement('tr');
        const studentId = student.student_id;
        
        // ✅ =======================================================
        // ✅ هذا هو التعديل: نكوّن رابط الصورة الكامل
        // ✅ =======================================================
        const avatarUrl = student.avatar 
            ? `${API_BASE_URL}${student.avatar}` // ندمج الدومين مع المسار
            : 'https://via.placeholder.com/50?text=N/A'; // صورة افتراضية إذا لم يوجد
        // =======================================================

        row.innerHTML = `
            <td><img src="${avatarUrl}" class="student-photo" alt="Avatar"></td>
            <td>${student.name}</td>
            <td>${studentId}</td>
            <td>******</td>
            <td>${student.level}</td>
            <td class="rating">${'★'.repeat(student.attendance)}${'☆'.repeat(5 - student.attendance)}</td>
            <td class="actions">
                <button class="edit" onclick="openEditModal('${studentId}')"><i class="fas fa-edit"></i> Edit</button>
                <button class="delete" onclick="handleDeleteStudent('${studentId}')"><i class="fas fa-trash"></i> Delete</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// ... باقي دوال الملف تبقى كما هي ......
// في ملف student.js

async function handleAddStudent() {
    const studentIdInput = document.getElementById('newStudentID');
    const nameInput = document.getElementById('newStudentName');
    const levelSelect = document.getElementById('newStudentLevel'); // 👈 استهداف الـ select
    const imageInput = document.getElementById('newStudentImage');

    // 🔴 حذف حقل كلمة المرور من هنا، لم نعد بحاجة إليه
    if (!studentIdInput.value || !nameInput.value || !levelSelect.value) {
        alert("Please fill in Name, ID, and Level.");
        return;
    }
    
    const formData = new FormData();
    formData.append('student_id', studentIdInput.value.trim());
    formData.append('name', nameInput.value.trim());
    // ✅ إرسال القيمة كنص كامل مثل "Level 4"
    formData.append('level', levelSelect.value); 
    
    if (imageInput.files[0]) {
        formData.append('avatar', imageInput.files[0]);
    }
    
    // ... باقي الكود يبقى كما هو ...
    const saveBtn = document.querySelector('#addStudentModal .save');
    saveBtn.innerText = 'Saving...';
    saveBtn.disabled = true;

    try {
        await addStudent(formData);
        alert('Student added successfully!');
        closeAddModal();
        loadAndRenderStudents();
    } catch (error) {
        alert(`Failed to add student: ${error.message}`);
    } finally {
        saveBtn.innerText = 'Save';
        saveBtn.disabled = false;
    }
}

async function handleDeleteStudent(studentId) {
    if (!confirm(`Delete student ${studentId}?`)) return;
    try {
        await deleteStudent(studentId); // من api.js
        alert('Student deleted!');
        loadAndRenderStudents();
    } catch (error) {
        alert(`Error: ${error.message}`);
    }
}

let studentIdToEdit = null;

function openEditModal(studentId) {
    studentIdToEdit = studentId;
    const student = allStudentsData.find(s => s.student_id === studentId);
    if (!student) return;
    
    document.getElementById('editStudentName').value = student.name;
    document.getElementById('editStudentID').value = student.student_id;
    document.getElementById('editStudentLevel').value = student.level;
    document.getElementById('editStudentAttendance').value = student.attendance;
    document.getElementById('editImagePreview').src = student.avatar || 'https://via.placeholder.com/150';
    document.getElementById('editImagePreview').style.display = 'block';
    
    document.getElementById('editStudentModal').style.display = 'flex';
}

async function handleSaveStudentEdit() {
    if (!studentIdToEdit) return;
    const data = {
        name: document.getElementById('editStudentName').value,
        level: document.getElementById('editStudentLevel').value,
        attendance: parseInt(document.getElementById('editStudentAttendance').value)
    };

    // كود تعديل الصورة يحتاج endpoint خاص به، سنتجاهله الآن
    
    const btn = document.querySelector('#editStudentModal .save');
    btn.disabled = true;
    btn.innerText = 'Saving...';

    try {
        await updateStudent(studentIdToEdit, data); // من api.js
        alert('Student updated!');
        closeEditModal();
        loadAndRenderStudents();
    } catch (error) {
        alert(`Error: ${error.message}`);
    } finally {
        btn.disabled = false;
        btn.innerText = 'Save';
    }
}

// دوال الواجهة المساعدة
function openAddModal() {
    document.getElementById('addStudentModal').style.display = 'flex';
    document.getElementById('addStudentModal').querySelector('form')?.reset();
    document.getElementById('newImagePreview').style.display = 'none';
}
function closeAddModal() { document.getElementById('addStudentModal').style.display = 'none'; }
function closeEditModal() { document.getElementById('editStudentModal').style.display = 'none'; }

function previewImage(event, previewId) {
    const reader = new FileReader();
    reader.onload = () => {
        const preview = document.getElementById(previewId);
        preview.src = reader.result;
        preview.style.display = 'block';
    };
    reader.readAsDataURL(event.target.files[0]);
}

function applyFilters() {
    const search = document.getElementById('search').value.toLowerCase();
    const level = document.getElementById('level').value;
    const attendance = document.getElementById('attendance').value;
    const filtered = allStudentsData.filter(s => 
        (s.name.toLowerCase().includes(search) || s.student_id.includes(search)) &&
        (!level || s.level === level) &&
        (!attendance || s.attendance === parseInt(attendance))
    );
    renderTable(filtered);
}

function resetFilters() {
    document.querySelector('.filters form')?.reset();
    renderTable(allStudentsData);
}