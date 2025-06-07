// popus js.js (الاسم الذي استخدمته في الـ HTML)

// ===================================================================
//  1. دالة مساعدة قياسية لقراءة قيمة الكوكي من المتصفح
//  هذه الدالة ستحتاجها كثيراً في كل الصفحات بعد تسجيل الدخول
// ===================================================================
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            // هل هذا الكوكي هو الذي نبحث عنه؟
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}


// ===================================================================
//  2. التعامل مع الـ Popup (الكود الخاص بك، وهو جيد)
// ===================================================================
const loginButton = document.getElementById('loginButton');
const loginPopup = document.getElementById('loginPopup');
const overlay = document.getElementById('overlay');
const closePopup = document.getElementById('closePopup');

loginButton.addEventListener('click', () => {
    loginPopup.style.display = 'block';
    overlay.style.display = 'block';
});

const closeLoginPopup = () => {
    loginPopup.style.display = 'none';
    overlay.style.display = 'none';
};

overlay.addEventListener('click', closeLoginPopup);
closePopup.addEventListener('click', closeLoginPopup);


// ===================================================================
//  3. منطق تسجيل الدخول (النسخة الصحيحة والمعدلة)
// ===================================================================
document.getElementById('submitLogin').addEventListener('click', () => {
    const emailInput = document.getElementById('userId').value;
    const passwordInput = document.getElementById('password').value;
    const submitBtn = document.getElementById('submitLogin');

    if (!emailInput || !passwordInput) {
        alert('Please enter your email and password!');
        return; // أوقف التنفيذ إذا كانت الحقول فارغة
    }

    // عرض حالة التحميل
    submitBtn.innerText = 'Logging in...';
    submitBtn.disabled = true;

    // ----- الجزء الأهم: تعديل الـ fetch -----
    fetch('https://django.nextapps.me/api/members/login/', { // ⚠️ استخدمت مسار /api/auth/ لأنه أنظف
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            // ❌ لا نرسل X-CSRFToken هنا. لقد تم حذفه.
        },
        // ✅ هذا السطر ضروري جداً ليتم حفظ الكوكيز
        credentials: 'include',
        body: JSON.stringify({
            email: emailInput,
            password: passwordInput
        })
    })
    .then(response => {
        // تحقق أولاً مما إذا كان الرد ناجحاً من ناحية الشبكة
        if (!response.ok) {
            // إذا فشل (مثل 401 Unauthorized)، ارمي خطأ ليتم التقاطه في .catch
            // يمكنك قراءة رسالة الخطأ من الباكاند إذا أردت
            return response.json().then(err => { throw new Error(err.error || 'Login failed') });
        }
        // إذا نجح، قم بتحويل الرد إلى JSON
        return response.json();
    })
    .then(data => {
        // بعد نجاح الـ fetch والحصول على بيانات JSON
        console.log('Login successful:', data);
        
        // (اختياري) يمكنك تخزين بيانات المستخدم في localStorage للوصول إليها بسهولة في الصفحات الأخرى
        localStorage.setItem('user', JSON.stringify(data.user));

        // إضافة تأثير احترافي عند التوجيه
        document.body.style.transition = 'opacity 0.5s ease-in-out';
        document.body.style.opacity = '0';
        
        // التوجيه إلى صفحة الـ Dashboard بعد تأخير بسيط للتأثير
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 500);
    })
    .catch(error => {
        // يتم تنفيذ هذا الجزء في حالة فشل الشبكة أو فشل المصادقة
        console.error('Error:', error);
        alert(error.message); // عرض رسالة الخطأ للمستخدم

        // إعادة الزر إلى حالته الطبيعية
        submitBtn.innerText = 'Login';
        submitBtn.disabled = false;
    });
});
