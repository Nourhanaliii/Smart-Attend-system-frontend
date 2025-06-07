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

    document.getElementById('submitLogin').addEventListener('click', () => {
    const userId = document.getElementById('userId').value;
    const password = document.getElementById('password').value;
    //console.log('User ID:', userId, 'Password:', password);
    //alert('Login submitted');
    if (userId && password) {
        // عرض رسالة تحميل
        const loginButton = document.getElementById('submitLogin');
        loginButton.innerText = 'Logging in...';
        loginButton.disabled = true;

        // إضافة تأثير احترافي عند التوجيه
        //document.body.style.opacity = '0.5';
        //document.body.style.transition = 'opacity 1s ease-in-out';

        // محاكاة عملية تسجيل الدخول (تأخير 1.5 ثانية)
        fetch('https://django.nextapps.me/api/members/login/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                //'X-CSRFToken': getCookie('csrftoken')  // optional, if CSRF is enabled
            },
            credentials: 'include',  // Important if your backend uses cookies/session
            body: JSON.stringify({
                email: userId,
                password: password
            })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Login failed');
            }
            return response.json();
        })
        .then(data => {
            console.log('Login successful:', data);
            window.location.href = 'dashboard.html';
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Login failed. Please check your credentials.');
            loginButton.innerText = 'Login';
            loginButton.disabled = false;
            document.body.style.opacity = '1';
        });
        // setTimeout(() => {
        //     // التوجيه إلى صفحة الـ Dashboard
        //     window.location.href = 'dashboard.html';
        // }, 1500);
    } else {
        // عرض رسالة تحذير عند وجود حقل فارغ
        alert('Please enter your username and password!');
    }
});

    const closePopup = document.getElementById('closePopup');
    closePopup.addEventListener('click', () => {
        loginPopup.style.display = 'none';
        overlay.style.display = 'none';
    });
