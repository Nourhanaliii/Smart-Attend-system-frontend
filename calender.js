// =================== calender.js (Final and Complete Version) ===================

document.addEventListener('DOMContentLoaded', () => {
    // Auth check
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || !user.is_staff) {
        alert('You do not have permission to view this page.');
        window.location.href = 'home.html';
        return;
    }
    
    initializeCalendar();
    setupEventListeners();
});

// State variable to hold the start date of the currently viewed week (starts on Saturday)
let currentWeekStartDate = getStartOfWeek(new Date());

function initializeCalendar() {
    renderWeekTitle(currentWeekStartDate);
    fetchAndRenderSchedule(currentWeekStartDate);
}

async function fetchAndRenderSchedule(startDate) {
    const tableBody = document.getElementById('scheduleBody');
    if (!tableBody) return;

    clearScheduleGrid();
    tableBody.innerHTML = '<tr><td colspan="7">Loading schedule...</td></tr>';

    const dateString = startDate.toISOString().split('T')[0];
    
    try {
        const scheduleData = await getWeeklySchedule(dateString); // from api.js
        renderSchedule(scheduleData);
    } catch (error) {
        console.error("Failed to fetch schedule:", error);
        tableBody.innerHTML = `<tr><td colspan="7" style="color:red;">Error: ${error.message}</td></tr>`;
    }
}

function renderSchedule(scheduleData) {
    const tableBody = document.getElementById('scheduleBody');
    tableBody.innerHTML = '';

    // Create time rows from 8 AM to 6 PM (18:00)
    for (let hour = 8; hour <= 18; hour++) {
        const row = tableBody.insertRow();
        const timeCell = row.insertCell();
        timeCell.textContent = `${hour}:00`;

        // Create 6 empty day cells
        for (let i = 0; i < 6; i++) {
            const dayCell = row.insertCell();
            dayCell.dataset.dayIndex = i; // 0=Sat, 1=Sun, ...
        }
    }

    // Map Django's weekday (0=Mon, 6=Sun) to our table column index (0=Sat, 1=Sun, ...)
    const djangoToColumnMap = { 5: 0, 6: 1, 0: 2, 1: 3, 2: 4, 3: 5 }; // Sat, Sun, Mon...

    for (const dayIndexDjango in scheduleData) {
        const columnIndex = djangoToColumnMap[dayIndexDjango];
        if (columnIndex === undefined) continue;

        scheduleData[dayIndexDjango].forEach(session => {
            const sessionHour = parseInt(session.time.split(':')[0], 10);
            const rowIndex = sessionHour - 8; // 8:00 is row 0, 9:00 is row 1...

            if (rowIndex >= 0 && rowIndex < tableBody.rows.length) {
                const cell = tableBody.rows[rowIndex].cells[columnIndex + 1]; // +1 to skip time column
                
                const sessionElement = document.createElement('div');
                sessionElement.className = 'course-event';
                sessionElement.textContent = session.course_name;
                sessionElement.title = `Instructor: ${session.instructor_name}`;
                sessionElement.style.backgroundColor = getRandomColor(session.course_id);
                
                cell.appendChild(sessionElement);
            }
        });
    }
}

function navigateWeek(direction) {
    const dayIncrement = direction === 'next' ? 7 : -7;
    currentWeekStartDate.setDate(currentWeekStartDate.getDate() + dayIncrement);
    initializeCalendar();
}

function getStartOfWeek(date) {
    const d = new Date(date);
    const dayOfWeek = d.getDay(); // 0=Sunday, 1=Monday, ..., 6=Saturday
    const diff = d.getDate() - dayOfWeek + (dayOfWeek === 6 ? 0 : -1); // Adjust to get Saturday
    return new Date(new Date(d.setDate(diff)).setHours(0, 0, 0, 0));
}

function renderWeekTitle(startDate) {
    const weekTitle = document.getElementById('week-title');
    if (!weekTitle) return;
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 5); // Saturday to Thursday
    
    const options = { month: 'long', day: 'numeric' };
    weekTitle.textContent = `${startDate.toLocaleDateString('en-US', options)} - ${endDate.toLocaleDateString('en-US', options)}`;
}

function clearScheduleGrid() {
    const tableBody = document.getElementById('scheduleBody');
    if (tableBody) {
        tableBody.innerHTML = '';
    }
}

function setupEventListeners() {
    document.getElementById('prev-week-btn')?.addEventListener('click', () => navigateWeek('prev'));
    document.getElementById('next-week-btn')?.addEventListener('click', () => navigateWeek('next'));
    
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

function getRandomColor(seed) {
    const colors = ['#6c5ce7', '#00cec9', '#e84393', '#fdcb6e', '#2ecc71', '#9b59b6', '#e17055'];
    // Use the course ID to get a consistent color for the same course
    return colors[seed % colors.length];
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