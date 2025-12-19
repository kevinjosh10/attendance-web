const API_URL = 'https://dhtdt05ncj.execute-api.ap-south-1.amazonaws.com/prod1/attendance';

const nameForm = document.getElementById('name-form');
const nameInput = document.getElementById('student-name-input');
const enterBtn = document.getElementById('enter-name-btn');

const attendanceSection = document.getElementById('attendance-section');
const markBtn = document.getElementById('mark-attendance-btn');
const statusMessage = document.getElementById('status-message');
const nameDisplay = document.getElementById('student-name-display');
const timeDisplay = document.getElementById('time');

let studentName = localStorage.getItem('studentName');
let deviceId = localStorage.getItem('deviceId');

if (!deviceId) {
    deviceId = crypto.randomUUID();
    localStorage.setItem('deviceId', deviceId);
}

function updateTime() {
    const now = new Date();
    timeDisplay.textContent = now.toLocaleTimeString();
}
setInterval(updateTime, 1000);
updateTime();

if (studentName) {
    nameForm.style.display = 'none';
    attendanceSection.style.display = 'block';
    nameDisplay.textContent = studentName;
}

enterBtn.addEventListener('click', () => {
    const name = nameInput.value.trim();
    if (!name) {
        alert('Please enter your name');
        return;
    }
    localStorage.setItem('studentName', name);
    studentName = name;
    nameForm.style.display = 'none';
    attendanceSection.style.display = 'block';
    nameDisplay.textContent = studentName;
});

markBtn.addEventListener('click', () => {
    statusMessage.textContent = 'Getting location...';

    navigator.geolocation.getCurrentPosition(
        (position) => {
            sendAttendance(
                position.coords.latitude,
                position.coords.longitude
            );
        },
        () => {
            statusMessage.textContent = 'Location permission denied';
        }
    );
});

function sendAttendance(lat, lon) {
    fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            DeviceID: deviceId,
            StudentName: studentName,
            Latitude: lat,
            Longitude: lon
        })
    })
    .then(res => res.text())
    .then(msg => {
        statusMessage.textContent = msg;
    })
    .catch(() => {
        statusMessage.textContent = 'Error connecting to server';
    });
}
