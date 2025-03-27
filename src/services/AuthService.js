/**
 * Authentication Service
 * Handles token management, validation, and refresh
 */
import { jwtDecode } from 'jwt-decode';
import apiConfig from '../config/api.config';

class AuthService {
  constructor() {
    this.baseUrl = apiConfig.baseUrl;
    this.tokenKey = 'accessToken';
    this.refreshTokenKey = 'refreshToken';
    this.userKey = 'user';
    
    console.log('AuthService initialized with baseUrl:', this.baseUrl);
  }

  /**
   * Get access token from localStorage
   * @returns {string|null} Access token or null if not found
   */
  getToken() {
    return localStorage.getItem(this.tokenKey);
  }

  /**
   * Store access token in localStorage
   * @param {string} token - JWT access token
   */
  setToken(token) {
    if (token) {
      localStorage.setItem(this.tokenKey, token);
    } else {
      localStorage.removeItem(this.tokenKey);
    }
  }

  /**
   * Get refresh token from localStorage
   * @returns {string|null} Refresh token or null if not found
   */
  getRefreshToken() {
    return localStorage.getItem(this.refreshTokenKey);
  }

  /**
   * Store refresh token in localStorage
   * @param {string} token - JWT refresh token
   */
  setRefreshToken(token) {
    if (token) {
      localStorage.setItem(this.refreshTokenKey, token);
    } else {
      localStorage.removeItem(this.refreshTokenKey);
    }
  }

