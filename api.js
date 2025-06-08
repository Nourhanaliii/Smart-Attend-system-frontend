// =================== api.js (النسخة النهائية والمصححة) ===================

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

// --- دوال المصادقة (تبقى كما هي) ---
async function apiRequest(url, options = {}) { /* ... الكود هنا لا يتغير ... */ }
async function login(email, password) { /* ... الكود هنا لا يتغير ... */ }
async function logout() { /* ... الكود هنا لا يتغير ... */ }


// =========== ✅ الجزء الذي سنقوم بتعديله: دوال الطلاب (Students) ===========

/**
 * جلب قائمة كل الطلاب
 */
async function getAllStudents() {
    const url = `${API_BASE_URL}/api/students/`;
    return apiRequest(url, { method: 'GET' });
}

/**
 * إضافة طالب جديد
 * @param {FormData} formData - يحتوي على (student_id, name, level, avatar)
 */
async function addStudent(formData) {
    const url = `${API_BASE_URL}/api/students/add-new-student/`;
    
    // 🔴 هذا هو التعديل الجوهري. سنستخدم fetch مباشرة هنا 
    // لضمان التحكم الكامل في الـ Headers عند التعامل مع FormData.
    try {
        const csrfToken = getCookie('csrftoken'); // نقرأ التوكن أولاً
        if (!csrfToken) {
            // إذا لم نجد التوكن، نطلق خطأ واضحًا
            throw new Error('CSRF token not found. Please log in again.');
        }

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                // لا نضع 'Content-Type'، المتصفح سيحددها بنفسه مع FormData
                'X-CSRFToken': csrfToken, // نرسل التوكن الذي قرأناه
            },
            credentials: 'include', // مهم جدًا لإرسال الكوكيز
            body: formData,
        });
        
        const result = await response.json();
        if (!response.ok) {
            // معالجة رسائل الخطأ من الباكاند
            const errorMsg = Object.values(result).flat().join(', ');
            throw new Error(errorMsg || 'Failed to add student due to a server error.');
        }
        return result;

    } catch (error) {
        console.error('Add student API call failed:', error);
        // إعادة رمي الخطأ ليتم التقاطه في student.js وعرضه للمستخدم
        throw error;
    }
}


/**
 * حذف طالب
 */
async function deleteStudent(studentId) {
    const url = `${API_BASE_URL}/api/students/${studentId}/delete/`;
    return apiRequest(url, { method: 'DELETE' });
}

/**
 * تعديل بيانات طالب
 */
async function updateStudent(studentId, data) {
    const url = `${API_BASE_URL}/api/students/update/${studentId}/`;
    return apiRequest(url, {
        method: 'PATCH',
        body: data,
    });
}