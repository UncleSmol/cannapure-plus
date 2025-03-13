import React, { useState, useEffect, useCallback} from 'react';
import AuthContext from './AuthContext';
import axios from 'axios';

// API base URL - Fixed to use the correct port and path
const API_URL = 'http://localhost:5000/api/auth';

// Create the AuthProvider component
const AuthProvider = ({ children }) => {
  // State for user data
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State for tokens
  const [accessToken, setAccessToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  
  const clearError = () => setError(null);
  
  /**
   * Handle user logout
   */
  const handleLogout = useCallback(async () => {
    setIsLoading(true);
    
    try {
      // Only call logout API if we have a user and session token
      if (user?.id && refreshToken) {
        await axios.post(`${API_URL}/logout`, {
          userId: user.id,
          sessionToken: refreshToken
        });
      }
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      // Reset auth state regardless of API success
      setUser(null);
      setAccessToken(null);
      setRefreshToken(null);
      setIsAuthenticated(false);
      
      // Clear local storage
      localStorage.removeItem('user');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      
      // Clear Authorization header
      delete axios.defaults.headers.common['Authorization'];
      
      setIsLoading(false);
    }
  }, [user, refreshToken]);
  
  // Initialize auth state from local storage on component mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        const storedAccessToken = localStorage.getItem('accessToken');
        const storedRefreshToken = localStorage.getItem('refreshToken');
        
        if (storedUser && storedAccessToken) {
          // Set auth state from local storage
          setUser(JSON.parse(storedUser));
          setAccessToken(storedAccessToken);
          setRefreshToken(storedRefreshToken);
          setIsAuthenticated(true);
          
          // Set default Authorization header
          axios.defaults.headers.common['Authorization'] = `Bearer ${storedAccessToken}`;
          
          // You could verify the token here if needed
        }
      } catch (err) {
        console.error('Failed to initialize auth state:', err);
        // Clear potentially corrupted storage
        localStorage.removeItem('user');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      } finally {
        setIsLoading(false);
      }
    };
    
    initializeAuth();
  }, []);
  
 // Axios interceptor for automatic token refresh
useEffect(() => {
  const interceptor = axios.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
      
      // If error is 401 and we haven't tried refreshing already
      if (error.response?.status === 401 && !originalRequest._retry && refreshToken) {
        originalRequest._retry = true;
        
        try {
          // Attempt token refresh
          const response = await axios.post(`${API_URL}/refresh`, { refreshToken });
          const { accessToken: newAccessToken } = response.data;
          
          // Update access token
          setAccessToken(newAccessToken);
          localStorage.setItem('accessToken', newAccessToken);
          
          // Update the Authorization header
          axios.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
          originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
          
          // Retry the original request
          return axios(originalRequest);
        } catch (err) {
          // Refresh token is invalid, force re-login
          handleLogout();
          return Promise.reject(err);
        }
      }
      
      return Promise.reject(error);
    }
  );
  
  // Clean up interceptor on component unmount
  return () => {
    axios.interceptors.response.eject(interceptor);
  };
}, [refreshToken, handleLogout]); // Now handleLogout is defined before being used here
  
  /**
   * Handle user login
   * @param {string} email - User email
   * @param {string} password - User password
   * @param {string} cpNumber - User's CP/CPD number (optional)
   */
  const handleLogin = async (email, password, cpNumber) => {
    setIsLoading(true);
    clearError();
    
    try {
      // Fixed: Removed duplicated /auth/ in the path
      const response = await axios.post(`${API_URL}/login`, {
        email,
        password,
        cpNumber
      });
      
      const { user, tokens } = response.data;
      
      // Store user data and tokens
      setUser(user);
      setAccessToken(tokens.accessToken);
      setRefreshToken(tokens.refreshToken);
      setIsAuthenticated(true);
      
      // Save to local storage
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('accessToken', tokens.accessToken);
      localStorage.setItem('refreshToken', tokens.refreshToken);
      
      // Set default Authorization header
      axios.defaults.headers.common['Authorization'] = `Bearer ${tokens.accessToken}`;
      
      return { success: true, user };
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Login failed. Please try again.';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };
  
  /**
   * Handle user registration
   * @param {Object} userData - User registration data
   */
  const handleRegister = async (userData) => {
    setIsLoading(true);
    clearError();
    
    try {
      // Fixed: Removed duplicated /auth/ in the path
      const response = await axios.post(`${API_URL}/register`, userData);
      return { success: true, data: response.data };
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Registration failed. Please try again.';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };
  
  /**
   * Manually refresh the access token
   */
  const handleRefreshToken = async () => {
    if (!refreshToken) {
      return { success: false, error: 'No refresh token available' };
    }
    
    try {
      const response = await axios.post(`${API_URL}/refresh`, { refreshToken });
      const { accessToken: newAccessToken } = response.data;
      
      // Update access token
      setAccessToken(newAccessToken);
      localStorage.setItem('accessToken', newAccessToken);
      
      // Update Authorization header
      axios.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
      
      return { success: true };
    } catch (err) {
      console.error('Token refresh error:', err);
      handleLogout(); // Force logout on refresh failure
      return { success: false, error: 'Session expired. Please log in again.' };
    }
  };
  
  // Prepare context value
  const contextValue = {
    // User state
    user,
    isAuthenticated,
    isLoading,
    
    // Token state
    accessToken,
    refreshToken,
    
    // Auth methods
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    refreshAccessToken: handleRefreshToken,
    
    // Error handling
    error,
    clearError
  };
  
  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
