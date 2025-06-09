// =================== subject.js (Final Version with Edit Logic) ===================

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
let courseIdToEdit = null; // To store the ID of the course being edited

// --- Data Fetching and Rendering ---
async function loadAndRenderCourses() {
    const courseGrid = document.getElementById('courseGrid');
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

async function populateInstructorsDropdown() {
    // This function can populate both add and edit modals
    const selectors = ['#instructor', '#editInstructor'];
    try {
        const staffMembers = await getStaffMembers();
        const instructors = staffMembers.filter(member => member.role !== 'admin');
        
        selectors.forEach(selector => {
            const selectElement = document.querySelector(selector);
            if (!selectElement) return;
            selectElement.innerHTML = '<option value="">Select Instructor</option>';
            instructors.forEach(instructor => {
                const option = document.createElement('option');
                option.value = instructor.id;
                option.textContent = `${instructor.name} (${instructor.role})`;
                selectElement.appendChild(option);
            });
        });
    } catch (error) {
        console.error("Failed to load instructors:", error);
    }
}


// --- Event Handling and Modals ---
function setupEventListeners() {
    // General UI
    document.querySelector('.hamburger')?.addEventListener('click', () => document.querySelector('.sidebar')?.classList.toggle('active'));
    document.querySelector('a[onclick="handleLogout()"]')?.addEventListener('click', e => { e.preventDefault(); handleLogout(); });

    // Add Modal
    document.querySelector('.add-button')?.addEventListener('click', openAddModal);
    document.querySelector('#addModal .close-button')?.addEventListener('click', closeAddModal);
    document.querySelector('#addModal .cancel-btn')?.addEventListener('click', closeAddModal);
    document.getElementById('courseForm')?.addEventListener('submit', handleAddCourse);

    // Edit Modal
    document.querySelector('#editModal .close-button')?.addEventListener('click', closeEditModal);
    document.getElementById('editCourseForm')?.addEventListener('submit', handleUpdateCourse);
}

// Add Course Logic
async function handleAddCourse(event) {
    event.preventDefault();
    const courseData = { /* ... same as before ... */ };
    // ... same logic as before ...
}

// Edit Course Logic
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
    
    document.getElementById('editModal').style.display = 'block';
}

async function handleUpdateCourse(event) {
    event.preventDefault();
    if (!courseIdToEdit) return;

    const updatedData = {
        name: document.getElementById('editCourseName').value,
        level: parseInt(document.getElementById('editLevel').value, 10),
        number_of_sessions: parseInt(document.getElementById('editSessions').value, 10),
        start_date: document.getElementById('editStartDate').value,
        instructor: parseInt(document.getElementById('editInstructor').value, 10),
        day: document.getElementById('editDay').value,
        time: document.getElementById('editTime').value,
        students: allCoursesData.find(c => c.id === courseIdToEdit).students // We need to send this back
    };
    
    const btn = event.target.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.innerText = 'Updating...';
    try {
        await updateCourse(courseIdToEdit, updatedData);
        alert('Course updated successfully!');
        closeEditModal();
        loadAndRenderCourses();
    } catch (error) {
        alert(`Failed to update course: ${error.message}`);
    } finally {
        btn.disabled = false;
        btn.innerText = 'Update Course';
    }
}

// UI Helpers
function openAddModal() { /* ... */ }
function closeAddModal() { /* ... */ }
function closeEditModal() { document.getElementById('editModal').style.display = 'none'; }

// Logout
async function handleLogout() { /* ... */ }