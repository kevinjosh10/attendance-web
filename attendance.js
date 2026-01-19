// attendance.js - Complete Production-Ready JavaScript
// Jerusalem College CSE A Attendance System with AWS Geofencing

const apiUrl = 'https://dhtdt05ncj.execute-api.ap-south-1.amazonaws.com/prod1/attendance';

// DOM Elements Cache
const elements = {
    nameForm: document.getElementById('name-form'),
    attendanceSection: document.getElementById('attendance-section'),
    studentNameInput: document.getElementById('student-name-input'),
    enterNameBtn: document.getElementById('enter-name-btn'),
    markAttendanceBtn: document.getElementById('mark-attendance-btn'),
    currentTime: document.getElementById('current-time'),
    currentDate: document.getElementById('current-date'),
    studentNameDisplay: document.getElementById('student-name-display'),
    statusMessage: document.getElementById('status-message'),
    locationInfo: document.getElementById('location-info'),
    locationDisplay: document.getElementById('location-display')
};

// App State
let appState = {
    deviceID: localStorage.getItem('deviceID') || 'device-' + Math.random().toString(36).substr(2, 9),
    studentName: localStorage.getItem('studentName') || null,
    isLoading: false,
    lastAttendanceTime: localStorage.getItem('lastAttendanceTime') || null
};

// Initialize app on DOM load
document.addEventListener('DOMContentLoaded', initApp);

function initApp() {
    // Persist deviceID
    localStorage.setItem('deviceID', appState.deviceID);
    
    // Start real-time clock
    startClock();
    
    // Setup event listeners
    setupEventListeners();
    
    // Initialize UI state
    updateUI();
    
    // Preload geolocation permission check
    checkGeolocationSupport();
}

function startClock() {
    function updateClock() {
        const now = new Date();
        
        // Update time display
        elements.currentTime.textContent = now.toLocaleTimeString('en-IN', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
        });
        
        // Update date display
        elements.currentDate.textContent = now.toLocaleDateString('en-IN', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
        
        // Check cooldown for attendance button
        checkAttendanceCooldown(now);
    }
    
    updateClock();
    setInterval(updateClock, 1000);
}

function setupEventListeners() {
    // Name entry handlers
    elements.enterNameBtn.addEventListener('click', handleNameEntry);
    elements.studentNameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleNameEntry();
    });
    
    // Attendance marking
    elements.markAttendanceBtn.addEventListener('click', handleMarkAttendance);
    
    // Reset functionality (double-click anywhere)
    document.addEventListener('dblclick', handleReset);
    
    // Prevent zoom on iOS
    document.addEventListener('touchstart', function(event) {
        if (event.touches.length > 1) {
            event.preventDefault();
        }
    }, { passive: false });
    
    let lastTouchEnd = 0;
    document.addEventListener('touchend', function(event) {
        const now = (new Date()).getTime();
        if (now - lastTouchEnd <= 300) {
            event.preventDefault();
        }
        lastTouchEnd = now;
    }, false);
}

function updateUI() {
    if (appState.studentName) {
        elements.nameForm.style.display = 'none';
        elements.attendanceSection.style.display = 'flex';
        elements.studentNameDisplay.textContent = appState.studentName;
        showStatus(`Welcome back, ${appState.studentName}!`, 'success');
    } else {
        elements.nameForm.style.display = 'flex';
        elements.attendanceSection.style.display = 'none';
        elements.studentNameInput.focus();
    }
    
    // Update attendance cooldown UI
    updateAttendanceButtonState();
}

function handleNameEntry() {
    const name = elements.studentNameInput.value.trim();
    
    if (!name) {
        showStatus('Please enter your full name', 'error');
        elements.studentNameInput.focus();
        elements.studentNameInput.select();
        return;
    }
    
    if (name.length < 2) {
        showStatus('Name must be at least 2 characters', 'error');
        return;
    }
    
    // Save and transition
    appState.studentName = name;
    localStorage.setItem('studentName', name);
    elements.studentNameDisplay.textContent = name;
    
    elements.nameForm.style.display = 'none';
    elements.attendanceSection.style.display = 'flex';
    
    showStatus(`👋 Welcome ${name}! Ready for attendance.`, 'success');
}

async function handleMarkAttendance() {
    // Prevent multiple submissions
    if (appState.isLoading) return;
    
    // Check geolocation support
    if (!navigator.geolocation) {
        showStatus('❌ Geolocation not supported by your browser', 'error');
        return;
    }
    
    // UI feedback - loading state
    startLoading();
    clearStatus();
    hideLocation();
    
    try {
        const position = await getCurrentPositionWithFallback();
        await submitAttendance(position.coords);
    } catch (error) {
        handleGeolocationError(error);
    } finally {
        stopLoading();
    }
}

