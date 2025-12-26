// API endpoint
const API_URL = 'https://dhtdt05ncj.execute-api.ap-south-1.amazonaws.com/prod1/attendance';

// Sections
const userFormSection = document.getElementById('user-form-section');
const attendanceSection = document.getElementById('attendance-section');

// Form elements
const studentNameInput = document.getElementById('student-name-input');
const departmentInput = document.getElementById('department-input');
const yearSelect = document.getElementById('year-select');
const saveDetailsBtn = document.getElementById('save-details-btn');

// Display elements
const studentNameDisplay = document.getElementById('student-name-display');
const studentDeptDisplay = document.getElementById('student-dept-display');
const studentYearDisplay = document.getElementById('student-year-display');

const todayDisplay = document.getElementById('today-display');
const timeDisplay = document.getElementById('time-display');

const statusMessage = document.getElementById('status-message');
const markAttendanceBtn = document.getElementById('mark-attendance-btn');

// Header date/time
const currentDateEl = document.getElementById('current-date');
const currentTimeEl = document.getElementById('current-time');

// Load saved data from localStorage
let storedName = localStorage.getItem('studentName');
let storedDept = localStorage.getItem('studentDept');
let storedYear = localStorage.getItem('studentYear');

if (storedName && storedDept && storedYear) {
    showAttendanceSection(storedName, storedDept, storedYear);
} else {
    userFormSection.style.display = 'block';
    attendanceSection.style.display = 'none';
}

// Save details button handler
saveDetailsBtn.addEventListener('click', () => {
    const name = studentNameInput.value.trim();
    const dept = departmentInput.value.trim();
    const year = yearSelect.value;

    if (!name || !dept || !year) {
        alert('Please fill in all the fields');
        return;
    }

    localStorage.setItem('studentName', name);
    localStorage.setItem('studentDept', dept);
    localStorage.setItem('studentYear', year);

    showAttendanceSection(name, dept, year);
});

// Show attendance section
function showAttendanceSection(name, dept, year) {
    userFormSection.style.display = 'none';
    attendanceSection.style.display = 'block';

    studentNameDisplay.textContent = name;
    studentDeptDisplay.textContent = dept;
    studentYearDisplay.textContent = `${year} Year`;

    const today = new Date();
    todayDisplay.textContent = today.toLocaleDateString();

    updateTime();
    setInterval(updateTime, 1000);
}

// Update date/time
function updateTime() {
    const now = new Date();
    const dateStr = now.toLocaleDateString();
    const timeStr = now.toLocaleTimeString();

    if (currentDateEl) currentDateEl.textContent = dateStr;
    if (currentTimeEl) currentTimeEl.textContent = timeStr;

    timeDisplay.textContent = timeStr;
}

// Mark attendance button handler
markAttendanceBtn.addEventListener('click', () => {
    if (!navigator.geolocation) {
        alert('Geolocation is not supported by your browser');
        return;
    }

    statusMessage.classList.remove('success', 'error');
    statusMessage.textContent = 'Getting location...';

    navigator.geolocation.getCurrentPosition(
        async (position) => {
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;

            const studentName = localStorage.getItem('studentName');
            const studentDept = localStorage.getItem('studentDept');
            const studentYear = localStorage.getItem('studentYear');

            try {
                const response = await fetch(API_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        // These keys must match your Lambda / Postman body
                        DeviceID: getDeviceID(),
                        StudentName: studentName,
                        Department: studentDept,
                        Year: studentYear,
                        Latitude: latitude,
                        Longitude: longitude
                    })
                });

                const text = await response.text();
                let data;
                try {
                    data = JSON.parse(text);
                } catch {
                    data = { message: text };
                }

                if (!response.ok) {
                    statusMessage.classList.add('error');
                    statusMessage.textContent =
                        data && data.message ? `Error: ${data.message}` : `Error: ${text}`;
                    return;
                }

                statusMessage.classList.add('success');
                statusMessage.textContent =
                    data && data.message ? data.message : text;
            } catch (err) {
                statusMessage.classList.add('error');
                statusMessage.textContent = 'Error connecting to server: ' + err;
            }
        },
        () => {
            statusMessage.classList.add('error');
            statusMessage.textContent = 'Error getting location';
        }
    );
});

// Generate / reuse a simple device ID
function getDeviceID() {
    let deviceID = localStorage.getItem('deviceID');
    if (!deviceID) {
        deviceID = 'dev-' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('deviceID', deviceID);
    }
    return deviceID;
}
