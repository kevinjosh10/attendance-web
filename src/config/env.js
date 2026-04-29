// env.js
// Configuration constants for the application

export const CONFIG = {
    // AWS API Gateway endpoint
    API_URL: 'https://dhtdt05ncj.execute-api.ap-south-1.amazonaws.com/prod1/attendance',
    
    // Application settings
    APP_VERSION: '2.1.0',
    COOLDOWN_MINUTES: 5,
    
    // Geolocation settings
    GEO_TIMEOUT_MS: 15000,
    GEO_MAX_AGE_MS: 60000
};