  /**
   * Clear all authentication data from localStorage
   */
  clearTokens() {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.refreshTokenKey);
    localStorage.removeItem(this.userKey);
  }

  /**
   * Store user data in localStorage
   * @param {Object} user - User data
   */
  setUser(user) {
    if (user) {
      localStorage.setItem(this.userKey, JSON.stringify(user));
    } else {
      localStorage.removeItem(this.userKey);
    }
  }

  /**
   * Get user data from localStorage
   * @returns {Object|null} User data or null if not found
   */
  getUser() {
    const userStr = localStorage.getItem(this.userKey);
    if (!userStr) return null;
    
    try {
      return JSON.parse(userStr);
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  }

  /**
   * Check if user is authenticated
   * @returns {boolean} True if user has valid token
   */
  isAuthenticated() {
    const token = this.getToken();
    return !!token && !this.isTokenExpired(token);
  }

  /**
   * Decode JWT token
   * @param {string} token - JWT token
   * @returns {Object|null} Decoded token payload or null if invalid
   */
  decodeToken(token) {
    if (!token) return null;
    
    try {
      return jwtDecode(token);
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }

  /**
   * Check if token is expired
   * @param {string} token - JWT token
   * @returns {boolean} True if token is expired or invalid
   */
  isTokenExpired(token) {
    if (!token) return true;
    
    try {
      const decoded = this.decodeToken(token);
      if (!decoded || !decoded.exp) return true;
      
      // exp is in seconds, Date.now() is in milliseconds
      const currentTime = Date.now() / 1000;
      return decoded.exp < currentTime;
    } catch (error) {
      console.error('Error checking token expiration:', error);
      return true;
    }
  }

  /**
   * Get time until token expiration in seconds
   * @param {string} token - JWT token
   * @returns {number} Seconds until expiration, 0 if expired
   */
  getTokenTimeRemaining(token) {
    if (!token) return 0;
    
    try {
      const decoded = this.decodeToken(token);
      if (!decoded || !decoded.exp) return 0;
      
      const currentTime = Date.now() / 1000;
      return Math.max(0, Math.floor(decoded.exp - currentTime));
    } catch (error) {
      console.error('Error getting token time remaining:', error);
      return 0;
    }
  }

  /**
   * Extract user data from token
   * @param {string} token - JWT token
   * @returns {Object|null} User data or null if invalid
   */
  getUserFromToken(token) {
    if (!token) return null;
    
    try {
      const decoded = this.decodeToken(token);
      if (!decoded) return null;
      
      return {
        id: decoded.userId,
        email: decoded.email,
        firstName: decoded.firstName,
        lastName: decoded.lastName,
        membershipTier: decoded.membershipTier,
        membershipStatus: decoded.membershipStatus,
        accountStatus: decoded.accountStatus
      };
    } catch (error) {
      console.error('Error extracting user from token:', error);
      return null;
    }
  }

  /**
   * Should token be refreshed (less than 5 minutes remaining)
   * @param {string} token - JWT token
   * @returns {boolean} True if token should be refreshed
   */
  shouldRefreshToken(token) {
    const timeRemaining = this.getTokenTimeRemaining(token);
    // Refresh if less than 5 minutes remaining
    return timeRemaining < 300;
  }

  /**
   * Login user with email and password
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<Object>} Login response data
   */
  async login(email, password) {
    try {
      console.log(`Attempting login for email: ${email} to ${apiConfig.auth.login}`);
      const response = await fetch(apiConfig.auth.login, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      // Parse the JSON response
      const data = await response.json();

      if (!response.ok) {
        // Extract the error message properly
        const errorMessage = data.error?.message || 
                            data.error || 
                            'Login failed. Please check your credentials.';
        console.error('Login response error:', errorMessage);
        throw new Error(errorMessage);
      }

      console.log('Login successful, response:', data);
      
      // Store tokens in localStorage - adjust property names based on your API response
      this.setToken(data.data?.accessToken || data.accessToken || data.token);
      this.setRefreshToken(data.data?.refreshToken || data.refreshToken);
      
      // Extract and store user data
      const userData = data.data?.user || data.user || this.getUserFromToken(data.token);
      if (userData) {
        this.setUser(userData);
      }
      
      return data;
    } catch (error) {
      console.error('Login error:', error.message);
      // Throw error with message, not the entire object
      throw new Error(error.message || 'Login failed');
    }
  }

  /**
   * Logout user and clear all auth data
   * @returns {Promise<void>}
   */
  async logout() {
    try {
      console.log("AuthService: Attempting logout");
      
      // Get the refresh token for server-side invalidation
      const refreshToken = this.getRefreshToken();
      
      if (refreshToken) {
        // Call the logout endpoint to invalidate the token on the server
        const response = await fetch(apiConfig.auth.logout, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ refreshToken }),
        });
        
        if (!response.ok) {
          console.warn('Server-side logout failed, but continuing with client-side logout');
        } else {
          console.log('Server-side logout successful');
        }
      }
    } catch (error) {
      console.error('Error during logout:', error);
      // Continue with client-side logout even if server-side fails
    } finally {
      // Always clear local tokens regardless of API success
      console.log('Clearing local authentication data');
      this.clearTokens();
    }
  }

  /**
   * Refresh the access token using refresh token
   * @returns {Promise<Object>} Refresh response data
   */
  async refreshToken() {
    const refreshToken = this.getRefreshToken();
    
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }
    
    try {
      const response = await fetch(apiConfig.auth.refresh, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to refresh token');
      }
      
      const data = await response.json();
      
      this.setToken(data.token);
      this.setRefreshToken(data.refreshToken);
      
      // Update user data if needed
      const userData = this.getUserFromToken(data.token);
      if (userData) {
        this.setUser(userData);
      }
      
      return data;
    } catch (error) {
      console.error('Error refreshing token:', error);
      this.logout();
      throw error;
    }
  }

  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @returns {Promise<Object>} Registration response
   */
  async register(userData) {
    try {
      console.log(`Attempting to register user with email: ${userData.email}`);
      
      // Ensure the data has the expected field names
      const registrationData = {
        ...userData,
        // If userData was sent with camelCase instead of snake_case
        first_name: userData.first_name || userData.firstName,
        last_name: userData.last_name || userData.lastName,
        phone_number: userData.phone_number || userData.phoneNumber,
        id_number: userData.id_number || userData.idNumber
      };
      
      const response = await fetch(apiConfig.auth.register, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registrationData),
      });

      // Parse the JSON response
      const data = await response.json();

      if (!response.ok) {
        // Extract the error message properly
        const errorMessage = data.error?.message || 
                            data.error || 
                            'Registration failed. Please try again.';
        console.error('Registration response error:', errorMessage);
        throw new Error(errorMessage);
      }

      console.log('Registration successful, response:', data);
      
      // If the API automatically logs in the user after registration
      if (data.data?.accessToken || data.accessToken || data.token) {
        this.setToken(data.data?.accessToken || data.accessToken || data.token);
        this.setRefreshToken(data.data?.refreshToken || data.refreshToken);
      
        // Extract and store user data
        const userData = data.data?.user || data.user || this.getUserFromToken(data.token);
        if (userData) {
          this.setUser(userData);
        }
      }
      
      return data;
    } catch (error) {
      console.error('Registration error:', error.message);
      // Throw error with message, not the entire object
      throw new Error(error.message || 'Registration failed');
    }
  }
}

const authService = new AuthService();

export default authService;
