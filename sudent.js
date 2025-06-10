// // =================== student.js (Correct and Final Version) ===================

// document.addEventListener('DOMContentLoaded', () => {
//     // Auth check
//     const user = JSON.parse(localStorage.getItem('user'));
//     if (!user || !user.is_staff) {
//         alert('You do not have permission to view this page.');
//         window.location.href = 'home.html';
//         return;
//     }
//     setupEventListeners();
//     loadAndRenderStudents();
// });

// let allStudentsData = [];

// async function loadAndRenderStudents() {
//     const tableBody = document.getElementById('studentsTable');
//     if (!tableBody) return;
//     tableBody.innerHTML = `<tr><td colspan="7">Loading...</td></tr>`;
//     try {
//         const students = await getAllStudents(); // from api.js
//         allStudentsData = students;
//         renderTable(students);
//     } catch (error) {
//         tableBody.innerHTML = `<tr><td colspan="7" style="color:red;">Error: ${error.message}</td></tr>`;
//     }
// }

// function renderTable(studentsToRender) {
//     const tableBody = document.getElementById('studentsTable');
//     tableBody.innerHTML = '';
//     if (!studentsToRender || studentsToRender.length === 0) {
//         tableBody.innerHTML = `<tr><td colspan="7">No students found.</td></tr>`;
//         return;
//     }
//     studentsToRender.forEach(student => {
//         const row = document.createElement('tr');
//         const studentId = student.student_id;
//         const avatarUrl = student.avatar ? `${API_BASE_URL}${student.avatar}` : 'https://via.placeholder.com/50?text=N/A';
//         row.innerHTML = `
//             <td><img src="${avatarUrl}" class="student-photo" alt="Avatar"></td>
//             <td>${student.name}</td>
//             <td>${studentId}</td>
//             <td>******</td>
//             <td>${student.level}</td>
//             <td class="rating">${'★'.repeat(student.attendance)}${'☆'.repeat(5 - student.attendance)}</td>
//             <td class="actions">
//                 <button class="edit" onclick="openEditModal('${studentId}')"><i class="fas fa-edit"></i> Edit</button>
//                 <button class="delete" onclick="handleDeleteStudent('${studentId}')"><i class="fas fa-trash"></i> Delete</button>
//             </td>
//         `;
//         tableBody.appendChild(row);
//     });
// }

// function setupEventListeners() {
//     // Sidebar hamburger
//     const hamburger = document.querySelector('.hamburger');
//     const sidebar = document.querySelector('.sidebar');
//     if (hamburger && sidebar) {
//         hamburger.addEventListener('click', () => sidebar.classList.toggle('active'));
//     }
//     // ✅ ربط فورم التعديل
//     const editForm = document.getElementById('editCourseForm');
//     if(editForm) editForm.addEventListener('submit', handleUpdateCourse);
//     // Logout link
//     const logoutLink = document.querySelector('a[onclick="handleLogout()"]');
//     if (logoutLink) {
//         logoutLink.addEventListener('click', (e) => { e.preventDefault(); handleLogout(); });
//     }
//     // Add student button
//     const addBtn = document.querySelector('.add-student button');
//     if(addBtn) addBtn.addEventListener('click', openAddModal);

//     // Modals buttons
//     document.querySelector('#addStudentModal .save').addEventListener('click', handleAddStudent);
//     document.querySelector('#addStudentModal .cancel').addEventListener('click', closeAddModal);
    
//     // Filters
//     document.getElementById('search').addEventListener('input', applyFilters);
//     document.getElementById('level').addEventListener('change', applyFilters);
//     document.getElementById('attendance').addEventListener('change', applyFilters);
//     document.querySelector('.filters button').addEventListener('click', resetFilters);
// }

// async function handleAddStudent() {
//     const formData = new FormData();
//     formData.append('student_id', document.getElementById('newStudentID').value);
//     formData.append('name', document.getElementById('newStudentName').value);
//     formData.append('level', document.getElementById('newStudentLevel').value);
//     const imageFile = document.getElementById('newStudentImage').files[0];
//     if (imageFile) {
//         formData.append('avatar', imageFile);
//     }
//     // Simple validation
//     if (!formData.get('student_id') || !formData.get('name') || !formData.get('level')) {
//         return alert("Please fill Name, ID, and Level.");
//     }

//     const btn = document.querySelector('#addStudentModal .save');
//     btn.disabled = true;
//     btn.innerText = 'Saving...';
//     try {
//         await addStudent(formData); // from api.js
//         alert('Student added successfully!');
//         closeAddModal();
//         loadAndRenderStudents();
//     } catch (error) {
//         alert(`Error: ${error.message}`);
//     } finally {
//         btn.disabled = false;
//         btn.innerText = 'Save';
//     }
// }

