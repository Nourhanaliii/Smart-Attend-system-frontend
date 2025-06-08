// ================= popus js.js (النسخة النهائية والمضمونة) =================

document.addEventListener('DOMContentLoaded', () => {

    // --- تعريف كل العناصر التي نحتاجها في البداية ---
    const loginButton = document.getElementById('loginButton');
    const loginPopup = document.getElementById('loginPopup');
    const overlay = document.getElementById('overlay');
    const closePopupBtn = document.getElementById('closePopupBtn');
    const submitLoginBtn = document.getElementById('submitLoginBtn');
    const emailInput = document.getElementById('email-input');
    const passwordInput = document.getElementById('password-input');

    // التأكد من أن كل العناصر موجودة قبل المتابعة
    if (!loginButton || !loginPopup || !overlay || !closePopupBtn || !submitLoginBtn || !emailInput || !passwordInput) {
        console.error('One or more login popup elements are missing from the DOM.');
        return;
    }

    // --- دوال فتح وإغلاق النافذة ---
    function openLoginPopup() {
        loginPopup.style.display = 'block';
        overlay.style.display = 'block';
    }

    function closeLoginPopup() {
        loginPopup.style.display = 'none';
        overlay.style.display = 'none';
    }

    // --- ربط الأحداث ---
    loginButton.addEventListener('click', openLoginPopup);
    overlay.addEventListener('click', closeLoginPopup);
    closePopupBtn.addEventListener('click', closeLoginPopup);

    // --- منطق إرسال طلب تسجيل الدخول ---
    submitLoginBtn.addEventListener('click', async () => {
        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();
        
        if (!email || !password) {
            alert('Please enter your email and password!');
            return;
        }

        const originalText = submitLoginBtn.innerText;
        submitLoginBtn.innerText = 'Logging in...';
        submitLoginBtn.disabled = true;

        try {
            // استدعاء دالة الـ API من ملف api.js
            const data = await login(email, password);
            console.log('Login successful:', data);

            localStorage.setItem('user', JSON.stringify(data.user));

            document.body.style.opacity = '0.5';
            document.body.style.transition = 'opacity 0.5s ease-in-out';
            
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 500);

        } catch (error) {
            alert(`Login failed: ${error.message}`);
            submitLoginBtn.innerText = originalText;
            submitLoginBtn.disabled = false;
        }
    });

});