import axios from 'axios';

// API URL configuration
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const DEBUG = process.env.REACT_APP_DEBUG === 'true';

class ApiService {
  constructor() {
    // Create an axios instance with default config
    this.api = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Add request interceptor to include auth token
    this.api.interceptors.request.use(
      (config) => {
        if (DEBUG) {
          console.log(`[API] ${config.method.toUpperCase()} ${config.baseURL}${config.url}`);
        }
        
        const token = localStorage.getItem('token');
        if (token) {
          config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        if (DEBUG) {
          console.error('[API] Request error:', error);
        }
        return Promise.reject(error);
      }
    );
    
    // Add response interceptor for logging
    this.api.interceptors.response.use(
      (response) => {
        if (DEBUG) {
          console.log(`[API] Response from ${response.config.url}:`, 
            response.status, 
            response.data ? (typeof response.data === 'object' ? 'data received' : 'non-JSON response') : 'no data');
        }
        return response;
      },
      (error) => {
        if (DEBUG) {
          console.error(`[API] Error response:`, error.message);
          if (error.response) {
            console.error(`[API] Status: ${error.response.status}`, error.response.data);
          }
        }
        return Promise.reject(error);
      }
    );
  }

  // Helper method to handle API errors
  handleApiError(error, fallbackData = null) {
    console.error('API Error:', error);
    
    // If we got a response but with an error status
    if (error.response) {
      console.log('Error response status:', error.response.status);
      console.log('Error response data:', error.response.data);
    }
    
    return fallbackData;
  }
  
  // Get the full API URL for a path
  getFullUrl(path) {
    // Make sure path starts with a slash
    const formattedPath = path.startsWith('/') ? path : `/${path}`;
    return `${API_URL}${formattedPath}`;
  }
}

export default ApiService;