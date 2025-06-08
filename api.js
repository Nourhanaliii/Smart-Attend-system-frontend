// =================== api.js ===================

const API_BASE_URL = 'https://django.nextapps.me';

/**
 * دالة مساعدة لقراءة قيمة كوكي معين بالاسم
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
 * دالة لإرسال طلبات fetch بصيغة JSON
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