// async function handleDeleteStudent(studentId) {
//     if (!confirm(`Delete student ${studentId}?`)) return;
//     try {
//         await deleteStudent(studentId); // from api.js
//         alert('Student deleted!');
//         loadAndRenderStudents();
//     } catch (error) {
//         alert(`Error: ${error.message}`);
//     }
// }

// // UI Helper Functions
// function openAddModal() { 
//     const form = document.getElementById('addStudentModal').querySelector('form');
//     if(form) form.reset();
//     document.getElementById('addStudentModal').style.display = 'flex'; 
// }
// function closeAddModal() { document.getElementById('addStudentModal').style.display = 'none'; }
// // ... other modal/filter functions can go here ...
// function applyFilters() { /* ... filter logic ... */ }
// function resetFilters() { /* ... reset filter logic ... */ }
// function openEditModal(id) { alert(`Edit for student ${id} is not implemented.`); }

// // General Logout Function
// async function handleLogout() {
//     try {
//         await logout();
//         localStorage.clear();
//         window.location.href = 'home.html';
//     } catch (error) {
//         alert("Logout failed.");
//     }
// }

// Global variables
let allStudentsData = [];
let currentEditStudentId = null;

// Initialize page
document.addEventListener('DOMContentLoaded', async () => {
    // Check authentication
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || !user.is_staff) {
        alert('You do not have permission to view this page.');
        window.location.href = 'home.html';
        return;
    }

    // Setup event listeners
    setupEventListeners();
    
    // Load initial data
    await loadAndRenderStudents();
});

// Load students data and render table
async function loadAndRenderStudents() {
    const tableBody = document.getElementById('studentsTable');
    tableBody.innerHTML = `<tr><td colspan="7">Loading...</td></tr>`;
    
    try {
        const response = await getAllStudents();
        allStudentsData = response;
        renderTable(allStudentsData);
    } catch (error) {
        console.error("Error loading students:", error);
        tableBody.innerHTML = `<tr><td colspan="7" style="color:red;">Error loading data</td></tr>`;
    }
}

