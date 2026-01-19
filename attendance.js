// attendance.js - Complete Production-Ready JavaScript
// Jerusalem College Multi-Department Attendance System with AWS Geofencing

const apiUrl = 'https://dhtdt05ncj.execute-api.ap-south-1.amazonaws.com/prod1/attendance';

// DOM Elements Cache
const elements = {
    studentForm: document.getElementById('student-form'),
    attendanceSection: document.getElementById('attendance-section'),
    studentNameInput: document.getElementById('student-name'),
    departmentSelect: document.getElementById('department'),
    yearSelect: document.getElementById('year'),
    continueBtn: document.getElementById('continue-btn'),
    markAttendanceBtn: document.getElementById('mark-attendance-btn'),
    timeDisplay: document.getElementById('current-time-display'),
    dateDisplay: document.getElementById('current-date'),
    timeHeader: document.getElementById('current-time'),
    studentDetailsDisplay: document.getElementById('student-details-display'),
    statusMessage: document.getElementById('status-message'),
    locationInfo: document.getElementById('location-info'),
    locationDisplay: document.getElementById('location-display')
};

// App State Management
let appState = {
    deviceID: localStorage.getItem('deviceID') || 'device-' + Math.random().toString(36).substr(2, 9),
    studentName: localStorage.getItem('studentName') || null,
    department: localStorage.getItem('department') || null,
    year: localStorage.getItem('year') || null,
    isLoading: false,
    lastAttendanceTime: localStorage.getItem('lastAttendanceTime') || null
};

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Persist device ID
    localStorage.setItem('deviceID', appState.deviceID);
    
    // Start real-time clock
    startRealTimeClock();
    
    // Setup all event listeners
    setupEventListeners();
    
    // Check if user has previously entered data
    checkStoredStudentData();
    
    // Pre-flight geolocation permission check
    checkGeolocationPermission();
});

// Real-time clock updates
function startRealTimeClock() {
    function updateClock() {
        const now = new Date();
        
        // Main time display (large)
        elements.timeDisplay.textContent = now.toLocaleTimeString('en-IN', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
        });
        
        // Header date display
        elements.dateDisplay.textContent = now.toLocaleDateString('en-IN', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
        
        // Header time display (compact)
        elements.timeHeader.textContent = now.toLocaleTimeString('en-IN', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
        
        // Check attendance cooldown
        checkAttendanceCooldown(now);
    }
    
    updateClock(); // Initial call
    setInterval(updateClock, 1000);
}

// Event listener setup
function setupEventListeners() {
    // Form submission (Enter key + button)
    elements.continueBtn.addEventListener('click', handleStudentDetailsSubmit);
    
    // Enter key support for all form fields
    [elements.studentNameInput, elements.departmentSelect, elements.yearSelect].forEach(field => {
        field.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleStudentDetailsSubmit();
        });
    });
    
    // Attendance marking
    elements.markAttendanceBtn.addEventListener('click', handleMarkAttendance);
    
    // Double-click anywhere to reset (admin/debug)
    document.addEventListener('dblclick', handleAppReset);
    
    // Mobile viewport fixes
    setupMobileOptimizations();
}

// Check if student data exists in localStorage
function checkStoredStudentData() {
    const hasCompleteData = appState.studentName && appState.department && appState.year;
    
    if (hasCompleteData) {
        showAttendanceSection();
        updateStudentDetailsDisplay();
    } else {
        // Focus first field for new users
        elements.studentNameInput.focus();
        showStatus('Enter your details to mark attendance', 'success');
    }
    
    updateAttendanceButtonState();
}

