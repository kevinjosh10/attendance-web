// ===== CONFIG =====
const API_URL = "https://dhtdt05ncj.execute-api.ap-south-1.amazonaws.com/prod1/attendance";

// ===== ELEMENTS =====
const nameForm = document.getElementById("name-form");
const nameInput = document.getElementById("student-name-input");
const enterBtn = document.getElementById("enter-name-btn");

const attendanceSection = document.getElementById("attendance-section");
const welcomeText = document.getElementById("student-name-display");
const timeSpan = document.getElementById("time");
const markBtn = document.getElementById("mark-attendance-btn");
const statusMsg = document.getElementById("status-message");

// ===== UTIL =====
function getDeviceId() {
    let id = localStorage.getItem("deviceId");
    if (!id) {
        id = "dev-" + Math.random().toString(36).substr(2, 9);
        localStorage.setItem("deviceId", id);
    }
    return id;
}

function showTime() {
    timeSpan.textContent = new Date().toLocaleTimeString();
}
setInterval(showTime, 1000);
showTime();

// ===== PAGE LOAD =====
window.onload = () => {
    const savedName = localStorage.getItem("studentName");
    if (savedName) {
        welcomeText.textContent = savedName;
        nameForm.style.display = "none";
        attendanceSection.style.display = "block";
    }
};

// ===== NAME SUBMIT =====
enterBtn.addEventListener("click", () => {
    const name = nameInput.value.trim();
    if (!name) {
        alert("Please enter your name");
        return;
    }

    localStorage.setItem("studentName", name);
    welcomeText.textContent = name;

    nameForm.style.display = "none";
    attendanceSection.style.display = "block";
});

// Enable ENTER key
nameInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        enterBtn.click();
    }
});

// ===== MARK ATTENDANCE =====
markBtn.addEventListener("click", () => {
    statusMsg.textContent = "Getting location...";

    if (!navigator.geolocation) {
        statusMsg.textContent = "Geolocation not supported";
        return;
    }

    navigator.geolocation.getCurrentPosition(
        async (pos) => {
            const payload = {
                DeviceID: getDeviceId(),
                StudentName: localStorage.getItem("studentName"),
                Latitude: pos.coords.latitude,
                Longitude: pos.coords.longitude
            };

            try {
                const res = await fetch(API_URL, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                });

                const text = await res.text();

                if (res.ok) {
                    statusMsg.textContent = text;
                } else {
                    statusMsg.textContent = "Error: " + text;
                }
            } catch (err) {
                statusMsg.textContent = "Error connecting to server";
            }
        },
        () => {
            statusMsg.textContent = "Location permission denied";
        }
    );
});
