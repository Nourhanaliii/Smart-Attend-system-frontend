// =================== api.js (The Final, Complete, and Correct Version) ===================

const API_BASE_URL = 'https://django.nextapps.me';

// --- General Purpose Request Functions ---

// For JSON data
async function apiRequest(url, options = {}) {
    const csrfToken = localStorage.getItem('csrfToken');
    const defaultOptions = {
        mode: 'cors',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
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
        if (response.status === 204) return null; // For successful DELETE requests
        
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

// For FormData (file uploads)
async function apiFormDataRequest(url, formData) {
    try {
        const csrfToken = localStorage.getItem('csrfToken');
        if (!csrfToken) throw new Error('CSRF token not found. Please log in again.');
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'X-CSRFToken': csrfToken },
            credentials: 'include',
            body: formData,
        });
        const result = await response.json();
        if (!response.ok) throw new Error(Object.values(result).flat().join(', '));
        return result;
    } catch (error) {
        console.error('API FormData Request Failed:', url, error);
        throw error;
    }
}


// --- 1. Authentication Functions ---
async function login(email, password) {
    const url = `${API_BASE_URL}/api/auth/login/`; 
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Login failed');
        return data;
    } catch (error) {
        console.error("Login API call failed:", error);
        throw error;
    }
}

async function logout() {
    const url = `${API_BASE_URL}/api/auth/logout/`;
    return apiRequest(url, { method: 'GET' });
}


// --- 2. Student Functions ---
async function getAllStudents() {
    const url = `${API_BASE_URL}/api/students/`;
    return apiRequest(url, { method: 'GET' });
}

async function addStudent(formData) {
    const url = `${API_BASE_URL}/api/students/add-new-student/`;
    return apiFormDataRequest(url, formData);
}

async function deleteStudent(studentId) {
    const url = `${API_BASE_URL}/api/students/${studentId}/delete/`;
    return apiRequest(url, { method: 'DELETE' });
}

async function updateStudent(studentId, data) {
    const url = `${API_BASE_URL}/api/students/update/${studentId}/`;
    return apiRequest(url, { method: 'PATCH', body: data });
}


// --- 3. Staff / Members Functions ---
async function getStaffMembers() {
    const url = `${API_BASE_URL}/api/auth/users/`;
    return apiRequest(url, { method: 'GET' });
}

async function addStaffMember(formData) {
    const url = `${API_BASE_URL}/api/auth/add-new-member/`;
    return apiFormDataRequest(url, formData);
}


// --- 4. Courses Functions ---
async function getAllCourses() {
    const url = `${API_BASE_URL}/api/courses/courses/`;
    return apiRequest(url, { method: 'GET' });
}

async function addCourse(courseData) {
    const url = `${API_BASE_URL}/api/courses/courses/`;
    return apiRequest(url, { method: 'POST', body: courseData });
}

async function updateCourse(courseId, courseData) {
    const url = `${API_BASE_URL}/api/courses/courses/${courseId}/`;
    return apiRequest(url, {
        method: 'PUT',
        body: courseData,
    });
}