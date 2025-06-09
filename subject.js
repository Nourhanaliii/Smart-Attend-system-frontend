// =================== subject.js (Final Corrected Version) ===================

document.addEventListener('DOMContentLoaded', () => {
    checkAuthAndInit();
});

function checkAuthAndInit() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || !user.is_staff) {
        alert('You do not have permission to view this page.');
        window.location.href = 'home.html';
        return;
    }
    setupEventListeners();
    loadAndRenderCourses();
    populateInstructorsDropdown();
}

let allCoursesData = [];
let courseIdToEdit = null;

async function loadAndRenderCourses() {
    const courseGrid = document.getElementById('courseGrid');
    courseGrid.innerHTML = '<p>Loading courses...</p>';
    try {
        const courses = await getAllCourses();
        allCoursesData = courses;
        renderCourses(courses);
    } catch (error) {
        courseGrid.innerHTML = `<p style="color: red;">Error: ${error.message}</p>`;
    }
}

function renderCourses(courseList) {
    const courseGrid = document.getElementById('courseGrid');
    courseGrid.innerHTML = '';
    if (!courseList || courseList.length === 0) {
        courseGrid.innerHTML = '<p>No courses found.</p>';
        return;
    }
    courseList.forEach(course => {
        const courseCard = document.createElement('div');
        courseCard.className = 'course-card';
        const imageUrl = course.image ? `${API_BASE_URL}${course.image}` : 'https://via.placeholder.com/300x150?text=No+Image';
        courseCard.innerHTML = `
            <div class="level-badge">${course.level}</div>
            <img src="${imageUrl}" alt="${course.name}">
            <h3>${course.name}</h3>
            <div class="course-details">
                <p><i class="fas fa-chalkboard-teacher"></i>Instructor ID: ${course.instructor}</p>
                <p><i class="far fa-calendar-alt"></i>Schedule: ${course.day} at ${course.time.substring(0, 5)}</p>
            </div>
            <button class="edit-btn" onclick="openEditModal(${course.id})">Edit</button>
        `;
        courseGrid.appendChild(courseCard);
    });
}

async function populateInstructorsDropdown() {
    const selectors = ['#instructor', '#editInstructor'];
    try {
        const staffMembers = await getStaffMembers();
        const instructors = staffMembers.filter(member => member.role !== 'admin');
        selectors.forEach(selector => {
            const select = document.querySelector(selector);
            if (!select) return;
            select.innerHTML = '<option value="">Select Instructor</option>';
            instructors.forEach(inst => {
                const option = document.createElement('option');
                option.value = inst.id;
                option.textContent = `${inst.name} (${inst.role})`;
                select.appendChild(option);
            });
        });
    } catch (error) {
        console.error("Failed to load instructors:", error);
    }
}

function setupEventListeners() {
    document.querySelector('.hamburger')?.addEventListener('click', () => document.querySelector('.sidebar')?.classList.toggle('active'));
    document.querySelector('a[onclick="handleLogout()"]')?.addEventListener('click', e => { e.preventDefault(); handleLogout(); });
    document.querySelector('.add-button')?.addEventListener('click', openAddModal);
    document.querySelector('#addModal .close-button')?.addEventListener('click', closeAddModal);
    document.querySelector('#addModal .cancel-btn')?.addEventListener('click', closeAddModal);
    document.getElementById('courseForm')?.addEventListener('submit', handleAddCourse);
    document.querySelector('#editModal .close-button')?.addEventListener('click', closeEditModal);
    document.getElementById('editCourseForm')?.addEventListener('submit', handleUpdateCourse);
    document.getElementById('fileInput')?.addEventListener('change', e => previewImage(e, 'preview'));
    document.getElementById('editFileInput')?.addEventListener('change', e => previewImage(e, 'editPreview'));
}

async function handleAddCourse(event) {
    event.preventDefault();
    const formData = new FormData();
    formData.append('name', document.getElementById('courseName').value);
    formData.append('level', document.getElementById('level').value);
    formData.append('number_of_sessions', document.getElementById('sessions').value);
    formData.append('start_date', document.getElementById('startDate').value);
    formData.append('instructor', document.getElementById('instructor').value);
    formData.append('day', document.getElementById('day').value);
    formData.append('time', document.getElementById('time').value);
    const imageFile = document.getElementById('fileInput').files[0];
    if (imageFile) {
        formData.append('image', imageFile);
    }
    const btn = event.target.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.innerText = 'Adding...';
    try {
        await addCourse(formData);
        alert('Course added successfully!');
        closeAddModal();
        loadAndRenderCourses();
    } catch (error) {
        alert(`Error: ${error.message}`);
    } finally {
        btn.disabled = false;
        btn.innerText = 'Add Course';
    }
}

async function handleUpdateCourse(event) {
    event.preventDefault();
    if (!courseIdToEdit) return;
    const formData = new FormData();
    formData.append('name', document.getElementById('editCourseName').value);
    formData.append('level', document.getElementById('editLevel').value);
    formData.append('number_of_sessions', document.getElementById('editSessions').value);
    formData.append('start_date', document.getElementById('editStartDate').value);
    formData.append('instructor', document.getElementById('editInstructor').value);
    formData.append('day', document.getElementById('editDay').value);
    formData.append('time', document.getElementById('editTime').value);
    const imageFile = document.getElementById('editFileInput').files[0];
    if (imageFile) {
        formData.append('image', imageFile);
    }
    const btn = event.target.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.innerText = 'Updating...';
    try {
        await updateCourse(courseIdToEdit, formData);
        alert('Course updated successfully!');
        closeEditModal();
        loadAndRenderCourses();
    } catch (error) {
        alert(`Error: ${error.message}`);
    } finally {
        btn.disabled = false;
        btn.innerText = 'Update Course';
    }
}

function openAddModal() {
    const form = document.getElementById('courseForm');
    if (form) form.reset();
    const preview = document.getElementById('preview');
    if(preview) {
        preview.src = '#';
        preview.style.display = 'none';
    }
    document.getElementById('addModal').style.display = 'block';
}

function closeAddModal() {
    document.getElementById('addModal').style.display = 'none';
}

function openEditModal(courseId) {
    courseIdToEdit = courseId;
    const course = allCoursesData.find(c => c.id === courseId);
    if (!course) return;
    document.getElementById('editCourseName').value = course.name;
    document.getElementById('editLevel').value = course.level;
    document.getElementById('editSessions').value = course.number_of_sessions;
    document.getElementById('editStartDate').value = course.start_date;
    document.getElementById('editInstructor').value = course.instructor;
    document.getElementById('editDay').value = course.day;
    document.getElementById('editTime').value = course.time;
    const preview = document.getElementById('editPreview');
    if (course.image) {
        preview.src = `${API_BASE_URL}${course.image}`;
        preview.style.display = 'block';
    } else {
        preview.src = '#';
        preview.style.display = 'none';
    }
    document.getElementById('editModal').style.display = 'block';
}

function closeEditModal() {
    document.getElementById('editModal').style.display = 'none';
}

function previewImage(event, previewId) {
    const preview = document.getElementById(previewId);
    const file = event.target.files[0];
    if (file && preview) {
        const reader = new FileReader();
        reader.onload = e => {
            preview.src = e.target.result;
            preview.style.display = 'block';
        };
        reader.readAsDataURL(file);
    }
}

async function handleLogout() {
    try {
        await logout();
        localStorage.clear();
        window.location.href = 'home.html';
    } catch (error) {
        alert("Logout failed.");
    }
}