// Validate and save student details
function handleStudentDetailsSubmit() {
    // Validation
    const name = elements.studentNameInput.value.trim();
    const dept = elements.departmentSelect.value;
    const year = elements.yearSelect.value;
    
    if (!name || name.length < 2) {
        showStatus('⚠️ Please enter your full name (minimum 2 characters)', 'error');
        elements.studentNameInput.focus();
        elements.studentNameInput.select();
        return;
    }
    
    if (!dept) {
        showStatus('⚠️ Please select your department', 'error');
        elements.departmentSelect.focus();
        return;
    }
    
    if (!year) {
        showStatus('⚠️ Please select your academic year', 'error');
        elements.yearSelect.focus();
        return;
    }
    
    // Save to app state and localStorage
    appState.studentName = name;
    appState.department = dept;
    appState.year = year;
    
    localStorage.setItem('studentName', name);
    localStorage.setItem('department', dept);
    localStorage.setItem('year', year);
    
    // Smooth transition to attendance section
    showAttendanceSection();
    updateStudentDetailsDisplay();
    showStatus(`✅ Welcome ${name}! Ready to mark attendance.`, 'success');
}

// Show attendance section with smooth animation
function showAttendanceSection() {
    elements.studentForm.style.display = 'none';
    elements.attendanceSection.style.display = 'block';
}

// Update student details display
function updateStudentDetailsDisplay() {
    const detailsHTML = `
        ${appState.studentName}<br>
        <span style="font-size: 0.55em; opacity: 0.8; font-weight: 500;">
            ${getFullDepartmentName(appState.department)} - ${getYearDisplay(appState.year)}
        </span>
    `;
    elements.studentDetailsDisplay.innerHTML = detailsHTML;
}

// Utility functions for display formatting
function getFullDepartmentName(code) {
    const deptMap = {
        'CSE': 'Computer Science',
        'ECE': 'Electronics & Comm',
        'EEE': 'Electrical & Electronics',
        'MECH': 'Mechanical Engg',
        'CIVIL': 'Civil Engineering',
        'IT': 'Information Technology'
    };
    return deptMap[code] || code;
}

function getYearDisplay(year) {
    return `${year}st Year`;
}

// Main attendance marking function
async function handleMarkAttendance() {
    if (appState.isLoading) return;
    
    if (!navigator.geolocation) {
        showStatus('❌ Geolocation not supported by your browser', 'error');
        return;
    }
    
    // UI Loading State
    startLoadingState();
    clearStatus();
    hideLocationInfo();
    
    try {
        const position = await getPreciseLocation();
        await submitAttendanceData(position.coords);
    } catch (error) {
        handleLocationError(error);
    } finally {
        stopLoadingState();
    }
}

// Get precise GPS location with fallbacks
function getPreciseLocation() {
    return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 60000
        });
    });
}

// Submit attendance to AWS Lambda
async function submitAttendanceData(coords) {
    const { latitude, longitude, accuracy } = coords;
    
    // Show location immediately for better UX
    showLocationInfo(latitude, longitude, accuracy);
    
    // Enhanced payload with department/year data
    const payload = {
        DeviceID: appState.deviceID,
        StudentName: appState.studentName,
        Department: appState.department,
        Year: appState.year,
        Latitude: parseFloat(latitude.toFixed(8)),
        Longitude: parseFloat(longitude.toFixed(8)),
        Accuracy: Math.round(accuracy),
        Timestamp: new Date().toISOString(),
        UserAgent: navigator.userAgent.slice(0, 150),
        AppVersion: '2.1.0'
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
        // Update cooldown timestamp
        localStorage.setItem('lastAttendanceTime', Date.now().toString());
        appState.lastAttendanceTime = Date.now().toString();
        showStatus(result || '✅ Attendance marked successfully!', 'success');
    } else {
        throw new Error(result || 'Server responded with error');
    }
}

// Comprehensive error handling
function handleLocationError(error) {
    let errorMessage = 'Unable to retrieve location';
    
    switch (error.code) {
        case error.PERMISSION_DENIED:
            errorMessage = '📍 Location access denied. Please enable location permissions in browser settings.';
            break;
        case error.POSITION_UNAVAILABLE:
            errorMessage = '📍 GPS signal weak. Please move to an open area with clear sky view.';
            break;
        case error.TIMEOUT:
            errorMessage = '⏰ Location request timed out. Please try again in open area.';
            break;
        default:
            errorMessage = '📍 Unable to get precise location. Please try again.';
    }
    
    showStatus(errorMessage, 'error');
}

