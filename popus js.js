const loginButton = document.getElementById('loginButton');
const loginPopup = document.getElementById('loginPopup');
const overlay = document.getElementById('overlay');

loginButton.addEventListener('click', () => {
    loginPopup.style.display = 'block';
    overlay.style.display = 'block';
});

overlay.addEventListener('click', () => {
    loginPopup.style.display = 'none';
    overlay.style.display = 'none';
});

document.getElementById('submitLogin').addEventListener('click', async () => {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorMessage = document.getElementById('errorMessage');
    
    errorMessage.style.display = 'none';
    
    if (!email || !password) {
        errorMessage.textContent = 'Please enter both email and password!';
        errorMessage.style.display = 'block';
        return;
    }

    // عرض رسالة تحميل
    const loginButton = document.getElementById('submitLogin');
    loginButton.innerText = 'Logging in...';
    loginButton.disabled = true;

    try {
        const response = await fetch('https://django.nextapps.me/api/members/login/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: email,
                password: password
            })
        });

        const data = await response.json();

        if (response.ok) {
            // تخزين token إذا كان موجوداً في الرد
            if (data.token) {
                localStorage.setItem('authToken', data.token);
            }
            
            // إضافة تأثير احترافي عند التوجيه
            document.body.style.opacity = '0.5';
            document.body.style.transition = 'opacity 1s ease-in-out';
            
            // التوجيه إلى صفحة الـ Dashboard
            window.location.href = 'dashboard.html';
        } else {
            // عرض رسالة الخطأ من السيرفر
            errorMessage.textContent = data.message || 'Login failed. Please try again.';
            errorMessage.style.display = 'block';
            loginButton.innerText = 'Login';
            loginButton.disabled = false;
        }
    } catch (error) {
        console.error('Error:', error);
        errorMessage.textContent = 'An error occurred. Please try again later.';
        errorMessage.style.display = 'block';
        loginButton.innerText = 'Login';
        loginButton.disabled = false;
    }
});