function getCurrentPositionWithFallback() {
    return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 60000
        });
    });
}

async function submitAttendance(coords) {
    const { latitude, longitude, accuracy } = coords;
    
    // Show location immediately for UX
    showLocation(latitude, longitude, accuracy);
    
    // Prepare enhanced payload for AWS Lambda
    const payload = {
        DeviceID: appState.deviceID,
        StudentName: appState.studentName,
        Latitude: parseFloat(latitude.toFixed(8)),
        Longitude: parseFloat(longitude.toFixed(8)),
        Accuracy: Math.round(accuracy),
        Timestamp: new Date().toISOString(),
        UserAgent: navigator.userAgent.slice(0, 200),
        AppVersion: '2.0.0'
    };
    
    const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
    });
    
    const result = await response.text();
    
    if (response.ok) {
        // Success - update cooldown
        localStorage.setItem('lastAttendanceTime', Date.now().toString());
        showStatus(result || '✅ Attendance marked successfully!', 'success');
    } else {
        throw new Error(result || 'Server error');
    }
}

function handleGeolocationError(error) {
    let message = 'Location error occurred';
    
    switch (error.code) {
        case error.PERMISSION_DENIED:
            message = '📍 Location access denied. Please enable permissions and try again.';
            break;
        case error.POSITION_UNAVAILABLE:
            message = '📍 Location unavailable. Try moving to an open area.';
            break;
        case error.TIMEOUT:
            message = '⏰ Location request timed out. Please try again.';
            break;
        default:
            message = '📍 Unable to retrieve location. Please try again.';
    }
    
    showStatus(message, 'error');
}

function startLoading() {
    appState.isLoading = true;
    elements.markAttendanceBtn.classList.add('loading');
    elements.markAttendanceBtn.innerHTML = '<span>Getting location...</span>';
}

function stopLoading() {
    appState.isLoading = false;
    elements.markAttendanceBtn.classList.remove('loading');
    elements.markAttendanceBtn.innerHTML = 'Mark Attendance';
}

function showStatus(message, type = '') {
    elements.statusMessage.textContent = message;
    elements.statusMessage.className = `status-message ${type} show`;
    
    // Auto-hide after 6 seconds
    setTimeout(clearStatus, 6000);
}

function clearStatus() {
    elements.statusMessage.classList.remove('show');
}

function showLocation(lat, lng, accuracy) {
    elements.locationDisplay.textContent = `${lat.toFixed(6)}, ${lng.toFixed(6)} (±${Math.round(accuracy)}m)`;
    elements.locationInfo.classList.remove('hidden');
}

function hideLocation() {
    elements.locationInfo.classList.add('hidden');
}

function checkGeolocationSupport() {
    if (!navigator.geolocation) {
        elements.markAttendanceBtn.disabled = true;
        elements.markAttendanceBtn.title = 'Geolocation not supported';
    }
}

function checkAttendanceCooldown(now) {
    const lastTime = appState.lastAttendanceTime;
    if (!lastTime) return;
    
    const cooldownMs = 5 * 60 * 1000; // 5 minutes
    const timeDiff = now - new Date(parseInt(lastTime));
    
    if (timeDiff < cooldownMs) {
        const remaining = Math.ceil((cooldownMs - timeDiff) / 1000 / 60);
        elements.markAttendanceBtn.title = `Cooldown: ${remaining}m remaining`;
    }
}

function updateAttendanceButtonState() {
    const now = new Date();
    const lastTime = localStorage.getItem('lastAttendanceTime');
    
    if (lastTime) {
        const cooldownMs = 5 * 60 * 1000; // 5 minutes
        const timeDiff = now - new Date(parseInt(lastTime));
        
        if (timeDiff < cooldownMs) {
            elements.markAttendanceBtn.disabled = true;
            const remaining = Math.ceil((cooldownMs - timeDiff) / 1000 / 60);
            showStatus(`⏳ Wait ${remaining}min before next attendance`, 'warning');
        } else {
            elements.markAttendanceBtn.disabled = false;
        }
    }
}

function handleReset(e) {
    if (confirm('Reset student name and attendance data?')) {
        localStorage.removeItem('studentName');
        localStorage.removeItem('lastAttendanceTime');
        localStorage.removeItem('deviceID');
        location.reload();
    }
}

// PWA Service Worker Registration (Optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .catch(err => console.log('SW registration failed'));
    });
}

// Export for testing
window.appDebug = { appState, elements };
