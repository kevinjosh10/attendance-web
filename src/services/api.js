// api.js
// Service module for sending data to the AWS backend

import { CONFIG } from '../config/env.js';

export const ApiService = {
    /**
     * Submits attendance data to the AWS Lambda endpoint
     * @param {Object} payloadData - Raw data needed for the payload
     * @returns {Promise<string>} Response text from the server
     */
    async submitAttendance(payloadData) {
        const { deviceID, studentName, department, year, coords } = payloadData;
        const { latitude, longitude, accuracy } = coords;

        const payload = {
            DeviceID: deviceID,
            StudentName: studentName,
            Department: department,
            Year: year,
            Latitude: parseFloat(latitude.toFixed(8)),
            Longitude: parseFloat(longitude.toFixed(8)),
            Accuracy: Math.round(accuracy),
            Timestamp: new Date().toISOString(),
            UserAgent: navigator.userAgent.slice(0, 150),
            AppVersion: CONFIG.APP_VERSION
        };

        try {
            const response = await fetch(CONFIG.API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            });

            const result = await response.text();

            if (!response.ok) {
                throw new Error(result || 'Server responded with error');
            }

            return result || '✅ Attendance marked successfully!';
        } catch (error) {
            console.error('API Request Failed:', error);
            throw new Error(error.message || 'Network error occurred while submitting.');
        }
    }
};
