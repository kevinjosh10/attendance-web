// geolocation.js
// Service module for interacting with the Geolocation API

import { CONFIG } from '../config/env.js';

export const GeolocationService = {
    /**
     * Check if geolocation is supported by the browser
     * @returns {boolean}
     */
    isSupported() {
        return 'geolocation' in navigator;
    },

    /**
     * Get precise GPS location wrapped in a Promise
     * @returns {Promise<GeolocationPosition>}
     */
    getPreciseLocation() {
        return new Promise((resolve, reject) => {
            if (!this.isSupported()) {
                reject(new Error('Geolocation is not supported by your browser.'));
                return;
            }

            navigator.geolocation.getCurrentPosition(
                resolve, 
                reject, 
                {
                    enableHighAccuracy: true,
                    timeout: CONFIG.GEO_TIMEOUT_MS,
                    maximumAge: CONFIG.GEO_MAX_AGE_MS
                }
            );
        });
    },

    /**
     * Map Geolocation API error objects to user-friendly messages
     * @param {GeolocationPositionError} error 
     * @returns {string} User-friendly error message
     */
    getErrorMessage(error) {
        // Handle standard geolocation errors
        if (error.code !== undefined) {
            switch (error.code) {
                case error.PERMISSION_DENIED:
                    return '📍 Location access denied. Please enable location permissions in browser settings.';
                case error.POSITION_UNAVAILABLE:
                    return '📍 GPS signal weak. Please move to an open area with clear sky view.';
                case error.TIMEOUT:
                    return '⏰ Location request timed out. Please try again in an open area.';
                default:
                    return '📍 Unable to get precise location. Please try again.';
            }
        }
        // Handle custom errors
        return error.message || 'Unknown location error occurred.';
    }
};
