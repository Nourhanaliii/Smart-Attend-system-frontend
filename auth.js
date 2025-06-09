// =================== auth.js (النسخة النهائية) ===================

// --- دوال المصادقة ---

/**
 * تسجيل دخول المستخدم (Admin/Stuff)
 */
async function login(email, password) {
    const url = `${API_BASE_URL}/api/auth/login/`;
    // هذه الدالة تستخدم apiRequest الموجودة في ملف api.js
    return apiRequest(url, {
        method: 'POST',
        body: { email, password },
    });
}


// --- منطق ربط الواجهة ---
// ننتظر حتى يتم تحميل كل محتوى الصفحة
document.addEventListener('DOMContentLoaded', () => {

    // تعريف عناصر واجهة المستخدم
    const loginButton = document.getElementById('loginButton');
    const loginPopup = document.getElementById('loginPopup');
    const overlay = document.getElementById('overlay');
    const closePopupBtn = document.getElementById('closePopupBtn');
    const submitLoginBtn = document.getElementById('submitLoginBtn');
    const emailInput = document.getElementById('email-input');
    const passwordInput = document.getElementById('password-input');

    // التأكد من أن العناصر موجودة
    if (!loginButton || !loginPopup || !submitLoginBtn) {
        console.error('A required UI element for login is missing.');
        return;
    }

    // دوال فتح وإغلاق النافذة
    const openLoginPopup = () => {
        loginPopup.style.display = 'block';
        overlay.style.display = 'block';
    };

    const closeLoginPopup = () => {
        loginPopup.style.display = 'none';
        overlay.style.display = 'none';
    };

    // ربط الأحداث
    loginButton.addEventListener('click', openLoginPopup);
    overlay.addEventListener('click', closeLoginPopup);
    if (closePopupBtn) {
      closePopupBtn.addEventListener('click', closeLoginPopup);
    }

    // ربط زر إرسال البيانات
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
            // استدعاء دالة login 
            const data = await login(email, password); // الرد من الباكاند سيحتوي على التوكن
            console.log('Login successful:', data);

            // ✅ ===============================================
            // ✅ هذا هو التعديل المطلوب: تخزين بيانات المستخدم والتوكن
            // ✅ ===============================================
            localStorage.setItem('user', JSON.stringify(data.user));
            localStorage.setItem('csrfToken', data.csrfToken); // 👈 نخزن التوكن هنا
            // ===============================================

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