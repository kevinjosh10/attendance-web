// main.js
// Application entry point

import { CONFIG } from './config/env.js';
import { StorageService } from './utils/storage.js';
import { safelySetText, getFullDepartmentName, getYearDisplay } from './utils/dom.js';
import { GeolocationService } from './services/geolocation.js';
import { ApiService } from './services/api.js';

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

// Local App State
let isLoading = false;

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', initApp);

function initApp() {
    // Ensure device ID exists
    StorageService.getDeviceID();
    
    startRealTimeClock();
    setupEventListeners();
    checkStoredStudentData();
    checkGeolocationPermission();
}

// Clock updates
function startRealTimeClock() {
    function updateClock() {
        const now = new Date();
        
        const timeOptions = { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true };
        const shortTimeOptions = { hour: '2-digit', minute: '2-digit', hour12: true };
        const dateOptions = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
        
        safelySetText(elements.timeDisplay, now.toLocaleTimeString('en-IN', timeOptions));
        safelySetText(elements.timeHeader, now.toLocaleTimeString('en-IN', shortTimeOptions));
        safelySetText(elements.dateDisplay, now.toLocaleDateString('en-IN', dateOptions));
        
        checkAttendanceCooldown(now);
    }
    
    updateClock();
    setInterval(updateClock, 1000);
}

// Event bindings
function setupEventListeners() {
    elements.continueBtn.addEventListener('click', handleStudentDetailsSubmit);
    
    [elements.studentNameInput, elements.departmentSelect, elements.yearSelect].forEach(field => {
        field.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleStudentDetailsSubmit();
        });
    });
    
    elements.markAttendanceBtn.addEventListener('click', handleMarkAttendance);
    
    // Admin reset
    document.addEventListener('dblclick', handleAppReset);
    setupMobileOptimizations();
}

// Initial state check
function checkStoredStudentData() {
    if (StorageService.hasStudentData()) {
        showAttendanceSection();
        updateStudentDetailsDisplay();
    } else {
        elements.studentNameInput.focus();
        showStatus('Enter your details to mark attendance', 'success');
    }
    updateAttendanceButtonState();
}

// Student form submission
function handleStudentDetailsSubmit() {
    const name = elements.studentNameInput.value.trim();
    const dept = elements.departmentSelect.value;
    const year = elements.yearSelect.value;
    
    if (!name || name.length < 2) {
        showStatus('⚠️ Please enter your full name (minimum 2 characters)', 'error');
        elements.studentNameInput.focus();
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
    
    StorageService.saveStudentData(name, dept, year);
    
    showAttendanceSection();
    updateStudentDetailsDisplay();
    showStatus(`✅ Welcome ${name}! Ready to mark attendance.`, 'success');
}

function showAttendanceSection() {
    elements.studentForm.style.display = 'none';
    elements.attendanceSection.style.display = 'block';
}

function updateStudentDetailsDisplay() {
    const data = StorageService.getStudentData();
    
    // We construct the HTML carefully without injecting direct user input as raw HTML.
    elements.studentDetailsDisplay.innerHTML = '';
    
    const nameNode = document.createTextNode(data.studentName);
    const br = document.createElement('br');
    
    const subSpan = document.createElement('span');
    subSpan.style.fontSize = '0.55em';
    subSpan.style.opacity = '0.8';
    subSpan.style.fontWeight = '500';
    
    const deptString = getFullDepartmentName(data.department);
    const yearString = getYearDisplay(data.year);
    subSpan.textContent = `${deptString} - ${yearString}`;
    
    elements.studentDetailsDisplay.appendChild(nameNode);
    elements.studentDetailsDisplay.appendChild(br);
    elements.studentDetailsDisplay.appendChild(subSpan);
}

// Mark attendance workflow
async function handleMarkAttendance() {
    if (isLoading) return;
    
    startLoadingState();
    clearStatus();
    elements.locationInfo.classList.add('hidden');
    
    try {
        // 1. Get precise location
        const position = await GeolocationService.getPreciseLocation();
        
        // Show location to user immediately
        const { latitude, longitude, accuracy } = position.coords;
        elements.locationDisplay.textContent = `${latitude.toFixed(6)}, ${longitude.toFixed(6)} (±${Math.round(accuracy)}m)`;
        elements.locationInfo.classList.remove('hidden');
        
        // 2. Prepare payload
        const studentData = StorageService.getStudentData();
        const payloadData = {
            deviceID: StorageService.getDeviceID(),
            studentName: studentData.studentName,
            department: studentData.department,
            year: studentData.year,
            coords: position.coords
        };

        // 3. Submit to backend
        const successMessage = await ApiService.submitAttendance(payloadData);
        
        StorageService.recordAttendanceTime();
        showStatus(successMessage, 'success');
        
    } catch (error) {
        // If it's a Geolocation Error object
        if (error.code !== undefined) {
            showStatus(GeolocationService.getErrorMessage(error), 'error');
        } else {
            // It's a standard Error (from API or fallback)
            showStatus(error.message, 'error');
        }
    } finally {
        stopLoadingState();
    }
}

// UI Helpers
function startLoadingState() {
    isLoading = true;
    elements.markAttendanceBtn.classList.add('loading');
    elements.markAttendanceBtn.innerHTML = '<span>Locating...</span>';
}

function stopLoadingState() {
    isLoading = false;
    elements.markAttendanceBtn.classList.remove('loading');
    safelySetText(elements.markAttendanceBtn, 'Mark Attendance');
}

function showStatus(message, type = 'info') {
    safelySetText(elements.statusMessage, message);
    elements.statusMessage.className = `status-message ${type} show`;
    setTimeout(clearStatus, 6000);
}

function clearStatus() {
    elements.statusMessage.classList.remove('show');
}

// Cooldown logic
function checkAttendanceCooldown(currentTime) {
    const lastTime = StorageService.getLastAttendanceTime();
    if (!lastTime) return;
    
    const cooldownMs = CONFIG.COOLDOWN_MINUTES * 60 * 1000;
    const timeDiff = currentTime - new Date(parseInt(lastTime));
    
    if (timeDiff < cooldownMs) {
        const minutesLeft = Math.ceil((cooldownMs - timeDiff) / 60000);
        elements.markAttendanceBtn.title = `Cooldown active: ${minutesLeft}min remaining`;
    }
}

function updateAttendanceButtonState() {
    const now = new Date();
    const lastTime = StorageService.getLastAttendanceTime();
    
    if (lastTime) {
        const cooldownMs = CONFIG.COOLDOWN_MINUTES * 60 * 1000;
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

// Reset app
function handleAppReset() {
    if (confirm('🗑️ Reset all student data and attendance history?')) {
        StorageService.clearAll();
        location.reload();
    }
}

function setupMobileOptimizations() {
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
    
    window.visualViewport?.addEventListener('resize', () => {
        document.body.style.height = `${window.visualViewport.height}px`;
    });
}

function checkGeolocationPermission() {
    if (!GeolocationService.isSupported()) {
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
