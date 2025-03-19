/**
 * API Configuration
 * Centralized configuration for API endpoints
 */

// Determine the base URL based on environment
const getBaseUrl = () => {
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:5000';
  }
  
  return process.env.REACT_APP_API_URL || 'https://www.cannapureplus.co.za';
};

const BASE_URL = getBaseUrl();

console.log(`API configured with base URL: ${BASE_URL}`);

const apiConfig = {
  baseUrl: BASE_URL,
  
  // Auth endpoints
  auth: {
    login: `${BASE_URL}/api/auth/login`,
    register: `${BASE_URL}/api/auth/register`,
    logout: `${BASE_URL}/api/auth/logout`,
    refresh: `${BASE_URL}/api/auth/refresh`,
    profile: `${BASE_URL}/api/auth/profile`
  },
  
  // Other API endpoints can be added here
};

export default apiConfig;
