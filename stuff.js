  // إدارة القائمة الجانبية
  document.querySelector('.hamburger').addEventListener('click', () => {
    document.querySelector('.sidebar').classList.toggle('collapsed');
});

// إدارة المودال
let avatarUrl = '';
const modal = document.getElementById('addModal');
const addBtn = document.querySelector('.extra-action');

addBtn.addEventListener('click', showModal);

function showModal() {
    modal.style.display = 'flex';
}

function closeModal() {
    modal.style.display = 'none';
    resetForm();
}

function resetForm() {
    document.getElementById('memberName').value = '';
    document.getElementById('memberEmail').value = '';
    document.getElementById('memberRole').value = 'Lecture';
    document.getElementById('avatar-preview').style.display = 'none';
    avatarUrl = '';
}

function togglePasswordVisibility() {
    const passwordInput = document.getElementById("memberPassword");
    const eyeIcon = document.querySelector(".eye-icon");
    // تحقق إذا كان الحقل نوعه password
    if (passwordInput.type === "password") {
        passwordInput.type = "text"; // إظهار الباسورد
        eyeIcon.classList.add("active"); // تفعيل الأيقونة (تنور)
    } else {
        passwordInput.type = "password"; // إخفاء الباسورد
        eyeIcon.classList.remove("active"); // إلغاء تفعيل الأيقونة (تطفي)
    }
}

// معالجة الصورة
document.getElementById('avatarInput').addEventListener('change', function(e) {
    const reader = new FileReader();
    reader.onload = function() {
        avatarUrl = reader.result;
        const preview = document.getElementById('avatar-preview');
        preview.src = avatarUrl;
        preview.style.display = 'block';
    }
    reader.readAsDataURL(e.target.files[0]);
});

// حفظ العضو
function saveMember() {
    const name = document.getElementById('memberName').value;
    const email = document.getElementById('memberEmail').value;
    const role = document.getElementById('memberRole').value;

    if (!name || !email || !role) {
        alert('Please fill all required fields');
        return;
    }

    const newCard = document.createElement('div');
    newCard.className = 'card';
    newCard.innerHTML = `
        <img src="${avatarUrl || 'default-avatar.png'}" alt="${name}">
        <h3>${name}</h3>
        <p>${role}</p>
        <p>${email}</p>
    `;

    document.querySelector('.cards').prepend(newCard);
    closeModal();
}

// نظام البحث
document.querySelector('.search-bar').addEventListener('input', function(e) {
    const searchTerm = e.target.value.toLowerCase();
    document.querySelectorAll('.card').forEach(card => {
        const name = card.querySelector('h3').textContent.toLowerCase();
        card.style.display = name.includes(searchTerm) ? 'block' : 'none';
    });
});