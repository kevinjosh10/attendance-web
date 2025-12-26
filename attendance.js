const API_URL = 'https://dhtdt05ncj.execute-api.ap-south-1.amazonaws.com/prod1/attendance';

// Jerusalem College of Engineering, Pallikaranai coordinates
const COLLEGE_LATITUDE = 12.9453989;
const COLLEGE_LONGITUDE = 80.2078173;
const ALLOWED_RADIUS_METERS = 300; // 300 meters

// Get all DOM elements
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

// ========================================
// INITIALIZATION
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('Page loaded - initializing app');
    
    loadStoredData();
    updateHeaderTime();
    setInterval(updateHeaderTime, 1000);
    
    if (saveDetailsBtn) {
        saveDetailsBtn.addEventListener('click', function(e) {
            e.preventDefault();
            handleSaveDetails();
        });
        console.log('Save button listener attached');
    }
    
    if (markAttendanceBtn) {
        markAttendanceBtn.addEventListener('click', function(e) {
            e.preventDefault();
            handleMarkAttendance();
        });
        console.log('Mark attendance button listener attached');
    }
});

// ========================================
// TIME DISPLAY FUNCTIONS
// ========================================

function updateHeaderTime() {
    const now = new Date();
    
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    const dateStr = month + '/' + day + '/' + year;
    
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const timeStr = hours + ':' + minutes + ':' + seconds;
    
    if (currentDateEl) {
        currentDateEl.textContent = dateStr;
    }
    if (currentTimeEl) {
        currentTimeEl.textContent = timeStr;
    }
    
    if (timeDisplay) {
        timeDisplay.textContent = timeStr;
    }
}

function updateAttendanceTime() {
    const now = new Date();
    
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const timeStr = hours + ':' + minutes + ':' + seconds;
    
    if (timeDisplay) {
        timeDisplay.textContent = timeStr;
    }
}

// ========================================
// STORAGE FUNCTIONS
// ========================================

function loadStoredData() {
    const storedName = localStorage.getItem('studentName');
    const storedDept = localStorage.getItem('studentDept');
    const storedYear = localStorage.getItem('studentYear');

    console.log('Checking stored data:', { storedName, storedDept, storedYear });

    if (storedName && storedDept && storedYear) {
        console.log('Found stored data - showing attendance section');
        showAttendanceSection(storedName, storedDept, storedYear);
    } else {
        console.log('No stored data - showing form section');
        userFormSection.style.display = 'block';
        attendanceSection.style.display = 'none';
    }
}

function saveStudentData(name, dept, year) {
    localStorage.setItem('studentName', name);
    localStorage.setItem('studentDept', dept);
    localStorage.setItem('studentYear', year);
    console.log('Student data saved:', { name, dept, year });
}

function getDeviceID() {
    let deviceID = localStorage.getItem('deviceID');
    
    if (!deviceID) {
        const randomPart = Math.random().toString(36).substr(2, 9);
        const timePart = Date.now().toString(36);
        deviceID = 'device-' + randomPart + '-' + timePart;
        localStorage.setItem('deviceID', deviceID);
        console.log('New device ID generated:', deviceID);
    } else {
        console.log('Using existing device ID:', deviceID);
    }
    
    return deviceID;
}

// ========================================
// GEOFENCING - CALCULATE DISTANCE
// ========================================

function calculateDistance(lat1, lon1, lat2, lon2) {
    // Haversine formula to calculate distance between two coordinates in meters
    const R = 6371000; // Earth radius in meters
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance;
}

function checkIfNearCollege(latitude, longitude) {
    const distance = calculateDistance(
        COLLEGE_LATITUDE,
        COLLEGE_LONGITUDE,
        latitude,
        longitude
    );
    
    console.log('Distance from college:', distance, 'meters');
    console.log('Allowed radius:', ALLOWED_RADIUS_METERS, 'meters');
    
    return {
        isNear: distance <= ALLOWED_RADIUS_METERS,
        distance: distance
    };
}

// ========================================
// SAVE & CONTINUE BUTTON HANDLER
// ========================================

function handleSaveDetails() {
    console.log('Save Details clicked');
    
    const name = studentNameInput.value.trim();
    const dept = departmentSelect.value.trim();
    const year = yearSelect.value.trim();

    console.log('Form values:', { name, dept, year });

    if (!name) {
        alert('Please enter your full name');
        studentNameInput.focus();
        return;
    }

    if (!dept) {
        alert('Please select your department');
        departmentSelect.focus();
        return;
    }

    if (!year) {
        alert('Please select your year');
        yearSelect.focus();
        return;
    }

    saveStudentData(name, dept, year);
    showAttendanceSection(name, dept, year);
}

// ========================================
// SHOW ATTENDANCE SECTION
// ========================================

function showAttendanceSection(name, dept, year) {
    console.log('Showing attendance section for:', { name, dept, year });
    
    userFormSection.style.display = 'none';
    attendanceSection.style.display = 'block';

    studentNameDisplay.textContent = name;
    studentDeptDisplay.textContent = dept;
    studentYearDisplay.textContent = year + ' Year';

    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year_num = today.getFullYear();
    const dateStr = month + '/' + day + '/' + year_num;
    
    if (todayDisplay) {
        todayDisplay.textContent = dateStr;
    }

    updateAttendanceTime();
    setInterval(updateAttendanceTime, 1000);

    if (statusMessage) {
        statusMessage.textContent = '';
        statusMessage.classList.remove('success', 'error');
    }
}

