// Replace this with your actual API Gateway URL (case-sensitive)
const API_URL = "https://dhtdt05ncj.execute-api.ap-south-1.amazonaws.com/prod/attendance";

// Generate or retrieve a unique device ID for this browser
function getDeviceID() {
    let deviceID = localStorage.getItem('deviceID');
    if (!deviceID) {
        deviceID = 'device-' + Math.random().toString(36).substring(2, 15);
        localStorage.setItem('deviceID', deviceID);
    }
    return deviceID;
}

// Show current time on the page
function showTime() {
    const timeElement = document.getElementById('time');
    if (!timeElement) return;
    setInterval(() => {
        const now = new Date();
        timeElement.textContent = now.toLocaleTimeString();
    }, 1000);
}

// Initialize page
function init() {
    showTime();

    const studentName = localStorage.getItem('studentName');
    const nameForm = document.getElementById('name-form');
    const attendanceSection = document.getElementById('attendance-section');

    // First-time user: show name form
    if (!studentName) {
        nameForm.style.display = 'block';
        attendanceSection.style.display = 'none';

        document.getElementById('enter-name-btn').addEventListener('click', () => {
            const nameInput = document.getElementById('student-name-input').value.trim();
            if (nameInput === "") {
                alert("Please enter your name");
                return;
            }
            localStorage.setItem('studentName', nameInput);
            nameForm.style.display = 'none';
            attendanceSection.style.display = 'block';
        });

    } else {
        // Returning user: skip name entry
        nameForm.style.display = 'none';
        attendanceSection.style.display = 'block';
    }

    // Mark Attendance button click
    document.getElementById('mark-attendance-btn').addEventListener('click', () => {
        const studentName = localStorage.getItem('studentName');
        const deviceID = getDeviceID();

        if (!navigator.geolocation) {
            alert("Geolocation is not supported by your browser");
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const latitude = position.coords.latitude;
                const longitude = position.coords.longitude;

                const payload = {
                    StudentName: studentName,
                    DeviceID: deviceID,
                    Latitude: latitude,
                    Longitude: longitude
                };

                fetch(API_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(payload)
                })
                .then(response => response.json())
                .then(data => {
                    if (data.statusCode === 200) {
                        alert("✅ Attendance marked successfully!");
                    } else {
                        alert("❌ " + data.body);
                    }
                })
                .catch(err => {
                    console.error(err);
                    alert("Error marking attendance. Check console.");
                });
            },
            (error) => {
                alert("Location access is required to mark attendance.");
            },
            { enableHighAccuracy: true }
        );
    });
}

// Run the init function after page load
window.onload = init;
