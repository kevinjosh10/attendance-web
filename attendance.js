const nameForm = document.getElementById('name-form');
const studentNameInput = document.getElementById('student-name-input');
const enterNameBtn = document.getElementById('enter-name-btn');

const attendanceSection = document.getElementById('attendance-section');
const markAttendanceBtn = document.getElementById('mark-attendance-btn');
const statusMessage = document.getElementById('status-message');
const studentNameDisplay = document.getElementById('student-name-display');
const timeDisplay = document.getElementById('time');

let studentName = localStorage.getItem('studentName') || null;

// Show attendance section if name is already stored
if (studentName) {
    nameForm.style.display = 'none';
    attendanceSection.style.display = 'block';
    studentNameDisplay.textContent = studentName;
}

// Update time every second
setInterval(() => {
    const now = new Date();
    timeDisplay.textContent = now.toLocaleTimeString();
}, 1000);

// Handle first-time name entry
enterNameBtn.addEventListener('click', () => {
    const name = studentNameInput.value.trim();
    if (!name) {
        alert('Please enter your name');
        return;
    }
    studentName = name;
    localStorage.setItem('studentName', studentName);
    studentNameDisplay.textContent = studentName;
    nameForm.style.display = 'none';
    attendanceSection.style.display = 'block';
});

// Mark attendance
markAttendanceBtn.addEventListener('click', () => {
    statusMessage.textContent = 'Getting location...';
    if (!navigator.geolocation) {
        statusMessage.textContent = 'Geolocation not supported.';
        return;
    }

    navigator.geolocation.getCurrentPosition(async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        try {
            const response = await fetch(
                'https://dhtdt05ncj.execute-api.ap-south-1.amazonaws.com/prod1/attendance',
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        DeviceID: navigator.userAgent,
                        Latitude: lat,
                        Longitude: lon,
                        StudentName: studentName
                    })
                }
            );

            const text = await response.text();
            if (response.ok) {
                statusMessage.textContent = text;
            } else {
                statusMessage.textContent = `Error: ${text}`;
            }
        } catch (err) {
            statusMessage.textContent = 'Error connecting to server';
        }
    }, (err) => {
        statusMessage.textContent = 'Error getting location';
    });
});
