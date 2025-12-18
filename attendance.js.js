const API_URL = "https://dhtdt05ncj.execute-api.ap-south-1.amazonaws.com/prod/attendance"; // Your API

// Show current time every second
function updateTime() {
    const now = new Date();
    document.getElementById("currentTime").innerText = now.toLocaleTimeString();
}
setInterval(updateTime, 1000);

// Check if name already saved
window.onload = function() {
    const name = localStorage.getItem("studentName");
    if(name){
        document.getElementById("displayName").innerText = name;
        document.getElementById("nameForm").style.display = "none";
        document.getElementById("attendanceSection").style.display = "block";
    }
}

// Save name for first-time user
function saveName() {
    const nameInput = document.getElementById("studentName").value.trim();
    if(nameInput === "") {
        alert("Please enter your name");
        return;
    }
    localStorage.setItem("studentName", nameInput);
    document.getElementById("displayName").innerText = nameInput;
    document.getElementById("nameForm").style.display = "none";
    document.getElementById("attendanceSection").style.display = "block";
}

// Mark attendance
function markAttendance() {
    const name = localStorage.getItem("studentName");
    if(!name) {
        alert("Name missing!");
        return;
    }

    if(!navigator.geolocation){
        alert("Geolocation not supported on your device.");
        return;
    }

    navigator.geolocation.getCurrentPosition(success, error);

    function success(position) {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        // Auto-generate device ID for simplicity
        let deviceID = localStorage.getItem("deviceID");
        if(!deviceID){
            deviceID = "DEV-" + Math.floor(Math.random()*1000000);
            localStorage.setItem("deviceID", deviceID);
        }

        const data = {
            DeviceID: deviceID,
            StudentName: name,
            Latitude: latitude,
            Longitude: longitude
        };

        fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        })
        .then(res => res.text())
        .then(msg => {
            document.getElementById("responseMessage").innerText = msg;
        })
        .catch(err => {
            document.getElementById("responseMessage").innerText = "Error: " + err;
        });
    }

    function error() {
        alert("Unable to get your location. Please allow location access.");
    }
}
