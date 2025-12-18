document.addEventListener("DOMContentLoaded", () => {
    const nameForm = document.getElementById("name-form");
    const attendanceSection = document.getElementById("attendance-section");
    const enterNameBtn = document.getElementById("enter-name-btn");
    const studentNameInput = document.getElementById("student-name-input");
    const studentNameDisplay = document.getElementById("student-name-display");
    const markBtn = document.getElementById("mark-attendance-btn");
    const timeDisplay = document.getElementById("time");
    const statusMessage = document.getElementById("status-message");

    // Check if name is stored
    let studentName = localStorage.getItem("studentName");

    if (studentName) {
        nameForm.style.display = "none";
        attendanceSection.style.display = "block";
        studentNameDisplay.textContent = studentName;
        updateTime();
    }

    enterNameBtn.addEventListener("click", () => {
        const name = studentNameInput.value.trim();
        if (!name) {
            alert("Please enter your name.");
            return;
        }
        studentName = name;
        localStorage.setItem("studentName", studentName);
        nameForm.style.display = "none";
        attendanceSection.style.display = "block";
        studentNameDisplay.textContent = studentName;
        updateTime();
    });

    // Update time every second
    function updateTime() {
        timeDisplay.textContent = new Date().toLocaleTimeString();
        setTimeout(updateTime, 1000);
    }

    markBtn.addEventListener("click", () => {
        if (!navigator.geolocation) {
            statusMessage.textContent = "Geolocation is not supported by your browser.";
            return;
        }
        navigator.geolocation.getCurrentPosition(async (position) => {
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;

            // Example POST request to your Lambda API
            try {
                const response = await fetch("https://dhtdt05ncj.execute-api.ap-south-1.amazonaws.com/prod/attendance", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        DeviceID: "DEVICE-" + studentName.replace(/\s+/g, ""), // simple device ID
                        StudentName: studentName,
                        Latitude: latitude,
                        Longitude: longitude
                    })
                });
                const result = await response.text();
                statusMessage.textContent = result;
            } catch (err) {
                statusMessage.textContent = "Error marking attendance: " + err;
            }
        });
    });
});
