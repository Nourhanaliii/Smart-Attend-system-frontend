// =================== request_list.js (Final Dynamic Version) ===================

document.addEventListener('DOMContentLoaded', () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || !user.is_staff) {
        alert('You do not have permission to view this page.');
        window.location.href = 'home.html';
        return;
    }
    setupEventListeners();
    loadAndRenderRequests();
});

async function loadAndRenderRequests() {
    const tableBody = document.querySelector('.container tbody');
    if (!tableBody) return;
    tableBody.innerHTML = '<tr><td colspan="5">Loading requests...</td></tr>';
    try {
        const requests = await getAttendanceRequests(); // from api.js
        renderRequests(requests);
    } catch (error) {
        tableBody.innerHTML = `<tr><td colspan="5" style="color:red;">Error: ${error.message}</td></tr>`;
    }
}

function renderRequests(requestList) {
    const tableBody = document.querySelector('.container tbody');
    tableBody.innerHTML = '';
    if (!requestList || requestList.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="5">No pending requests found.</td></tr>';
        return;
    }
    requestList.forEach(req => {
        const row = document.createElement('tr');
        row.id = `request-row-${req.id}`;
        const formattedDate = new Date(req.created_at).toLocaleDateString();
        row.innerHTML = `
            <td>${req.student.id}</td>
            <td>${req.student.username}</td>
            <td>${req.student.level}</td>
            <td>${formattedDate}</td>
            <td class="status-cell">
                ${req.status === 'pending' ? `
                    <div class="status-buttons">
                        <button class="accept" onclick="handleReviewRequest(${req.id}, 'approve', this)">Accept</button>
                        <button class="reject" onclick="handleReviewRequest(${req.id}, 'deny', this)">Reject</button>
                    </div>
                ` : `<span class="status-${req.status}">${req.status}</span>`}
            </td>
        `;
        tableBody.appendChild(row);
    });
}

async function handleReviewRequest(requestId, action, buttonElement) {
    const buttons = buttonElement.parentElement.querySelectorAll('button');
    buttons.forEach(btn => btn.disabled = true);
    try {
        const response = await reviewAttendanceRequest(requestId, action);
        alert(response.detail);
        const statusCell = buttonElement.closest('.status-cell');
        const statusSpan = document.createElement('span');
        statusSpan.className = `status-${action}`;
        statusSpan.textContent = action;
        statusCell.innerHTML = '';
        statusCell.appendChild(statusSpan);
    } catch (error) {
        alert(`Error: ${error.message}`);
        buttons.forEach(btn => btn.disabled = false);
    }
}

function setupEventListeners() {
    const hamburger = document.querySelector('.hamburger');
    const sidebar = document.querySelector('.sidebar');
    if (hamburger && sidebar) {
        hamburger.addEventListener('click', () => sidebar.classList.toggle('active'));
    }
    const logoutLink = document.querySelector('a[onclick="handleLogout()"]');
    if (logoutLink) {
        logoutLink.addEventListener('click', (e) => { e.preventDefault(); handleLogout(); });
    }
}

async function handleLogout() {
    try {
        await logout();
        localStorage.clear();
        window.location.href = 'home.html';
    } catch (error) {
        alert("Logout failed.");
    }
}

