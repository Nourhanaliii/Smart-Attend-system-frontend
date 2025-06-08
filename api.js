// =================== api.js (النسخة النهائية والمصححة تمامًا) ===================

const API_BASE_URL = 'https://django.nextapps.me';

// --- الدوال المساعدة (لا تغيير هنا) ---
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

// --- دالة إرسال الطلبات العامة (لا تغيير هنا) ---
async function apiRequest(url, options = {}) {
    const defaultOptions = {
        mode: 'cors', credentials: 'include',
        headers: { 'Content-Type': 'application/json', 'X-CSRFToken': getCookie('csrftoken'), ...options.headers },
    };
    const requestOptions = { ...options, ...defaultOptions };
    if (options.body) { requestOptions.body = JSON.stringify(options.body); }
    try {
        const response = await fetch(url, requestOptions);
        if (response.status === 204) return null;
        const responseData = await response.json();
        if (!response.ok) {
            const errorMsg = Object.values(responseData).flat().join(', ');
            throw new Error(errorMsg || 'An unknown API error occurred');
        }
        return responseData;
    } catch (error) {
        console.error('Fetch failed:', error.message);
        throw error;
    }
}

// =========================================================================
// ✅ الجزء الذي تم إصلاحه: تعريف كل الدوال بشكل صحيح ومنظم
// =========================================================================

// --- 1. دوال المصادقة ---
async function login(email, password) {
    const url = `${API_BASE_URL}/api/members/login/`;
    return apiRequest(url, { method: 'POST', body: { email, password } });
}

async function logout() {
    const url = `${API_BASE_URL}/api/members/logout/`;
    return apiRequest(url, { method: 'GET' });
}

// --- 2. دوال الطلاب ---
async function getAllStudents() {
    const url = `${API_BASE_URL}/api/students/`;
    return apiRequest(url, { method: 'GET' });
}

async function addStudent(formData) {
    const url = `${API_BASE_URL}/api/students/add-new-student/`;
    try {
        const csrfToken = getCookie('csrftoken');
        if (!csrfToken) {
            throw new Error('CSRF token not found. Please log in again.');
        }
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'X-CSRFToken': csrfToken },
            credentials: 'include',
            body: formData,
        });
        const result = await response.json();
        if (!response.ok) {
            const errorMsg = Object.values(result).flat().join(', ');
            throw new Error(errorMsg || 'Failed to add student.');
        }
        return result;
    } catch (error) {
        console.error('Add student API call failed:', error);
        throw error;
    }
}

async function deleteStudent(studentId) {
    const url = `${API_BASE_URL}/api/students/${studentId}/delete/`;
    return apiRequest(url, { method: 'DELETE' });
}

async function updateStudent(studentId, data) {
    const url = `${API_BASE_URL}/api/students/update/${studentId}/`;
    return apiRequest(url, { method: 'PATCH', body: data });
}

// --- 3. دوال فريق العمل (Stuff) ---
// ... سنضيفها لاحقًا عند العمل على صفحة Stuff ...