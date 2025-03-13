// Explicitly set the API base URL to port 5000
const API_BASE_URL = 'http://localhost:5000/api';

// Log the API base URL to verify it's correct
console.log('API Config initialized with base URL:', API_BASE_URL);

const apiConfig = {
  // Auth endpoints
  auth: {
    login: `${API_BASE_URL}/auth/login`,
    register: `${API_BASE_URL}/auth/register`,
    logout: `${API_BASE_URL}/auth/logout`,
    refresh: `${API_BASE_URL}/auth/refresh-token`
  },
  
  // User endpoints
  user: {
    profile: `${API_BASE_URL}/user/profile`,
    update: `${API_BASE_URL}/user/update`
  },
  
  // Strain data endpoints
  strains: {
    all: `${API_BASE_URL}/all-strains`
  },
  
  // Membership endpoints
  membership: {
    data: `${API_BASE_URL}/membership`
  },
  
  // Health check
  health: `${API_BASE_URL}/health`
};

export default apiConfig;
