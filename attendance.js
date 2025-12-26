const API_URL = 'https://dhtdt05ncj.execute-api.ap-south-1.amazonaws.com/prod1/attendance';

const userFormSection = document.getElementById('user-form-section');
const attendanceSection = document.getElementById('attendance-section');

const studentNameInput = document.getElementById('student-name-input');
const departmentInput = document.getElementById('department-input');
const yearSelect = document.getElementById('year-select');
const saveDetailsBtn = document.getElementById('save-details-btn');

const studentNameDisplay = document.getElementById('student-name-display');
const studentDeptDisplay = document.getElementById('student-dept-display');
const studentYearDisplay = document.getElementById('student-year-display');

const todayDisplay = document.getElementById('today-display');
const timeDisplay = document.getElementById('time-display');

const statusMessage = document.getElementById('status-message');
const markAttendanceBtn = document.getElementById('mark-attendance-btn');

const currentDateEl = document.getElementById('current-date');
const currentTimeEl = document.getElementById('current-time');

// Load saved data
let storedName = localStorage.getItem('studentName');
let storedDept = localStorage.getItem('studentDept');
let storedYear = localStorage.getItem('studentYear');

if (storedName && storedDept && storedYear) {
    showAttendanceSection(storedName, storedDept, storedYear);
} else {
    userFormSection.style.display = 'block';
    attendanceSection.style.display = 'none';
}

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

function updateTime() {
    const now = new Date();
    const dateStr = now.toLocaleDateString();
    const timeStr = now.toLocaleTimeString();

    if (currentDateEl) currentDateEl.textContent = dateStr;
    if (currentTimeEl) currentTimeEl.textContent = timeStr;

    timeDisplay.textContent = timeStr;
}

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

            try {
                const response = await fetch(API_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        DeviceID: getDeviceID(),
                        StudentName: localStorage.getItem('studentName'),
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

function getDeviceID() {
    let deviceID = localStorage.getItem('deviceID');
    if (!deviceID) {
        deviceID = 'dev-' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('deviceID', deviceID);
    }
    return deviceID;
}
