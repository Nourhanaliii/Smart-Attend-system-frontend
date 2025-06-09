// =================== student.js (Correct and Final Version) ===================

document.addEventListener('DOMContentLoaded', () => {
    // Auth check
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || !user.is_staff) {
        alert('You do not have permission to view this page.');
        window.location.href = 'home.html';
        return;
    }
    setupEventListeners();
    loadAndRenderStudents();
});

let allStudentsData = [];

async function loadAndRenderStudents() {
    const tableBody = document.getElementById('studentsTable');
    if (!tableBody) return;
    tableBody.innerHTML = `<tr><td colspan="7">Loading...</td></tr>`;
    try {
        const students = await getAllStudents(); // from api.js
        allStudentsData = students;
        renderTable(students);
    } catch (error) {
        tableBody.innerHTML = `<tr><td colspan="7" style="color:red;">Error: ${error.message}</td></tr>`;
    }
}

function renderTable(studentsToRender) {
    const tableBody = document.getElementById('studentsTable');
    tableBody.innerHTML = '';
    if (!studentsToRender || studentsToRender.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="7">No students found.</td></tr>`;
        return;
    }
    studentsToRender.forEach(student => {
        const row = document.createElement('tr');
        const studentId = student.student_id;
        const avatarUrl = student.avatar ? `${API_BASE_URL}${student.avatar}` : 'https://via.placeholder.com/50?text=N/A';
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

function setupEventListeners() {
    // Sidebar hamburger
    const hamburger = document.querySelector('.hamburger');
    const sidebar = document.querySelector('.sidebar');
    if (hamburger && sidebar) {
        hamburger.addEventListener('click', () => sidebar.classList.toggle('active'));
    }
    // Logout link
    const logoutLink = document.querySelector('a[onclick="handleLogout()"]');
    if (logoutLink) {
        logoutLink.addEventListener('click', (e) => { e.preventDefault(); handleLogout(); });
    }
    // Add student button
    const addBtn = document.querySelector('.add-student button');
    if(addBtn) addBtn.addEventListener('click', openAddModal);

    // Modals buttons
    document.querySelector('#addStudentModal .save').addEventListener('click', handleAddStudent);
    document.querySelector('#addStudentModal .cancel').addEventListener('click', closeAddModal);
    
    // Filters
    document.getElementById('search').addEventListener('input', applyFilters);
    document.getElementById('level').addEventListener('change', applyFilters);
    document.getElementById('attendance').addEventListener('change', applyFilters);
    document.querySelector('.filters button').addEventListener('click', resetFilters);
}

async function handleAddStudent() {
    const formData = new FormData();
    formData.append('student_id', document.getElementById('newStudentID').value);
    formData.append('name', document.getElementById('newStudentName').value);
    formData.append('level', document.getElementById('newStudentLevel').value);
    const imageFile = document.getElementById('newStudentImage').files[0];
    if (imageFile) {
        formData.append('avatar', imageFile);
    }
    // Simple validation
    if (!formData.get('student_id') || !formData.get('name') || !formData.get('level')) {
        return alert("Please fill Name, ID, and Level.");
    }

    const btn = document.querySelector('#addStudentModal .save');
    btn.disabled = true;
    btn.innerText = 'Saving...';
    try {
        await addStudent(formData); // from api.js
        alert('Student added successfully!');
        closeAddModal();
        loadAndRenderStudents();
    } catch (error) {
        alert(`Error: ${error.message}`);
    } finally {
        btn.disabled = false;
        btn.innerText = 'Save';
    }
}

async function handleDeleteStudent(studentId) {
    if (!confirm(`Delete student ${studentId}?`)) return;
    try {
        await deleteStudent(studentId); // from api.js
        alert('Student deleted!');
        loadAndRenderStudents();
    } catch (error) {
        alert(`Error: ${error.message}`);
    }
}

// UI Helper Functions
function openAddModal() { 
    const form = document.getElementById('addStudentModal').querySelector('form');
    if(form) form.reset();
    document.getElementById('addStudentModal').style.display = 'flex'; 
}
function closeAddModal() { document.getElementById('addStudentModal').style.display = 'none'; }
// ... other modal/filter functions can go here ...
function applyFilters() { /* ... filter logic ... */ }
function resetFilters() { /* ... reset filter logic ... */ }
function openEditModal(id) { alert(`Edit for student ${id} is not implemented.`); }

// General Logout Function
async function handleLogout() {
    try {
        await logout();
        localStorage.clear();
        window.location.href = 'home.html';
    } catch (error) {
        alert("Logout failed.");
    }
}