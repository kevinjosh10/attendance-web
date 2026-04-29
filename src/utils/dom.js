// dom.js
// Utility module for safe DOM manipulation and formatting

/**
 * Safely create text nodes to prevent XSS attacks when rendering user input
 * @param {string} text - The untrusted text input
 * @returns {Text} Text node safe for DOM insertion
 */
export function createSafeText(text) {
    return document.createTextNode(text);
}

/**
 * Update elements safely using textContent instead of innerHTML
 * @param {HTMLElement} element - The target DOM element
 * @param {string} text - The text to inject
 */
export function safelySetText(element, text) {
    if (element) {
        element.textContent = text;
    }
}

/**
 * Format department code to full name
 * @param {string} code - Department code (e.g., 'CSE')
 * @returns {string} Full department name
 */
export function getFullDepartmentName(code) {
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

/**
 * Format year number to display string
 * @param {string|number} year 
 * @returns {string} formatted year (e.g., '1st Year')
 */
export function getYearDisplay(year) {
    const num = parseInt(year);
    if (num === 1) return '1st Year';
    if (num === 2) return '2nd Year';
    if (num === 3) return '3rd Year';
    return `${num}th Year`;
}
