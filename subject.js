// =================== subject.js (النسخة النهائية المصححة) ===================

document.addEventListener('DOMContentLoaded', () => {
    checkAuthAndInit();
});

function checkAuthAndInit() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || !user.is_staff) {
        alert('You do not have permission to view this page. Redirecting...');
        window.location.href = 'home.html';
        return;
    }
    setupEventListeners();
    loadAndRenderCourses();
}

let allCoursesData = [];

async function loadAndRenderCourses() {
    const courseGrid = document.getElementById('courseGrid');
    if (!courseGrid) return;
    
    courseGrid.innerHTML = '<p>Loading courses...</p>';
    try {
        const courses = await getAllCourses();
        allCoursesData = courses;
        renderCourses(courses);
    } catch (error) {
        courseGrid.innerHTML = `<p style="color: red;">Error loading courses: ${error.message}</p>`;
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

function setupEventListeners() {
    const hamburger = document.querySelector('.hamburger');
    const sidebar = document.querySelector('.sidebar');
    if (hamburger && sidebar) {
        hamburger.addEventListener('click', () => sidebar.classList.toggle('active'));
    }
    const logoutLink = document.querySelector('a[onclick="handleLogout()"]');
    if (logoutLink) {
        logoutLink.addEventListener('click', (e) => {
            e.preventDefault();
            handleLogout();
        });
    }
    const addBtn = document.querySelector('.add-button');
    if(addBtn) addBtn.addEventListener('click', openModal);
    const closeBtn = document.querySelector('#addModal .close-button');
    if(closeBtn) closeBtn.addEventListener('click', closeModal);
    const cancelBtn = document.querySelector('#addModal .cancel-btn');
    if(cancelBtn) cancelBtn.addEventListener('click', closeModal);
    const courseForm = document.getElementById('courseForm');
    if(courseForm) courseForm.addEventListener('submit', handleAddCourse);
}

async function handleAddCourse(event) {
    event.preventDefault();
    const courseData = {
        name: document.getElementById('courseName').value,
        level: parseInt(document.getElementById('level').value, 10),
        number_of_sessions: parseInt(document.getElementById('sessions').value, 10),
        start_date: document.getElementById('startDate').value,
        instructor: parseInt(document.getElementById('instructor').value, 10),
        day: document.getElementById('day').value,
        time: document.getElementById('time').value,
    };
    if (Object.values(courseData).some(val => !val && val !== 0)) {
        return alert("Please fill all fields.");
    }
    const submitBtn = event.target.querySelector('button[type="submit"]');
    submitBtn.innerText = 'Adding...';
    submitBtn.disabled = true;
    try {
        await addCourse(courseData);
        alert('Course added successfully!');
        closeModal();
        loadAndRenderCourses();
    } catch (error) {
        alert(`Failed to add course: ${error.message}`);
    } finally {
        submitBtn.innerText = 'Add Course';
        submitBtn.disabled = false;
    }
}

function openModal() {
    const form = document.getElementById('courseForm');
    if (form) form.reset();
    document.getElementById('addModal').style.display = 'block';
}
function closeModal() { document.getElementById('addModal').style.display = 'none'; }
function openEditModal(id) { alert(`Edit for course ${id} not implemented yet.`); }
async function handleLogout() {
    try {
        await logout();
        localStorage.clear();
        window.location.href = 'home.html';
    } catch (error) {
        alert("Logout failed.");
    }
}