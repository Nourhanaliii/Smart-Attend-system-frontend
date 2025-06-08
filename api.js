// =================== api.js (النسخة النهائية - تعتمد على localStorage) ===================

const API_BASE_URL = 'https://django.nextapps.me';

// 🔴 تم حذف دالة getCookie() بالكامل، لم نعد بحاجة إليها.


// --- دالة إرسال الطلبات العامة (تم تعديلها) ---
/**
 * دالة لإرسال طلبات fetch بصيغة JSON، وتقرأ التوكن من localStorage
 */
async function apiRequest(url, options = {}) {
    // ✅ نقرأ التوكن من localStorage
    const csrfToken = localStorage.getItem('csrfToken');

    const defaultOptions = {
        mode: 'cors', 
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            // ✅ نستخدم التوكن الذي قرأناه من localStorage
            'X-CSRFToken': csrfToken,
            ...options.headers
        },
    };

    const requestOptions = { ...options, ...defaultOptions };
    if (options.body) {
        requestOptions.body = JSON.stringify(options.body);
    }

    try {
        const response = await fetch(url, requestOptions);
        if (response.status === 204) return null; // لطلبات الحذف الناجحة
        
        const responseData = await response.json();
        if (!response.ok) {
            const errorMsg = Object.values(responseData).flat().join(', ');
            throw new Error(errorMsg || 'An unknown API error occurred');
        }
        return responseData;
    } catch (error) {
        console.error('API Request Failed:', url, error);
        throw error;
    }
}


// --- 1. دوال المصادقة (لا تغيير هنا) ---
async function login(email, password) {
    // ملاحظة: هذا الطلب لا يحتاج CSRF لأنه هو الذي ينشئه
    const url = `${API_BASE_URL}/api/members/login/`;
    // يمكننا استخدام fetch مباشرة هنا لتجنب إرسال توكن قديم أو فارغ
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ email, password }),
        });
        const data = await response.json();
        if(!response.ok) {
            throw new Error(data.error || 'Login failed');
        }
        return data;
    } catch(error) {
        console.error("Login API call failed:", error);
        throw error;
    }
}

async function logout() {
    const url = `${API_BASE_URL}/api/members/logout/`;
    return apiRequest(url, { method: 'GET' });
}


// --- 2. دوال الطلاب (تم تعديل addStudent) ---
async function getAllStudents() {
    const url = `${API_BASE_URL}/api/students/`;
    return apiRequest(url, { method: 'GET' });
}

/**
 * إضافة طالب جديد - تستخدم fetch مباشرة للتعامل مع FormData
 */
async function addStudent(formData) {
    const url = `${API_BASE_URL}/api/students/add-new-student/`;
    try {
        // ✅ نقرأ التوكن من localStorage
        const csrfToken = localStorage.getItem('csrfToken');
        if (!csrfToken) {
            throw new Error('CSRF token not found in storage. Please log in again.');
        }

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                // لا نضع 'Content-Type' هنا
                'X-CSRFToken': csrfToken,
            },
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
    const url = `${API_-BASE_URL}/api/students/update/${studentId}/`;
    return apiRequest(url, { method: 'PATCH', body: data });
}

// --- 3. دوال فريق العمل (Stuff) ---
// ... سنضيفها لاحقًا ...