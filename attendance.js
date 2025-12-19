const API_URL = 'https://dhtdt05ncj.execute-api.ap-south-1.amazonaws.com/prod1/attendance';

const nameForm = document.getElementById('name-form');
const studentNameInput = document.getElementById('student-name-input');
const enterNameBtn = document.getElementById('enter-name-btn');

const attendanceSection = document.getElementById('attendance-section');
const studentNameDisplay = document.getElementById('student-name-display');
const markAttendanceBtn = document.getElementById('mark-attendance-btn');
const statusMessage = document.getElementById('status-message');
const timeDisplay = document.getElementById('time');

// Check if name is already stored
let studentName = localStorage.getItem('studentName');

if (studentName) {
    showAttendanceSection(studentName);
}

enterNameBtn.addEventListener('click', () => {
    const name = studentNameInput.value.trim();
    if (!name) {
        alert('Please enter your name');
        return;
    }
    localStorage.setItem('studentName', name);
    showAttendanceSection(name);
});

function showAttendanceSection(name) {
    nameForm.style.display = 'none';
    attendanceSection.style.display = 'block';
    studentNameDisplay.textContent = name;
    updateTime();
    setInterval(updateTime, 1000);
}

function updateTime() {
    const now = new Date();
    timeDisplay.textContent = now.toLocaleTimeString();
}

markAttendanceBtn.addEventListener('click', () => {
    if (!navigator.geolocation) {
        alert('Geolocation is not supported by your browser');
        return;
    }

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

                if (!response.ok) {
                    const text = await response.text();
                    statusMessage.style.color = 'red';
                    statusMessage.textContent = `Error: ${text}`;
                    return;
                }

                const result = await response.text();
                statusMessage.style.color = 'green';
                statusMessage.textContent = result;
            } catch (err) {
                statusMessage.style.color = 'red';
                statusMessage.textContent = 'Error connecting to server';
            }
        },
        (error) => {
            statusMessage.style.color = 'red';
            statusMessage.textContent = 'Error getting location';
        }
    );
});

// Simple device ID generator
function getDeviceID() {
    let deviceID = localStorage.getItem('deviceID');
    if (!deviceID) {
        deviceID = 'dev-' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('deviceID', deviceID);
    }
    return deviceID;
}
