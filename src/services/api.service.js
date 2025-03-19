/**
 * API Service
 * Handles API requests with authentication
 */
import axios from 'axios';
import authService from './AuthService';

// Create axios instance
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor
api.interceptors.request.use(
  async (config) => {
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
        console.error('Token refresh failed:', error);
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
    return Promise.reject(error);
  }
);

// Add response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
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
        console.error('Token refresh failed in response interceptor:', refreshError);
        authService.clearTokens();
        
        // Redirect to login page
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
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
      const response = await api.get('/status');
      return response.data;
    } catch (error) {
      console.error('API connection test failed:', error);
      throw error;
    }
  },
  
  /**
   * Handle API errors
   * @param {Error} error - API error
   */
  handleApiError(error) {
    if (error.response) {
      // The request was made and the server responded with an error status
      console.error('API Error Response:', error.response.data);
      
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
      console.error('API No Response:', error.request);
      
      error.apiError = {
        message: 'No response from server',
        code: 'SERVER_UNREACHABLE',
        status: 0
      };
    } else {
      // Something happened in setting up the request
      console.error('API Request Error:', error.message);
      
      error.apiError = {
        message: error.message,
        code: 'REQUEST_FAILED',
        status: 0
      };
    }
  }
};

export { api, apiService };