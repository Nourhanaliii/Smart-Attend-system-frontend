// =================== stuff.js (النسخة الكاملة والنهائية) ===================

// --- الجزء 1: الإعداد العام والتحميل الأولي ---
document.addEventListener('DOMContentLoaded', () => {
    // التحقق من أن المستخدم مسجل دخوله وهو أدمن
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || user.role !== 'admin') {
        alert('You do not have permission to view this page.');
        window.location.href = 'dashboard.html';
        return;
    }

    // جلب وعرض قائمة الأعضاء
    loadAndRenderStaff();

    // ربط الأحداث الخاصة بالصفحة
    setupEventListeners();
});

let allStaffData = []; // لتخزين البيانات الأصلية للبحث

// --- الجزء 2: جلب البيانات وعرضها ---

/**
 * دالة لجلب أعضاء الفريق من الـ API وعرضهم
 */
async function loadAndRenderStaff() {
    const cardsContainer = document.querySelector('.cards');
    cardsContainer.innerHTML = '<p>Loading staff members...</p>';

    try {
        const staffMembers = await getStaffMembers(); // من api.js
        // allStaffData = staffMembers.filter(member => member.email !== 'ghonemy22@gmail.com'); // فلترة السوبر أدمن
        renderStaffCards(allStaffData);
    } catch (error) {
        cardsContainer.innerHTML = `<p>Error loading staff members: ${error.message}</p>`;
    }
}

/**
 * دالة لعرض الكروت بناءً على البيانات المستلمة
 */
function renderStaffCards(staffList) {
    const cardsContainer = document.querySelector('.cards');
    cardsContainer.innerHTML = '';

    if (staffList.length === 0) {
        cardsContainer.innerHTML = '<p>No staff members found.</p>';
        return;
    }

    staffList.forEach(member => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <img src="${member.avatar || 'https://via.placeholder.com/100?text=N/A'}" alt="${member.name}">
            <h3>${member.name}</h3>
            <p>${member.role}</p>
            <p>${member.email}</p>
        `;
        cardsContainer.appendChild(card);
    });
}

// --- الجزء 3: إدارة النافذة المنبثقة (Modal) والإضافة ---

function setupEventListeners() {
    const modal = document.getElementById('addModal');
    const addBtn = document.querySelector('.extra-action');
    const cancelBtn = modal.querySelector('.cancel-btn');
    const saveBtn = modal.querySelector('.save-btn');
    
    addBtn.addEventListener('click', () => modal.style.display = 'flex');
    cancelBtn.addEventListener('click', () => {
        modal.style.display = 'none';
        resetForm();
    });
    saveBtn.addEventListener('click', handleSaveMember);
    document.getElementById('avatarInput').addEventListener('change', handleImagePreview);
    document.querySelector('.search-bar').addEventListener('input', handleSearch);
}

async function handleSaveMember() {
    const name = document.getElementById('memberName').value.trim();
    const email = document.getElementById('memberEmail').value.trim();
    const role = document.getElementById('memberRole').value;
    const avatarFile = document.getElementById('avatarInput').files[0];

    if (!name || !email || !role) {
        alert('Please fill in Name, Email, and Role.');
        return;
    }
    
    const formData = new FormData();
    formData.append('name', name);
    formData.append('email', email);
    formData.append('role', role);
    if (avatarFile) {
        formData.append('avatar', avatarFile);
    }
    
    const saveBtn = document.querySelector('#addModal .save-btn');
    saveBtn.innerText = 'Saving...';
    saveBtn.disabled = true;

    try {
        await addStaffMember(formData); // من api.js
        alert('Member added successfully!');
        document.getElementById('addModal').style.display = 'none';
        resetForm();
        loadAndRenderStaff(); // إعادة تحميل القائمة
    } catch (error) {
        alert(`Failed to add member: ${error.message}`);
    } finally {
        saveBtn.innerText = 'Save';
        saveBtn.disabled = false;
    }
}

function handleImagePreview(event) {
    const reader = new FileReader();
    const preview = document.getElementById('avatar-preview');
    reader.onload = () => {
        preview.src = reader.result;
        preview.style.display = 'block';
    };
    reader.readAsDataURL(event.target.files[0]);
}

function resetForm() {
    document.getElementById('memberName').value = '';
    document.getElementById('memberEmail').value = '';
    document.getElementById('memberRole').value = 'Lecture';
    document.getElementById('avatarInput').value = '';
    document.getElementById('avatar-preview').style.display = 'none';
}

function handleSearch(event) {
    const searchTerm = event.target.value.toLowerCase();
    const filteredStaff = allStaffData.filter(member => 
        member.name.toLowerCase().includes(searchTerm) ||
        member.email.toLowerCase().includes(searchTerm)
    );
    renderStaffCards(filteredStaff);
}

// دالة تسجيل الخروج العامة
async function handleLogout() {
    try {
        await logout();
        localStorage.clear();
        window.location.href = 'home.html';
    } catch (error) {
        alert("Logout failed.");
    }
}