// =================== api.js ===================
// هذا الملف سيحتوي على كل دوال التواصل مع الباكاند

const API_BASE_URL = 'https://django.nextapps.me';

/**
 * دالة مساعدة لقراءة قيمة كوكي معين بالاسم
 * @param {string} name - اسم الكوكي (مثل 'csrftoken')
 * @returns {string|null} - قيمة الكوكي أو null
 */
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

/**
 * دالة لإرسال طلبات fetch مع معالجة الأخطاء والكوكيز
 * @param {string} url - رابط الـ API
 * @param {object} options - إعدادات الطلب (method, headers, body)
 * @returns {Promise<any>} - بيانات الرد من السيرفر
 */
async function apiRequest(url, options = {}) {
    // إعدادات افتراضية لكل الطلبات
    const defaultOptions = {
        mode: 'cors',
        credentials: 'include', // أهم جزء لإرسال واستقبال الكوكيز
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken'), // إرسال التوكن مع كل طلب
            ...options.headers,
        },
    };

    const requestOptions = { ...options, ...defaultOptions };
    // إذا كان الطلب GET، لا نرسل body
    if (requestOptions.method === 'GET' || requestOptions.method === 'HEAD') {
        delete requestOptions.body;
    } else {
        requestOptions.body = JSON.stringify(options.body);
    }

    try {
        const response = await fetch(url, requestOptions);
        if (!response.ok) {
            const errorData = await response.json();
            console.error('API Error:', errorData);
            // رمي الخطأ ليتم التقاطه في دالة catch
            throw new Error(errorData.detail || errorData.error || 'An unknown error occurred');
        }
        // إذا كان الرد فارغًا (مثل 204 No Content)
        if (response.status === 204) {
            return null;
        }
        return await response.json();
    } catch (error) {
        console.error('Fetch failed:', error);
        throw error; // إعادة رمي الخطأ لمعالجته في مكان استدعاء الدالة
    }
}


// =========== دوال المصادقة (Authentication) ===========

/**
 * تسجيل دخول المستخدم (Admin/Stuff)
 * @param {string} email 
 * @param {string} password 
 * @returns {Promise<object>} - بيانات المستخدم
 */
async function login(email, password) {
    const url = `${API_BASE_URL}/api/auth/login/`;
    return apiRequest(url, {
        method: 'POST',
        body: { email, password },
    });
}

/**
 * تسجيل الخروج
 */
async function logout() {
    const url = `${API_BASE_URL}/api/auth/logout/`;
    // طلب GET لا يحتاج body
    return apiRequest(url, { method: 'GET' });
}


// =========== دوال الطلاب (Students) ===========

// ... سنضيفها لاحقًا ...


// =========== دوال الكورسات (Courses) ===========

// ... سنضيفها لاحقًا ...

// =========== دوال الطلبات (Requests) ===========

// ... سنضيفها لاحقًا ...