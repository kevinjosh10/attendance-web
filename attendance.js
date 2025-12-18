// ================= CONFIG =================
const API_URL =
  "https://dhtdt05ncj.execute-api.ap-south-1.amazonaws.com/prod1/attendance";

// ================= ELEMENTS =================
const nameSection = document.getElementById("nameSection");
const attendanceSection = document.getElementById("attendanceSection");
const nameInput = document.getElementById("studentName");
const welcomeText = document.getElementById("welcomeText");
const timeText = document.getElementById("timeText");

// ================= ON LOAD =================
window.onload = () => {
  const savedName = localStorage.getItem("studentName");

  if (savedName) {
    showAttendancePage(savedName);
  } else {
    nameSection.style.display = "block";
    attendanceSection.style.display = "none";
  }

  updateTime();
  setInterval(updateTime, 1000);
};

// ================= SAVE NAME =================
function saveName() {
  const name = nameInput.value.trim();

  if (!name) {
    alert("Please enter your name");
    return;
  }

  localStorage.setItem("studentName", name);
  showAttendancePage(name);
}

// ================= SHOW ATTENDANCE PAGE =================
function showAttendancePage(name) {
  nameSection.style.display = "none";
  attendanceSection.style.display = "block";
  welcomeText.innerText = `Welcome ${name}`;
}

// ================= UPDATE TIME =================
function updateTime() {
  const now = new Date();
  timeText.innerText = `Time: ${now.toLocaleTimeString()}`;
}

// ================= MARK ATTENDANCE =================
function markAttendance() {
  if (!navigator.geolocation) {
    alert("Geolocation is not supported by your browser");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const payload = {
        studentName: localStorage.getItem("studentName"),
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };

      try {
        const response = await fetch(API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        const result = await response.json();

        if (response.ok) {
          alert(result.message || "Attendance marked successfully");
        } else {
          alert(result.message || "Attendance failed");
        }
      } catch (error) {
        console.error(error);
        alert("Error connecting to server");
      }
    },
    () => {
      alert("Location permission denied");
    }
  );
}
