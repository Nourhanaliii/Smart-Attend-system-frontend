// =================== stuff.js (Final Version with Edit/Delete) ===================

let allStaffData = [];
let memberIdToEdit = null;

// --- 1. Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || user.role !== 'admin') {
        alert('You do not have permission to view this page.');
        window.location.href = 'dashboard.html';
        return;
    }
    loadAndRenderStaff();
    setupEventListeners();
});

// --- 2. Data Fetching and Rendering ---
async function loadAndRenderStaff() {
    const cardsContainer = document.querySelector('.cards');
    cardsContainer.innerHTML = '<p>Loading...</p>';
    try {
        const staffMembers = await getStaffMembers();
        allStaffData = staffMembers;
        renderStaffCards(staffMembers);
    } catch (error) {
        cardsContainer.innerHTML = `<p style="color:red;">Error: ${error.message}</p>`;
    }
}
function renderStaffCards(staffList) {
    const cardsContainer = document.querySelector('.cards');
    cardsContainer.innerHTML = '';
    const currentUser = JSON.parse(localStorage.getItem('user'));

    if (!staffList || staffList.length === 0) {
        cardsContainer.innerHTML = '<p>No staff members found.</p>';
        return;
    }
    
    staffList.forEach(member => {
        // ✅ بناء رابط الصورة الكامل
        const avatarUrl = member.avatar 
            ? `${API_BASE_URL}${member.avatar}` 
            : 'https://via.placeholder.com/100?text=N/A';
        
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <img src="${avatarUrl}" alt="${member.name}">
            <h3>${member.name}</h3>
            <p class="role">${member.role}</p>
            <p class="email">${member.email}</p>
            <div class="card-actions">
                <button class="edit-btn" onclick="openEditModal(${member.id})">Edit</button>
                <button class="delete-btn" onclick="handleDeleteMember(${member.id})">Delete</button>
            </div>
        `;
        if (currentUser && currentUser.id === member.id) {
            card.querySelector('.card-actions').style.display = 'none';
        }
        cardsContainer.appendChild(card);
    });
}

// --- 3. Event Listeners Setup ---
function setupEventListeners() {
    // General UI
    document.querySelector('.hamburger')?.addEventListener('click', () => document.querySelector('.sidebar')?.classList.toggle('active'));
    document.querySelector('a[onclick="handleLogout()"]')?.addEventListener('click', (e) => { e.preventDefault(); handleLogout(); });
    
    // Add Modal
    document.querySelector('.extra-action')?.addEventListener('click', () => {
        document.getElementById('addModal').style.display = 'flex';
    });
    document.querySelector('#addModal .cancel-btn')?.addEventListener('click', () => {
        document.getElementById('addModal').style.display = 'none';
        resetForm();
    });
    document.querySelector('#addModal .save-btn')?.addEventListener('click', handleSaveMember);
    document.getElementById('avatarInput')?.addEventListener('change', (e) => handleImagePreview(e, 'avatar-preview'));
    
    // Edit Modal
    document.getElementById('saveEditBtn')?.addEventListener('click', handleUpdateMember);
    document.getElementById('cancelEditBtn')?.addEventListener('click', closeEditModal);
    document.getElementById('editAvatarInput')?.addEventListener('change', (e) => handleImagePreview(e, 'edit-avatar-preview'));
    
    // Search
    document.querySelector('.search-bar')?.addEventListener('input', handleSearch);
}

// --- 4. CRUD and UI Helper Functions ---
async function handleSaveMember() {
    const name = document.getElementById('memberName').value.trim();
    const email = document.getElementById('memberEmail').value.trim();
    const role = document.getElementById('memberRole').value;
    const avatarFile = document.getElementById('avatarInput').files[0];
    if (!name || !email || !role) {
        return alert('Please fill in Name, Email, and Role.');
    }
    const formData = new FormData();
    formData.append('name', name);
    formData.append('email', email);
    formData.append('role', role);
    if (avatarFile) formData.append('avatar', avatarFile);
    
    const btn = document.querySelector('#addModal .save-btn');
    btn.disabled = true;
    btn.innerText = "Saving...";
    try {
        await addStaffMember(formData);
        alert('Member added successfully!');
        document.getElementById('addModal').style.display = 'none';
        resetForm();
        loadAndRenderStaff();
    } catch (error) {
        alert(`Failed to add member: ${error.message}`);
    } finally {
        btn.disabled = false;
        btn.innerText = "Save";
    }
}

async function handleUpdateMember() {
    if (!memberIdToEdit) return;
    const formData = new FormData();
    formData.append('name', document.getElementById('editMemberName').value);
    formData.append('role', document.getElementById('editMemberRole').value);
    const avatarFile = document.getElementById('editAvatarInput').files[0];
    if (avatarFile) {
        formData.append('avatar', avatarFile);
    }
    
    const btn = document.getElementById('saveEditBtn');
    btn.disabled = true;
    btn.innerText = "Saving...";
    try {
        await updateStaffMember(memberIdToEdit, formData);
        alert('Member updated successfully!');
        closeEditModal();
        loadAndRenderStaff();
    } catch (error) {
        alert(`Failed to update member: ${error.message}`);
    } finally {
        btn.disabled = false;
        btn.innerText = "Save Changes";
    }
}

async function handleDeleteMember(memberId) {
    if (confirm('Are you sure you want to delete this member?')) {
        try {
            await deleteStaffMember(memberId);
            alert('Member deleted.');
            loadAndRenderStaff();
        } catch (error) {
            alert(`Failed to delete member: ${error.message}`);
        }
    }
}

function openEditModal(memberId) {
    memberIdToEdit = memberId;
    const member = allStaffData.find(m => m.id === memberId);
    if (!member) return;
    document.getElementById('editMemberName').value = member.name;
    document.getElementById('editMemberRole').value = member.role;
    const preview = document.getElementById('edit-avatar-preview');
    preview.src = member.avatar ? `${API_BASE_URL}${member.avatar}` : '#';
    preview.style.display = member.avatar ? 'block' : 'none';
    document.getElementById('editModal').style.display = 'flex';
}

function closeEditModal() {
    document.getElementById('editModal').style.display = 'none';
}

function resetForm() {
    document.getElementById('memberName').value = '';
    document.getElementById('memberEmail').value = '';
    document.getElementById('memberRole').value = 'Lecture';
    document.getElementById('avatarInput').value = '';
    document.getElementById('avatar-preview').style.display = 'none';
}

function handleImagePreview(event, previewId) {
    const file = event.target.files[0];
    const preview = document.getElementById(previewId);
    if (file && preview) {
        const reader = new FileReader();
        reader.onload = () => {
            preview.src = reader.result;
            preview.style.display = 'block';
        };
        reader.readAsDataURL(file);
    }
}

function handleSearch(event) {
    const searchTerm = event.target.value.toLowerCase();
    const filteredStaff = allStaffData.filter(member => 
        member.name.toLowerCase().includes(searchTerm) ||
        member.email.toLowerCase().includes(searchTerm)
    );
    renderStaffCards(filteredStaff);
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