// Render students table
function renderTable(students) {
    const tableBody = document.getElementById('studentsTable');
    tableBody.innerHTML = '';
    
    if (!students || students.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="7">No students found</td></tr>`;
        return;
    }
    
    students.forEach(student => {
        const row = document.createElement('tr');
        const avatarUrl = student.avatar ? 
            `${API_BASE_URL}${student.avatar}` : 
            'https://via.placeholder.com/50?text=N/A';
            
        row.innerHTML = `
            <td><img src="${avatarUrl}" class="student-photo" alt="Avatar"></td>
            <td>${student.name}</td>
            <td>${student.student_id}</td>
            <td>••••••</td>
            <td>Level ${student.level}</td>
            <td class="rating">${'★'.repeat(student.attendance || 0)}${'☆'.repeat(5 - (student.attendance || 0))}</td>
            <td class="actions">
                <button class="edit" onclick="openEditModal('${student.student_id}')">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="delete" onclick="handleDeleteStudent('${student.student_id}')">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Setup event listeners
function setupEventListeners() {
    // Sidebar toggle
    document.querySelector('.hamburger').addEventListener('click', () => {
        document.querySelector('.sidebar').classList.toggle('active');
    });

    // Search and filters
    document.getElementById('search').addEventListener('input', applyFilters);
    document.getElementById('level').addEventListener('change', applyFilters);
    document.getElementById('attendance').addEventListener('change', applyFilters);
    document.querySelector('.filters button').addEventListener('click', resetFilters);

    // Add student modal
    document.querySelector('.add-student button').addEventListener('click', openAddModal);
    document.querySelector('#addStudentModal .save').addEventListener('click', handleAddStudent);
    document.querySelector('#addStudentModal .cancel').addEventListener('click', closeAddModal);

    // Edit student modal
    document.querySelector('#editStudentModal .save').addEventListener('click', handleUpdateStudent);
    document.querySelector('#editStudentModal .cancel').addEventListener('click', closeEditModal);
}

// Apply filters to table
function applyFilters() {
    const searchTerm = document.getElementById('search').value.toLowerCase();
    const levelFilter = document.getElementById('level').value;
    const attendanceFilter = document.getElementById('attendance').value;
    
    const filtered = allStudentsData.filter(student => {
        const matchesSearch = student.name.toLowerCase().includes(searchTerm) || 
                             student.student_id.toLowerCase().includes(searchTerm);
        const matchesLevel = !levelFilter || student.level == levelFilter.replace('Level ', '');
        const matchesAttendance = !attendanceFilter || student.attendance == attendanceFilter;
        
        return matchesSearch && matchesLevel && matchesAttendance;
    });
    
    renderTable(filtered);
}

// Reset all filters
function resetFilters() {
    document.getElementById('search').value = '';
    document.getElementById('level').value = '';
    document.getElementById('attendance').value = '';
    renderTable(allStudentsData);
}

// Open edit modal and populate with student data
function openEditModal(studentId) {
    const student = allStudentsData.find(s => s.student_id === studentId);
    if (!student) return;
    
    currentEditStudentId = studentId;
    
    // Populate form fields
    document.getElementById('editStudentName').value = student.name;
    document.getElementById('editStudentID').value = student.student_id;
    document.getElementById('editStudentLevel').value = student.level;
    document.getElementById('editStudentAttendance').value = student.attendance || 0;
    
    // Set image preview
    const preview = document.getElementById('editImagePreview');
    if (student.avatar) {
        preview.src = `${API_BASE_URL}${student.avatar}`;
        preview.style.display = 'block';
        document.getElementById('editUploadLabel').textContent = 'Change Photo';
    } else {
        preview.style.display = 'none';
        document.getElementById('editUploadLabel').textContent = 'Add Photo';
    }
    
    // Show modal
    document.getElementById('editStudentModal').style.display = 'flex';
}

// Handle student update
async function handleUpdateStudent() {
    const btn = document.querySelector('#editStudentModal .save');
    btn.disabled = true;
    btn.textContent = 'Saving...';
    
    try {
        const formData = new FormData();
        formData.append('name', document.getElementById('editStudentName').value);
        formData.append('level', document.getElementById('editStudentLevel').value);
        
        const attendance = document.getElementById('editStudentAttendance').value;
        if (attendance) formData.append('attendance', attendance);
        
        const imageFile = document.getElementById('editStudentImage').files[0];
        if (imageFile) {
            formData.append('avatar', imageFile);
        }
        
        // Call update API
        await updateStudent(currentEditStudentId, formData);
        
        alert('Student updated successfully!');
        closeEditModal();
        await loadAndRenderStudents();
    } catch (error) {
        console.error("Update error:", error);
        alert(`Error updating student: ${error.message}`);
    } finally {
        btn.disabled = false;
        btn.textContent = 'Save';
    }
}

// Handle student deletion
async function handleDeleteStudent(studentId) {
    if (!confirm(`Are you sure you want to delete student ${studentId}?`)) return;
    
    try {
        await deleteStudent(studentId);
        alert('Student deleted successfully!');
        await loadAndRenderStudents();
    } catch (error) {
        console.error("Delete error:", error);
        alert(`Error deleting student: ${error.message}`);
    }
}

// Image preview functions
function previewNewImage(event) {
    const [file] = event.target.files;
    if (file) {
        const preview = document.getElementById('newImagePreview');
        preview.src = URL.createObjectURL(file);
        preview.style.display = 'block';
        document.getElementById('newUploadLabel').textContent = 'Change Photo';
    }
}

function previewEditImage(event) {
    const [file] = event.target.files;
    if (file) {
        const preview = document.getElementById('editImagePreview');
        preview.src = URL.createObjectURL(file);
        preview.style.display = 'block';
        document.getElementById('editUploadLabel').textContent = 'Change Photo';
    }
}

// Modal control functions
function closeEditModal() {
    document.getElementById('editStudentModal').style.display = 'none';
    document.getElementById('editStudentImage').value = '';
    currentEditStudentId = null;
}

function openAddModal() {
    document.getElementById('addStudentModal').style.display = 'flex';
}

function closeAddModal() {
    document.getElementById('addStudentModal').style.display = 'none';
    document.getElementById('newStudentImage').value = '';
    document.getElementById('newImagePreview').style.display = 'none';
    document.getElementById('newUploadLabel').textContent = 'Upload Photo';
}

// Handle add new student
async function handleAddStudent() {
    const btn = document.querySelector('#addStudentModal .save');
    btn.disabled = true;
    btn.textContent = 'Saving...';
    
    try {
        const formData = new FormData();
        formData.append('student_id', document.getElementById('newStudentID').value);
        formData.append('name', document.getElementById('newStudentName').value);
        formData.append('level', document.getElementById('newStudentLevel').value);
        
        const attendance = document.getElementById('newStudentAttendance').value;
        if (attendance) formData.append('attendance', attendance);
        
        const imageFile = document.getElementById('newStudentImage').files[0];
        if (imageFile) {
            formData.append('avatar', imageFile);
        }
        
        // Validate required fields
        if (!formData.get('student_id') || !formData.get('name') || !formData.get('level')) {
            throw new Error('Please fill all required fields');
        }
        
        // Call add API
        await addStudent(formData);
        
        alert('Student added successfully!');
        closeAddModal();
        await loadAndRenderStudents();
    } catch (error) {
        console.error("Add error:", error);
        alert(`Error adding student: ${error.message}`);
    } finally {
        btn.disabled = false;
        btn.textContent = 'Save';
    }
}

// Logout function
async function logoutUser() {
    try {
        await logout();
        localStorage.clear();
        window.location.href = 'home.html';
    } catch (error) {
        alert('Logout failed. Please try again.');
    }
}