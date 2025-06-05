document.getElementById('submitLogin').addEventListener('click', () => {
    const userId = document.getElementById('userId').value;
    const password = document.getElementById('password').value;

    if (userId && password) {
        const loginBtn = document.getElementById('submitLogin');
        loginBtn.innerText = 'Logging in...';
        loginBtn.disabled = true;

        fetch('https://django.nextapps.me/api/members/login/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: userId,
                password: password
            })
        })
        .then(res => res.json())
        .then(data => {
            console.log('Login response:', data);

            if (data.token) {
                localStorage.setItem('token', data.token);
                window.location.href = 'dashboard.html';
            } else {
                alert('Login failed: ' + (data.detail || 'Check your credentials.'));
                loginBtn.innerText = 'Login';
                loginBtn.disabled = false;
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Something went wrong. Please try again.');
            loginBtn.innerText = 'Login';
            loginBtn.disabled = false;
        });
    } else {
        alert('Please enter your email and password!');
    }
});
