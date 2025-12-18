const API_URL = "https://dhtdt05ncj.execute-api.ap-south-1.amazonaws.com/prod1/attendance";

const nameForm = document.getElementById("name-form");
const attendanceSection = document.getElementById("attendance-section");
const nameInput = document.getElementById("student-name-input");
const enterBtn = document.getElementById("enter-name-btn");
const markBtn = document.getElementById("mark-attendance-btn");
const welcomeText = document.getElementById("student-name-display");
const timeText = document.getElementById("time");
const statusMsg = document.getElementById("status-message");

let deviceId = localStorage.getItem("deviceId");
if (!deviceId) {
    deviceId = crypto.randomUUID();
    localStorage.setItem("deviceId", deviceId);
}

const savedName = localStorage.getItem("studentName");

if (savedName) {
    showAttendance(savedName);
}

enterBtn.onclick = () => {
    const name = nameInput.value.trim();
    if (!name) {
        alert("Enter your name");
        return;
    }
    localStorage.setItem("studentName", name);
    showAttendance(name);
};

function showAttendance(name) {
    nameForm.style.display = "none";
    attendanceSection.style.display = "block";
    welcomeText.textContent = name;
    updateTime();
}

function updateTime() {
    setInterval(() => {
        timeText.textContent = new Date().toLocaleTimeString();
    }, 1000);
}

markBtn.onclick = () => {
    statusMsg.textContent = "Checking location...";

    navigator.geolocation.getCurrentPosition(
        (pos) => {
            sendAttendance(
                pos.coords.latitude,
                pos.coords.longitude
            );
        },
        () => {
            statusMsg.textContent = "Location permission denied";
        }
    );
};

function sendAttendance(lat, lon) {
    fetch(API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            DeviceID: deviceId,
            StudentName: localStorage.getItem("studentName"),
            Latitude: lat,
            Longitude: lon
        })
    })
    .then(res => res.text())
    .then(msg => {
        statusMsg.textContent = msg;
    })
    .catch(() => {
        statusMsg.textContent = "Error connecting to server";
    });
}
