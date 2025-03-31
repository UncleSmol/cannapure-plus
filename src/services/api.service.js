/**
 * API Service
 * Handles API requests with authentication
 */
import axios from 'axios';
import authService from './AuthService';

// Create axios instance with consistent baseURL
// Always use relative URLs to work with the proxy configuration
const api = axios.create({
  baseURL: '/api', // Use relative path for both production and development
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json' // Explicitly request JSON response
  },
  timeout: 15000, // Increased timeout for better reliability
  // Important for CORS with credentials
  withCredentials: true
});

// Add request interceptor
api.interceptors.request.use(
  async (config) => {
    // Log request for debugging
    console.log('[API] Making request:', config.method?.toUpperCase(), config.url);
    
    // Don't add auth header for auth endpoints
    const isAuthEndpoint = config.url.includes('/auth/login') || 
                          config.url.includes('/auth/register') || 
                          config.url.includes('/auth/refresh');
    
    if (isAuthEndpoint) {
      return config;
    }
    
    // Check if token exists and is valid
    let token = authService.getToken();
    
    // If token exists but is expired or about to expire, try to refresh
    if (token && authService.shouldRefreshToken(token)) {
      try {
        await authService.refreshToken();
        token = authService.getToken(); // Get the new token
      } catch (error) {
        console.error('[API] Token refresh failed:', error);
        // Continue with the request even if refresh fails
        // The response interceptor will handle the 401 error
      }
    }
    
    // Add auth header if token exists
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    console.error('[API] Request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor
api.interceptors.response.use(
  (response) => {
    // Check if the response is HTML when we expected JSON
    const contentType = response.headers['content-type'];
    if (contentType && contentType.includes('text/html') && 
        !response.config.url.includes('/auth/')) {
      console.warn('[API] Received HTML response instead of JSON:', response.config.url);
      // You could choose to reject this response or transform it
      // For now, we'll just log a warning and pass it through
    }
    return response;
  },
  async (error) => {
    // Log network errors for debugging
    if (error.message === 'Network Error') {
      console.error('[API] Network error - CORS issue or server not running');
      console.error('[API] Request details:', error.config);
    }
    
    const originalRequest = error.config;
    
    // If error is 401 (Unauthorized) and not from a refresh token request
    if (error.response && 
        error.response.status === 401 && 
        !originalRequest._retry && 
        !originalRequest.url.includes('/auth/refresh')) {
      
      originalRequest._retry = true;
      
      try {
        // Try to refresh the token
        await authService.refreshToken();
        
        // Update the auth header with the new token
        const token = authService.getToken();
        if (token) {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // If refresh fails, clear auth and redirect to login
        console.error('[API] Token refresh failed in response interceptor:', refreshError);
        authService.clearTokens();
        
        // Redirect to login page
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    } else if (error.response) {
      // Server responded with error status
      console.error(`[API] Server error: ${error.response.status}`, error.response.data);
    } else if (error.request) {
      // Request was made but no response received
      console.error('[API] No response received');
    }
    
    return Promise.reject(error);
  }
);

/**
 * API Service for authentication and data requests
 */
const apiService = {
  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @returns {Promise<Object>} Registration result
   */
  async register(userData) {
    try {
      const response = await api.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      this.handleApiError(error);
      throw error;
    }
  },
  
  /**
   * Login a user
   * @param {Object} credentials - User credentials
   * @returns {Promise<Object>} Login result with tokens and user data
   */
  async login(credentials) {
    try {
      const response = await api.post('/auth/login', credentials);
      const { data } = response;
      
      // Store tokens and user data
      if (data.data.accessToken) {
        authService.setToken(data.data.accessToken);
      }
      
      if (data.data.refreshToken) {
        authService.setRefreshToken(data.data.refreshToken);
      }
      
      if (data.data.user) {
        authService.setUser(data.data.user);
      }
      
      return data;
    } catch (error) {
      this.handleApiError(error);
      throw error;
    }
  },
  
  /**
   * Logout a user
   * @returns {Promise<Object>} Logout result
   */
  async logout() {
    try {
      const refreshToken = authService.getRefreshToken();
      
      if (refreshToken) {
        await api.post('/auth/logout', { refreshToken });
      }
      
      // Clear tokens and user data
      authService.clearTokens();
      
      return { success: true };
    } catch (error) {
      // Even if the API call fails, clear tokens
      authService.clearTokens();
      
      this.handleApiError(error);
      return { success: true }; // Return success anyway
    }
  },
  
  /**
   * Get user profile
   * @returns {Promise<Object>} User profile
   */
  async getProfile() {
    try {
      const response = await api.get('/auth/profile');
      return response.data;
    } catch (error) {
      this.handleApiError(error);
      throw error;
    }
  },
  
  /**
   * Update user profile
   * @param {Object} userData - User data to update
   * @returns {Promise<Object>} Updated user profile
   */
  async updateProfile(userData) {
    try {
      const response = await api.put('/auth/profile', userData);
      return response.data;
    } catch (error) {
      this.handleApiError(error);
      throw error;
    }
  },
  
  /**
   * Get BudBar data
   * @returns {Promise<Object>} BudBar data
   */
  async getBudBarData() {
    try {
      const response = await api.get('/budbar');
      return response.data;
    } catch (error) {
      this.handleApiError(error);
      throw error;
    }
  },
  
  /**
   * Get membership data
   * @returns {Promise<Object>} Membership data
   */
  async getMembershipData() {
    try {
      const response = await api.get('/membership');
      return response.data;
    } catch (error) {
      this.handleApiError(error);
      throw error;
    }
  },
  
  /**
   * Get all strains
   * @returns {Promise<Object>} Strains data
   */
  async getAllStrains() {
    try {
      const response = await api.get('/strains');
      return response.data;
    } catch (error) {
      this.handleApiError(error);
      throw error;
    }
  },
  
  /**
   * Get strains by type
   * @param {string} type - Strain type
   * @returns {Promise<Object>} Strains data
   */
  async getStrainsByType(type) {
    try {
      const response = await api.get(`/strains/${type}`);
      return response.data;
    } catch (error) {
      this.handleApiError(error);
      throw error;
    }
  },
  
  /**
   * Test API connection
   * @returns {Promise<Object>} API status
   */
  async testConnection() {
    try {
      // First check if server is running
      const isServerRunning = await this.checkServerStatus();
      
      if (!isServerRunning) {
        console.error('[API] Server does not appear to be running');
        throw new Error('Server does not appear to be running. Please ensure your backend server is started.');
      }
      
      // Test the connection with detailed logging
      console.log('[API] Testing connection...');
      const response = await api.get('/test');
      console.log('[API] Test successful:', response.data);
      
      // Try health endpoint if available
      try {
        const healthResponse = await api.get('/health');
        console.log('[API] Health check successful:', healthResponse.data);
      } catch (healthError) {
        console.log('[API] Health endpoint not available:', healthError.message);
      }
      
      return response.data;
    } catch (error) {
      console.error('[API] Connection test failed:', error.message);
      // Log additional details for debugging
      if (error.config) {
        console.error('[API] Failed request details:', {
          url: error.config.url,
          method: error.config.method,
          baseURL: error.config.baseURL,
          headers: error.config.headers
        });
      }
      throw error;
    }
  },
  
  /**
   * Check if the server is running
   * @returns {Promise<boolean>} Whether the server is running
   */
  async checkServerStatus() {
    try {
      // Use fetch API with different options to check server status
      const response = await fetch('/status', {
        method: 'GET',
        cache: 'no-cache',
        headers: {
          'Content-Type': 'text/plain'
        }
      });
      console.log('[API] Server status check response:', response.status);
      return response.status >= 200 && response.status < 300;
    } catch (error) {
      // Try with no-cors mode as a fallback
      try {
        const response = await fetch('/status', {
          method: 'GET',
          mode: 'no-cors', // This allows us to at least detect if server is running
          cache: 'no-cache'
        });
        console.log('[API] Server status check response type:', response.type);
        return true; // If we get here, server is responding
      } catch (fallbackError) {
        console.error('[API] Server appears to be down:', fallbackError);
        return false;
      }
    }
  },
  
  /**
   * Handle API errors
   * @param {Error} error - API error
   */
  handleApiError(error) {
    if (error.response) {
      // The request was made and the server responded with an error status
      console.error('[API] Error Response:', error.response.data);
      
      // Check if we received HTML instead of JSON and log a special message
      const contentType = error.response.headers['content-type'];
      if (contentType && contentType.includes('text/html')) {
        console.error('[API] Received HTML instead of JSON. Possible routing issue or incorrect endpoint.');
      }
      
      // Extract error message and code
      const errorMessage = error.response.data.error?.message || 'An error occurred';
      const errorCode = error.response.data.error?.code || 'UNKNOWN_ERROR';
      
      // Enhance error with API details
      error.apiError = {
        message: errorMessage,
        code: errorCode,
        status: error.response.status
      };
    } else if (error.request) {
      // The request was made but no response was received
      console.error('[API] No Response:', error.request);
      
      // Check if this might be a CORS issue
      if (error.message === 'Network Error') {
        console.error('[API] This appears to be a CORS issue. Check server CORS configuration.');
      }
      
      error.apiError = {
        message: 'No response from server',
        code: 'SERVER_UNREACHABLE',
        status: 0
      };
    } else {
      // Something happened in setting up the request
      console.error('[API] Request Error:', error.message);
      
      error.apiError = {
        message: error.message,
        code: 'REQUEST_FAILED',
        status: 0
      };
    }
  }
};

export { api, apiService };
