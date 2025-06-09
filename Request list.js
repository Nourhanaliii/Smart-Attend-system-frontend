// =================== Request list.js ===================

document.addEventListener('DOMContentLoaded', () => {
    // Auth check
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || !user.is_staff) {
        alert('You do not have permission to view this page.');
        window.location.href = 'home.html';
        return;
    }
    setupEventListeners();
    loadAndRenderRequests();
});

// --- Data Fetching and Rendering ---

async function loadAndRenderRequests() {
    const tableBody = document.querySelector('.container tbody');
    if (!tableBody) return;
    
    tableBody.innerHTML = '<tr><td colspan="5">Loading requests...</td></tr>';
    try {
        const requests = await getAttendanceRequests(); // from api.js
        renderRequests(requests);
    } catch (error) {
        tableBody.innerHTML = `<tr<td colspan="5" style="color:red;">Error: ${error.message}</td></tr>`;
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
        row.id = `request-row-${req.id}`; // Add an ID to the row for easy removal/update
        
        // Format date for better readability
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


// --- Event Handling ---

async function handleReviewRequest(requestId, action, buttonElement) {
    // Disable both buttons in the same container to prevent double-clicking
    const buttons = buttonElement.parentElement.querySelectorAll('button');
    buttons.forEach(btn => btn.disabled = true);
    
    try {
        const response = await reviewAttendanceRequest(requestId, action);
        alert(response.detail); // Show success message from backend

        // Update the UI dynamically
        const statusCell = buttonElement.closest('.status-cell');
        const approvedStatus = `<span class="status-approved">approved</span>`;
        const deniedStatus = `<span class="status-denied">denied</span>`;
        statusCell.innerHTML = (action === 'approve') ? approvedStatus : deniedStatus;

    } catch (error) {
        alert(`Error: ${error.message}`);
        // Re-enable buttons if the request fails
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
        await logout(); // from api.js
        localStorage.clear();
        window.location.href = 'home.html';
    } catch (error) {
        alert("Logout failed.");
    }
}