// UI State Management
function startLoadingState() {
    appState.isLoading = true;
    elements.markAttendanceBtn.classList.add('loading');
    elements.markAttendanceBtn.innerHTML = '<span>Locating...</span>';
}

function stopLoadingState() {
    appState.isLoading = false;
    elements.markAttendanceBtn.classList.remove('loading');
    elements.markAttendanceBtn.textContent = 'Mark Attendance';
}

function showStatus(message, type = 'info') {
    elements.statusMessage.textContent = message;
    elements.statusMessage.className = `status-message ${type} show`;
    
    // Auto-hide after 6 seconds
    setTimeout(() => {
        elements.statusMessage.classList.remove('show');
    }, 6000);
}

function clearStatus() {
    elements.statusMessage.classList.remove('show');
}

function showLocationInfo(lat, lng, accuracy) {
    elements.locationDisplay.textContent = `${lat.toFixed(6)}, ${lng.toFixed(6)} (±${Math.round(accuracy)}m)`;
    elements.locationInfo.classList.remove('hidden');
}

function hideLocationInfo() {
    elements.locationInfo.classList.add('hidden');
}

// Cooldown system (5 minute anti-spam)
function checkAttendanceCooldown(currentTime) {
    if (!appState.lastAttendanceTime) return;
    
    const cooldownMs = 5 * 60 * 1000; // 5 minutes
    const timeDiff = currentTime - new Date(parseInt(appState.lastAttendanceTime));
    
    if (timeDiff < cooldownMs) {
        const minutesLeft = Math.ceil((cooldownMs - timeDiff) / 60000);
        elements.markAttendanceBtn.title = `Cooldown active: ${minutesLeft}min remaining`;
    }
}

function updateAttendanceButtonState() {
    const now = new Date();
    const lastTime = localStorage.getItem('lastAttendanceTime');
    
    if (lastTime) {
        const cooldownMs = 5 * 60 * 1000;
        const timeDiff = now - new Date(parseInt(lastTime));
        
        if (timeDiff < cooldownMs) {
            elements.markAttendanceBtn.disabled = true;
            elements.markAttendanceBtn.style.opacity = '0.6';
        } else {
            elements.markAttendanceBtn.disabled = false;
            elements.markAttendanceBtn.style.opacity = '1';
        }
    }
}

// Reset app data (double-click anywhere)
function handleAppReset() {
    if (confirm('🗑️ Reset all student data and attendance history?\n\nThis will clear your name, department, year, and last attendance time.')) {
        localStorage.clear();
        location.reload();
    }
}

// Mobile optimizations
function setupMobileOptimizations() {
    // Prevent zoom on input focus (iOS)
    let lastTouchEnd = 0;
    document.addEventListener('touchstart', (event) => {
        if (event.touches.length > 1) event.preventDefault();
    }, { passive: false });
    
    document.addEventListener('touchend', (event) => {
        const now = Date.now();
        if (now - lastTouchEnd <= 300) {
            event.preventDefault();
        }
        lastTouchEnd = now;
    }, false);
    
    // Visual viewport handling
    window.visualViewport?.addEventListener('resize', () => {
        document.body.style.height = `${window.visualViewport.height}px`;
    });
}

// Geolocation support check
function checkGeolocationPermission() {
    if (!navigator.geolocation) {
        elements.markAttendanceBtn.disabled = true;
        elements.markAttendanceBtn.title = 'Geolocation not supported by this browser';
    } else if (navigator.permissions) {
        navigator.permissions.query({ name: 'geolocation' }).then(permission => {
            if (permission.state === 'denied') {
                showStatus('⚠️ Location permission denied. Enable in browser settings.', 'warning');
            }
        });
    }
}

// Debug mode (for development)
window.appDebug = {
    state: appState,
    reset: handleAppReset,
    testAttendance: handleMarkAttendance
};
