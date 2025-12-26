const API_URL = 'https://dhtdt05ncj.execute-api.ap-south-1.amazonaws.com/prod1/attendance';

const userFormSection = document.getElementById('user-form-section');
const attendanceSection = document.getElementById('attendance-section');

const studentNameInput = document.getElementById('student-name-input');
const departmentSelect = document.getElementById('department-select');
const yearSelect = document.getElementById('year-select');
const saveDetailsBtn = document.getElementById('save-details-btn');

const studentNameDisplay = document.getElementById('student-name-display');
const studentDeptDisplay = document.getElementById('student-dept-display');
const studentYearDisplay = document.getElementById('student-year-display');

const todayDisplay = document.getElementById('today-display');
const timeDisplay = document.getElementById('time-display');

const statusMessage = document.getElementById('status-message');
const markAttendanceBtn = document.getElementById('mark-attendance-btn');

const currentDateEl = document.getElementById('current-date');
const currentTimeEl = document.getElementById('current-time');

// Initialize when page loads
window.addEventListener('load', function() {
    loadStoredData();
    updateTime();
    setInterval(updateTime, 1000);
    attachEventListeners();
});

// Attach event listeners
function attachEventListeners() {
    if (saveDetailsBtn) {
        saveDetailsBtn.addEventListener('click', handleSaveDetails);
    }
    if (markAttendanceBtn) {
        markAttendanceBtn.addEventListener('click', handleMarkAttendance);
    }
}

// Load saved student data
function loadStoredData() {
    const storedName = localStorage.getItem('studentName');
    const storedDept = localStorage.getItem('studentDept');
    const storedYear = localStorage.getItem('studentYear');

    if (storedName && storedDept && storedYear) {
        showAttendanceSection(storedName, storedDept, storedYear);
    } else {
        userFormSection.style.display = 'block';
        attendanceSection.style.display = 'none';
    }
}

// Handle Save & Continue button
function handleSaveDetails() {
    const name = studentNameInput.value.trim();
    const dept = departmentSelect.value.trim();
    const year = yearSelect.value.trim();

    if (!name) {
        alert('Please enter your name');
        studentNameInput.focus();
        return;
    }

    if (!dept) {
        alert
