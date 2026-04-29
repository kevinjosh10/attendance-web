// storage.js
// Utility module for handling LocalStorage interactions securely

export const StorageService = {
    /**
     * Get the unique device ID or generate one if it doesn't exist
     * @returns {string} The device ID
     */
    getDeviceID() {
        let id = localStorage.getItem('deviceID');
        if (!id) {
            id = 'device-' + Math.random().toString(36).substring(2, 11);
            localStorage.setItem('deviceID', id);
        }
        return id;
    },

    /**
     * Get saved student details
     * @returns {Object} Student details object
     */
    getStudentData() {
        return {
            studentName: localStorage.getItem('studentName') || null,
            department: localStorage.getItem('department') || null,
            year: localStorage.getItem('year') || null
        };
    },

    /**
     * Check if complete student data exists
     * @returns {boolean}
     */
    hasStudentData() {
        const data = this.getStudentData();
        return !!(data.studentName && data.department && data.year);
    },

    /**
     * Save student details to local storage
     * @param {string} name 
     * @param {string} department 
     * @param {string} year 
     */
    saveStudentData(name, department, year) {
        localStorage.setItem('studentName', name);
        localStorage.setItem('department', department);
        localStorage.setItem('year', year);
    },

    /**
     * Record the timestamp of the last successful attendance
     */
    recordAttendanceTime() {
        localStorage.setItem('lastAttendanceTime', Date.now().toString());
    },

    /**
     * Get the timestamp of the last successful attendance
     * @returns {string|null} Timestamp string or null
     */
    getLastAttendanceTime() {
        return localStorage.getItem('lastAttendanceTime') || null;
    },

    /**
     * Clear all stored data
     */
    clearAll() {
        localStorage.clear();
    }
};
