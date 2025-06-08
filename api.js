// =================== api.js (النسخة المحدثة) ===================

const API_BASE_URL = 'https://django.nextapps.me';

// --- الدوال المساعدة (تبقى كما هي) ---
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

async function apiRequest(url, options = {}) {
    const defaultOptions = {
        mode: 'cors', credentials: 'include',
        headers: { 'Content-Type': 'application/json', 'X-CSRFToken': getCookie('csrftoken'), ...options.headers },
    };
    const requestOptions = { ...options, ...defaultOptions };
    if (options.body) { requestOptions.body = JSON.stringify(options.body); }
    try {
        const response = await fetch(url, requestOptions);
        if (response.status === 204) return null; // Handle No Content response for DELETE
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

// --- دوال المصادقة (تبقى كما هي) ---
async function login(email, password) {
    const url = `${API_BASE_URL}/api/members/login/`;
    return apiRequest(url, { method: 'POST', body: { email, password } });
}

// ✅ أضفنا دالة تسجيل الخروج هنا لتكون متاحة لكل الصفحات
async function logout() {
    const url = `${API_BASE_URL}/api/members/logout/`;
    return apiRequest(url, { method: 'GET' });
}


// =========== ✅ الجزء الجديد: دوال الطلاب (Students) ===========

/**
 * جلب قائمة كل الطلاب
 * @returns {Promise<Array>}
 */
async function getAllStudents() {
    const url = `${API_BASE_URL}/api/students/`;
    return apiRequest(url, { method: 'GET' });
}

/**
 * إضافة طالب جديد
 * @param {FormData} formData - يحتوي على (student_id, name, level, avatar)
 * @returns {Promise<object>}
 */
async function addStudent(formData) {
    const url = `${API_BASE_URL}/api/students/add-new-student/`;
    // الطلبات التي تحتوي على ملفات (FormData) تحتاج معاملة خاصة
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                // لا نضع 'Content-Type'، المتصفح سيضعها بنفسه
                'X-CSRFToken': getCookie('csrftoken'),
            },
            credentials: 'include',
            body: formData,
        });
        
        const result = await response.json();
        if (!response.ok) {
            const errorMsg = Object.values(result).flat().join(', ');
            throw new Error(errorMsg || 'Failed to add student');
        }
        return result;
    } catch (error) {
        console.error('Add student failed:', error);
        throw error;
    }
}

/**
 * حذف طالب
 * @param {string} studentId 
 * @returns {Promise<null>}
 */
async function deleteStudent(studentId) {
    const url = `${API_BASE_URL}/api/students/${studentId}/delete/`;
    return apiRequest(url, { method: 'DELETE' });
}

/**
 * تعديل بيانات طالب (بواسطة الأدمن)
 * @param {string} studentId 
 * @param {object} data - كائن يحتوي على { name, level, attendance }
 * @returns {Promise<object>}
 */
async function updateStudent(studentId, data) {
    const url = `${API_BASE_URL}/api/students/update/${studentId}/`;
    return apiRequest(url, {
        method: 'PATCH', // PATCH لتحديث جزئي
        body: data,
    });
}