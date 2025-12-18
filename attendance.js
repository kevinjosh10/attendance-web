const API_URL = "https://dhtdt05ncj.execute-api.ap-south-1.amazonaws.com/prod1/attendance";

// Get saved name
const savedName = localStorage.getItem("studentName");

const nameSection = document.getElementById("nameSection");
const attendanceSection = document.getElementById("attendanceSection");
const welcomeText = document.getElementById("welcomeText");
const timeText = document.getElementById("timeText");

if (savedName) {
  showAttendance(savedName);
}

// Save name first time
function saveName() {
  const name = document.getElementById("studentName").value.trim();
  if (!name) {
    alert("Enter your name");
    return;
  }
  localStorage.setItem("studentName", name);
  showAttendance(name);
}

function showAttendance(name) {
  nameSection.style.display = "none";
  attendanceSection.style.display = "block";
  welcomeText.innerText = `Welcome ${name}`;
  updateTime();
  setInterval(updateTime, 1000);
}

function updateTime() {
  const now = new Date();
  timeText.innerText = "Current time: " + now.toLocaleTimeString();
}

// Mark attendance
function markAttendance() {
  if (!navigator.geolocation) {
    alert("Geolocation not supported");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      sendAttendance(position.coords.latitude, position.coords.longitude);
    },
    () => {
      alert("Location permission denied");
    }
  );
}

function sendAttendance(lat, lon) {
  const payload = {
    DeviceID: navigator.userAgent,
    StudentName: localStorage.getItem("studentName"),
    Latitude: lat,
    Longitude: lon
  };

  fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  })
    .then(res => res.text())
    .then(data => alert(data))
    .catch(err => {
      console.error(err);
      alert("Error connecting to the server");
    });
}
