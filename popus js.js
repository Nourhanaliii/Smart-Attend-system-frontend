// ================= popus js.js (النسخة المعدلة) =================

// الكود الخاص بفتح وإغلاق النافذة يبقى كما هو
const loginButton = document.getElementById('loginButton');
const loginPopup = document.getElementById('loginPopup');
const overlay = document.getElementById('overlay');
const closePopup = document.getElementById('closePopup');

loginButton.addEventListener('click', () => {
    loginPopup.style.display = 'block';
    overlay.style.display = 'block';
});

function closeLoginPopup() {
    loginPopup.style.display = 'none';
    overlay.style.display = 'none';
}

overlay.addEventListener('click', closeLoginPopup);
closePopup.addEventListener('click', closeLoginPopup);


// === تعديل منطق تسجيل الدخول ===
document.getElementById('submitLogin').addEventListener('click', async () => {
    const emailInput = document.getElementById('email'); // 👈 تم التعديل
    const passwordInput = document.getElementById('password');
    const submitBtn = document.getElementById('submitLogin');

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();
    
    if (!email || !password) {
        alert('Please enter your email and password!');
        return;
    }

    // عرض حالة التحميل
    const originalText = submitBtn.innerText;
    submitBtn.innerText = 'Logging in...';
    submitBtn.disabled = true;

    try {
        // استدعاء دالة الـ API
        const data = await login(email, password);
        console.log('Login successful:', data);

        // تخزين بيانات المستخدم للاستخدام في الصفحات الأخرى
        localStorage.setItem('user', JSON.stringify(data.user));

        // عرض تأثير انتقالي وتوجيه
        document.body.style.opacity = '0.5';
        document.body.style.transition = 'opacity 0.5s ease-in-out';
        
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 500);

    } catch (error) {
        // في حالة حدوث خطأ
        alert(`Login failed: ${error.message}`);
        // إعادة الزر إلى حالته الطبيعية
        submitBtn.innerText = originalText;
        submitBtn.disabled = false;
    }
});