import axios from 'axios';

// API URL configuration - ensure this matches api.service.js
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const API_BASE_PATH = '/api'; // Separate the path for clarity
const DEBUG = process.env.REACT_APP_DEBUG === 'true';

class ApiService {
  constructor() {
    // Create an axios instance with default config
    this.api = axios.create({
      baseURL: `${API_URL}${API_BASE_PATH}`,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json' // Explicitly request JSON response
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
    
    // Add response interceptor for logging and content type checking
    this.api.interceptors.response.use(
      (response) => {
        if (DEBUG) {
          console.log(`[API] Response from ${response.config.url}:`, 
            response.status, 
            response.data ? (typeof response.data === 'object' ? 'data received' : 'non-JSON response') : 'no data');
        }
        
        // Check if the response is HTML when we expected JSON
        const contentType = response.headers['content-type'];
        if (contentType && contentType.includes('text/html')) {
          console.warn('[API] Received HTML response instead of JSON:', response.config.url);
          // Log more details in debug mode
          if (DEBUG) {
            console.warn('[API] HTML response preview:', 
              response.data ? response.data.substring(0, 200) + '...' : 'empty response');
          }
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
      
      // Check if we received HTML instead of JSON
      const contentType = error.response.headers['content-type'];
      if (contentType && contentType.includes('text/html')) {
        console.error('Received HTML instead of JSON. This could indicate:');
        console.error('1. The API endpoint is not correct');
        console.error('2. The server is returning a web page instead of API data');
        console.error('3. You might be hitting a frontend route instead of an API route');
      }
    }
    
    return fallbackData;
  }
  
  // Get the full API URL for a path
  getFullUrl(path) {
    // Make sure path starts with a slash
    const formattedPath = path.startsWith('/') ? path : `/${path}`;
    return `${API_URL}${API_BASE_PATH}${formattedPath}`;
  }
  
  // Make a request with the API instance
  async request(config) {
    return this.api(config);
  }
}

export default ApiService;
