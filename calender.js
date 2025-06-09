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

        // Create 6 empty day cells for Sat, Sun, Mon, Tue, Wed, Thu
        for (let i = 0; i < 6; i++) {
            const dayCell = row.insertCell();
        }
    }

    // Map Django's weekday (0=Mon...6=Sun) to our table column index (0=Sat...5=Thu)
    const djangoToColumnMap = { 5: 1, 6: 2, 0: 3, 1: 4, 2: 5, 3: 6 };

    for (const dayIndexDjango in scheduleData) {
        const columnIndex = djangoToColumnMap[dayIndexDjango];
        if (columnIndex === undefined) continue;

        scheduleData[dayIndexDjango].forEach(session => {
            const sessionHour = parseInt(session.time.split(':')[0], 10);
            const rowIndex = sessionHour - 8;

            if (rowIndex >= 0 && rowIndex < tableBody.rows.length) {
                const cell = tableBody.rows[rowIndex].cells[columnIndex];
                
                const sessionElement = document.createElement('div');
                sessionElement.className = 'course-event';
                sessionElement.textContent = session.course_name;
                sessionElement.title = `Instructor: ${session.instructor_name}`;
                sessionElement.style.backgroundColor = getRandomColor(session.course_id);
                
                // Clear the cell before adding a new session to prevent duplicates
                if (cell) {
                    cell.appendChild(sessionElement);
                }
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
    const dayOfWeek = d.getDay(); // 0=Sunday, ..., 6=Saturday
    const diff = d.getDate() - dayOfWeek;
    return new Date(new Date(d.setDate(diff)).setHours(0, 0, 0, 0));
}

const PROJECT_START_DATE = new Date('2025-06-01');

function renderWeekTitle(startDate) {
    const weekTitle = document.getElementById('week-title');
    if (!weekTitle) return;
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 5);
    
    // حساب الفرق بالمللي ثانية
    const timeDiff = startDate.getTime() - PROJECT_START_DATE.getTime();
    // تحويل الفرق إلى أيام ثم إلى أسابيع
    const weekNumber = Math.floor(timeDiff / (1000 * 3600 * 24 * 7)) + 1;

    const options = { month: 'long', day: 'numeric' };
    const dateRange = `${startDate.toLocaleDateString('en-US', options)} - ${endDate.toLocaleDateString('en-US', options)}`;
    
    // ✅ تحديث محتوى العنوان ليشمل رقم الأسبوع والتاريخ
    weekTitle.innerHTML = `${dateRange} <br> <span class="week-number">Week ${weekNumber}</span>`;
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
    document.getElementById('addSessionBtn')?.addEventListener('click', openAddSessionModal);
    document.getElementById('closeSessionModal')?.addEventListener('click', closeAddSessionModal);
    document.getElementById('sessionForm')?.addEventListener('submit', handleAddSession);
    
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

async function openAddSessionModal() {
    await populateCoursesDropdown();
    await populateInstructorsDropdown();
    const modal = document.getElementById('addSessionModal');
    if (modal) {
        modal.style.display = 'flex';
    }
}

function closeAddSessionModal() {
    const modal = document.getElementById('addSessionModal');
    if (modal) {
        modal.style.display = 'none';
        document.getElementById('sessionForm').reset();
    }
}

async function handleAddSession(event) {
    event.preventDefault();
    const sessionData = {
        course: document.getElementById('sessionCourse').value,
        date: document.getElementById('sessionDate').value,
        time: document.getElementById('sessionTime').value,
        instructor: document.getElementById('sessionInstructor').value,
    };
    if (!sessionData.course || !sessionData.date || !sessionData.time || !sessionData.instructor) {
        return alert("Please fill all fields.");
    }
    const btn = event.target.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.innerText = 'Saving...';
    try {
        await addSingleSession(sessionData);
        alert('Session added successfully!');
        closeAddSessionModal();
        fetchAndRenderSchedule(currentWeekStartDate);
    } catch (error) {
        alert(`Error: ${error.message}`);
    } finally {
        btn.disabled = false;
        btn.innerText = 'Save Session';
    }
}

async function populateCoursesDropdown() {
    const courseSelect = document.getElementById('sessionCourse');
    if (!courseSelect) return;
    try {
        const courses = await getAllCourses();
        courseSelect.innerHTML = '<option value="">Select Course</option>';
        courses.forEach(course => {
            const option = document.createElement('option');
            option.value = course.id;
            option.textContent = `${course.name} (Level ${course.level})`;
            courseSelect.appendChild(option);
        });
    } catch (error) {
        console.error("Failed to load courses for dropdown:", error);
    }
}

async function populateInstructorsDropdown() {
    const instructorSelect = document.getElementById('sessionInstructor');
    if (!instructorSelect) return;
    try {
        const staff = await getStaffMembers();
        const instructors = staff.filter(m => m.role !== 'admin');
        instructorSelect.innerHTML = '<option value="">Select Instructor</option>';
        instructors.forEach(inst => {
            const option = document.createElement('option');
            option.value = inst.id;
            option.textContent = `${inst.name} (${inst.role})`;
            instructorSelect.appendChild(option);
        });
    } catch (error) {
        console.error("Failed to load instructors for dropdown:", error);
    }
}

function getRandomColor(seed) {
    const colors = ['#6c5ce7', '#00cec9', '#e84393', '#fdcb6e', '#2ecc71', '#9b59b6', '#e17055'];
    return colors[seed % colors.length];
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