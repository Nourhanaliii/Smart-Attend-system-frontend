// =================== api.js ===================

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
    const defaultOptions = {
        mode: 'cors',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken'),
            ...options.headers,
        },
    };

    const requestOptions = { ...options, ...defaultOptions };
    
    // لا نرسل body فارغًا مع GET
    if (options.body) {
        requestOptions.body = JSON.stringify(options.body);
    }

    try {
        const response = await fetch(url, requestOptions);
        const responseData = await response.json();
        
        if (!response.ok) {
            console.error('API Error Response:', responseData);
            throw new Error(responseData.detail || responseData.error || 'An unknown API error occurred');
        }
        return responseData;
    } catch (error) {
        console.error('Fetch failed:', error.message);
        throw error;
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
    console.log("Attempting to log in with email:", email); // للتأكد من أن الدالة تُستدعى
    const url = `${API_BASE_URL}/api/auth/login/`;
    // نعم، هنا يتم استخدام fetch داخل apiRequest
    return apiRequest(url, {
        method: 'POST',
        body: { email, password }, // وهنا يتم وضع البيانات في الـ body
    });
}

// ... باقي دوال الـ API ستأتي هنا لاحقًا ...