// ========================================
// MARK ATTENDANCE BUTTON HANDLER
// ========================================

function handleMarkAttendance() {
    console.log('Mark Attendance clicked');

    if (!navigator.geolocation) {
        console.error('Geolocation not supported');
        if (statusMessage) {
            statusMessage.classList.add('error');
            statusMessage.classList.remove('success');
            statusMessage.textContent = 'Geolocation is not supported by your browser';
        }
        return;
    }

    if (statusMessage) {
        statusMessage.classList.remove('success', 'error');
        statusMessage.textContent = '📍 Getting your location...';
    }

    console.log('Requesting geolocation');

    navigator.geolocation.getCurrentPosition(
        function onSuccess(position) {
            console.log('Geolocation success:', position);
            
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;
            const accuracy = position.coords.accuracy;

            console.log('Location obtained:', { latitude, longitude, accuracy });

            // CHECK IF NEAR COLLEGE
            const locationCheck = checkIfNearCollege(latitude, longitude);
            
            if (!locationCheck.isNear) {
                console.error('User is not near college');
                
                if (statusMessage) {
                    statusMessage.classList.add('error');
                    statusMessage.classList.remove('success');
                    statusMessage.textContent = '❌ You are ' + Math.round(locationCheck.distance) + ' meters away from college. You must be within ' + ALLOWED_RADIUS_METERS + ' meters to mark attendance.';
                }
                return;
            }

            console.log('User is near college - proceeding with attendance');

            const studentName = localStorage.getItem('studentName');
            const studentDept = localStorage.getItem('studentDept');
            const studentYear = localStorage.getItem('studentYear');

            sendAttendanceToAPI(studentName, studentDept, studentYear, latitude, longitude);
        },
        function onError(error) {
            console.error('Geolocation error:', error);
            
            if (statusMessage) {
                statusMessage.classList.add('error');
                statusMessage.classList.remove('success');

                if (error.code === error.PERMISSION_DENIED) {
                    statusMessage.textContent = '❌ Location permission denied. Please enable location access in your browser settings.';
                } else if (error.code === error.POSITION_UNAVAILABLE) {
                    statusMessage.textContent = '❌ Location information is unavailable. Please check your GPS/location services.';
                } else if (error.code === error.TIMEOUT) {
                    statusMessage.textContent = '❌ Location request timed out. Please try again.';
                } else {
                    statusMessage.textContent = '❌ Error getting location: ' + error.message;
                }
            }
        },
        {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        }
    );
}

// ========================================
// SEND ATTENDANCE TO API
// ========================================

function sendAttendanceToAPI(studentName, studentDept, studentYear, latitude, longitude) {
    console.log('Preparing to send attendance data to API');

    const deviceID = getDeviceID();

    const payload = {
        DeviceID: deviceID,
        StudentName: studentName,
        Department: studentDept,
        Year: studentYear,
        Latitude: latitude,
        Longitude: longitude
    };

    console.log('Payload to send:', payload);

    if (statusMessage) {
        statusMessage.classList.remove('success', 'error');
        statusMessage.textContent = '⏳ Sending attendance...';
    }

    fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    })
    .then(function(response) {
        console.log('API response status:', response.status);
        
        return response.text().then(function(text) {
            return {
                status: response.status,
                ok: response.ok,
                text: text,
                headers: response.headers
            };
        });
    })
    .then(function(result) {
        console.log('API response text:', result.text);

        let data = {};

        try {
            data = JSON.parse(result.text);
            console.log('Parsed response:', data);
        } catch (e) {
            console.log('Could not parse JSON, using raw text');
            data = {
                message: result.text || 'No response from server'
            };
        }

        if (result.ok || result.status === 200) {
            console.log('Attendance marked successfully');
            
            if (statusMessage) {
                statusMessage.classList.add('success');
                statusMessage.classList.remove('error');
                statusMessage.textContent = '✅ ' + (data.message || 'Attendance marked successfully!');
            }
        } else {
            console.error('API error response:', data);
            
            if (statusMessage) {
                statusMessage.classList.add('error');
                statusMessage.classList.remove('success');
                
                let errorMsg = '❌ Error: ';
                if (data.message) {
                    errorMsg += data.message;
                } else if (data.missing) {
                    errorMsg += 'Missing fields: ' + data.missing.join(', ');
                } else {
                    errorMsg += result.text || 'Failed to mark attendance';
                }
                
                statusMessage.textContent = errorMsg;
            }
        }
    })
    .catch(function(error) {
        console.error('Fetch error:', error);
        
        if (statusMessage) {
            statusMessage.classList.add('error');
            statusMessage.classList.remove('success');
            statusMessage.textContent = '❌ Error connecting to server: ' + error.message;
        }
    });
}

console.log('attendance.js loaded successfully with geofencing enabled');
console.log('College Location:', COLLEGE_LATITUDE, COLLEGE_LONGITUDE);
console.log('Allowed Radius:', ALLOWED_RADIUS_METERS, 'meters');
