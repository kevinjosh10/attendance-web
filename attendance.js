document.addEventListener("DOMContentLoaded", () => {
    const nameForm = document.getElementById("name-form");
    const studentNameInput = document.getElementById("student-name-input");
    const enterNameBtn = document.getElementById("enter-name-btn");

    const attendanceSection = document.getElementById("attendance-section");
    const markAttendanceBtn = document.getElementById("mark-attendance-btn");
    const statusMessage = document.getElementById("status-message");
    const studentNameDisplay = document.getElementById("student-name-display");
    const timeDisplay = document.getElementById("time");

    const apiUrl = "https://dhtdt05ncj.execute-api.ap-south-1.amazonaws.com/prod1/attendance";

    let studentName = localStorage.getItem("studentName");
    let deviceId = localStorage.getItem("deviceId") || generateDeviceId();

    if (studentName) {
        showAttendanceSection(studentName);
    } else {
        nameForm.style.display = "block";
    }

    enterNameBtn.addEventListener("click", () => {
        const name = studentNameInput.value.trim();
        if (!name) {
            alert("Please enter your name");
            return;
        }
        studentName = name;
        localStorage.setItem("studentName", studentName);
        showAttendanceSection(studentName);
    });

    markAttendanceBtn.addEventListener("click", () => {
        if (!navigator.geolocation) {
            alert("Geolocation not supported by your browser");
            return;
        }

        statusMessage.textContent = "Getting location...";

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const latitude = position.coords.latitude;
                const longitude = position.coords.longitude;
                const payload = {
                    DeviceID: deviceId,
                    StudentName: studentName,
                    Latitude: latitude,
                    Longitude: longitude
                };

                try {
                    const response = await fetch(apiUrl, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(payload)
                    });

                    if (!response.ok) {
                        const text = await response.text();
                        statusMessage.textContent = `Error: ${text}`;
                        return;
                    }

                    const text = await response.text();
                    statusMessage.textContent = text;
                    timeDisplay.textContent = new Date().toLocaleTimeString();
                } catch (err) {
                    statusMessage.textContent = "Error connecting to server";
                    console.error(err);
                }
            },
            (error) => {
                statusMessage.textContent = "Error getting location";
                console.error(error);
            },
            { enableHighAccuracy: true }
        );
    });

    function showAttendanceSection(name) {
        nameForm.style.display = "none";
        attendanceSection.style.display = "block";
        studentNameDisplay.textContent = name;
        timeDisplay.textContent = new Date().toLocaleTimeString();
    }

    function generateDeviceId() {
        const id = 'device-' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem("deviceId", id);
        return id;
    }
});
