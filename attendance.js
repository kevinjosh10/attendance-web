const apiUrl = 'https://dhtdt05ncj.execute-api.ap-south-1.amazonaws.com/prod1/attendance';

const nameForm = document.getElementById('name-form');
const studentNameInput = document.getElementById('student-name-input');
const enterNameBtn = document.getElementById('enter-name-btn');
const attendanceSection = document.getElementById('attendance-section');
const markAttendanceBtn = document.getElementById('mark-attendance-btn');
const timeDisplay = document.getElementById('time');
const statusMessage = document.getElementById('status-message');
const welcomeDisplay = document.getElementById('student-name-display');

let deviceID = localStorage.getItem('deviceID');
let studentName = localStorage.getItem('studentName');

// Generate random deviceID if not exists
if (!deviceID) {
    deviceID = 'device-' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('deviceID', deviceID);
}

// Update time every second
setInterval(() => {
    const now = new Date();
    timeDisplay.textContent = now.toLocaleTimeString();
}, 1000);

// If studentName exists, skip name entry
if (studentName) {
    nameForm.style.display = 'none';
    attendanceSection.style.display = 'block';
    welcomeDisplay.textContent = studentName;
}

// Handle first-time name entry
enterNameBtn.addEventListener('click', () => {
    const name = studentNameInput.value.trim();
    if (!name) {
        alert('Please enter your name');
        return;
    }
    studentName = name;
    localStorage.setItem('studentName', studentName);
    welcomeDisplay.textContent = studentName;
    nameForm.style.display = 'none';
    attendanceSection.style.display = 'block';
});

// Handle attendance marking
markAttendanceBtn.addEventListener('click', () => {
    statusMessage.textContent = 'Getting location...';

    if (!navigator.geolocation) {
        statusMessage.textContent = 'Geolocation not supported by your browser';
        return;
    }

    navigator.geolocation.getCurrentPosition(
        async (position) => {
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;

            try {
                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        DeviceID: deviceID,
                        StudentName: studentName,
                        Latitude: latitude,
                        Longitude: longitude
                    })
                });

                const text = await response.text();

                if (response.ok) {
                    statusMessage.textContent = text;
                } else {
                    statusMessage.textContent = `Error: ${text}`;
                }

            } catch (error) {
                statusMessage.textContent = 'Error connecting to server';
                console.error(error);
            }
        },
        (error) => {
            statusMessage.textContent = 'Unable to retrieve your location';
            console.error(error);
        },
        { enableHighAccuracy: true, timeout: 10000 }
    );
});
