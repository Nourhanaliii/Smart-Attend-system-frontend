// =================== common.js (للوظائف المشتركة) ===================

document.addEventListener('DOMContentLoaded', () => {
    // Auth check
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
        // إذا كان المستخدم في صفحة غير صفحة الدخول، قم بإعادته
        if (!window.location.pathname.endsWith('home.html') && !window.location.pathname.endsWith('/')) {
            window.location.href = 'home.html';
        }
        return;
    }
    
    // تهيئة الوظائف المشتركة
    initSidebar();
    initNotifications();
    updateAdminNotificationBell(); // جلب عدد الإشعارات عند تحميل أي صفحة
});

// --- الوظائف المشتركة ---

function initSidebar() {
    const hamburger = document.querySelector('.hamburger');
    const sidebar = document.querySelector('.sidebar');
    if (hamburger && sidebar) {
        hamburger.addEventListener('click', () => sidebar.classList.toggle('active'));
    }
}

function initNotifications() {
    const bell = document.getElementById('notification-bell');
    const panel = document.getElementById('notificationPopup');
    const closeBtn = document.getElementById('closeNotifications');
    
    bell?.addEventListener('click', (e) => {
        e.stopPropagation();
        panel.classList.toggle('active');
        if (panel.classList.contains('active')) {
            populateAdminNotifications();
            // تصفير العداد في الواجهة فقط عند الفتح
            const badge = bell.querySelector('.notification-count');
            if(badge) badge.style.display = 'none';
        }
    });
    
    closeBtn?.addEventListener('click', () => panel.classList.remove('active'));
}

async function populateAdminNotifications() {
    const list = document.getElementById('notificationList');
    if(!list) return;
    list.innerHTML = '<li class="notification-item">Loading...</li>';
    try {
        const notifications = await getAdminNotifications(); // From api.js
        list.innerHTML = '';
        if (notifications.length === 0) {
            list.innerHTML = '<li class="notification-item">No new notifications.</li>';
        } else {
            notifications.forEach(notif => {
                const item = document.createElement('li');
                item.className = 'notification-item';
                const iconClass = notif.type === 'new_request' ? 'fa-exclamation-circle' : 'fa-robot';
                item.innerHTML = `<i class="fas ${iconClass}"></i><p>${notif.message}</p>`;
                list.appendChild(item);
            });
        }
    } catch (error) {
        list.innerHTML = '<li class="notification-item">Could not load notifications.</li>';
    }
}

async function updateAdminNotificationBell() {
    const badge = document.getElementById('notification-count');
    if (!badge) return;
    try {
        const notifications = await getAdminNotifications();
        const count = notifications.filter(n => n.type === 'new_request').length; // عد فقط الطلبات الجديدة
        badge.textContent = count;
        badge.style.display = count > 0 ? 'flex' : 'none';
    } catch (error) {
        console.error("Could not update notification bell:", error);
    }
}

async function handleLogout() {
    try {
        await logout(); // From api.js
        localStorage.clear();
        window.location.href = 'home.html';
    } catch (error) {
        alert("Logout failed.");
    }
}