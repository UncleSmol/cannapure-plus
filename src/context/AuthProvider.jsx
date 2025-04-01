import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';
import authService from '../services/AuthService';
import { apiService } from '../services/api.service';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [apiStatus, setApiStatus] = useState(null);

  /**
   * Get user profile
   * @returns {Promise<Object>} User profile
   */
  const getProfile = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);

      // Use the API service to get profile
      const response = await apiService.getProfile();

      // Update user state with profile data
      if (response.user) {
        setUser(response.user);
        localStorage.setItem('userData', JSON.stringify(response.user));
      }

      return response;
    } catch (error) {
      console.error('Get profile failed:', error);
      
      if (error.response?.data?.error) {
        setError(error.response.data.error);
      } else {
        setError(error.message || 'Failed to get profile');
      }
      
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Check for existing auth on mount and test API connection
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // First, test API connection to make sure we're using the right port
        try {
          const healthCheck = await apiService.testConnection();
          console.log('API health check successful:', healthCheck);
          setApiStatus({
            connected: true,
            port: healthCheck.serverPort || 5000,
            endpoints: healthCheck.apiRoutes
          });
        } catch (healthError) {
          console.error('API health check failed:', healthError);
          setApiStatus({
            connected: false,
            error: healthError.message
          });
        }

        // Check if we have a token in localStorage
        const token = localStorage.getItem('token');
        
        if (token) {
          // Check if token is expired
          // In a real implementation, you would validate the token here
          // For now, we'll just set the user from localStorage if available
          const userData = JSON.parse(localStorage.getItem('userData') || '{}');
          if (userData.id) {
            setUser(userData);
          } else {
            // If we have a token but no user data, try to fetch user profile
            try {
              const profile = await getProfile();
              if (profile && profile.data && profile.data.user) {
                setUser(profile.data.user);
              }
            } catch (profileError) {
              console.error('Failed to fetch user profile:', profileError);
              // Clear invalid auth data
              localStorage.removeItem('token');
              localStorage.removeItem('userData');
            }
          }
        }
      } catch (err) {
        console.error('Auth status check failed:', err);
        setError(err.message || 'Authentication initialization failed');
        // Clear potentially invalid auth data
        localStorage.removeItem('token');
        localStorage.removeItem('userData');
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, [getProfile]);

  // Set up token refresh interval if needed in the future
  useEffect(() => {
    // Only set up refresh interval if user is logged in
    if (!user) return;

    const token = localStorage.getItem('token');
    if (!token) return;

    // This is where you would implement token refresh logic
    // For example, checking token expiration and refreshing when needed

    return () => {
      // Clean up any intervals or timers here
    };
  }, [user]);

  /**
   * Login user with email and password
   * @param {Object} credentials - User credentials
   * @returns {Promise<Object>} Login result
   */
  const login = useCallback(async (credentials) => {
    try {
      setError(null);
      setLoading(true);

      console.log('AuthProvider: Attempting login with credentials:', {
        ...credentials, 
        password: credentials.password ? '********' : undefined
      });

      const response = await authService.login(credentials.email, credentials.password);
      console.log('AuthProvider: Login successful, response:', response);
      
      // Store token and user data - adjust based on your API response structure
      const token = response.data?.accessToken || response.accessToken || response.token;
      const userData = response.data?.user || response.user;
      
      if (token) {
        localStorage.setItem('token', token);
      }
      
      if (userData) {
        localStorage.setItem('userData', JSON.stringify(userData));
        setUser(userData);
      }
      
      return response;
    } catch (err) {
      console.error('Login failed:', err.message);
      
      // Set user-friendly error message
      setError(err.message || 'Login failed');
      
      throw new Error(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @returns {Promise<Object>} Registration result
   */
  const register = useCallback(async (userData) => {
    try {
      setError(null);
      setLoading(true);
      
      console.log('AuthProvider: Registering user with data:', { 
        ...userData, 
        password: userData.password ? '********' : undefined 
      });
      
      const response = await authService.register(userData);
      console.log('AuthProvider: Registration response:', response);
      
      // If registration automatically logs in the user
      if (response.token || response.data?.accessToken) {
        const token = response.token || response.data?.accessToken;
        const userData = response.user || response.data?.user;
        
        if (token) {
          localStorage.setItem('token', token);
        }
        
        if (userData) {
          localStorage.setItem('userData', JSON.stringify(userData));
          setUser(userData);
        }
      }
      
      // Return success format
      return { 
        success: true,
        data: response 
      };
    } catch (err) {
      console.error('AuthProvider: Registration error:', err);
      
      // Set user-friendly error message
      setError(err.message || 'Registration failed');
      
      // Return error format
      return {
        success: false,
        error: err.message || 'Registration failed'
      };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Logout user
   * @returns {Promise<void>}
   */
  const logout = useCallback(async () => {
    try {
      console.log('AuthProvider: Logging out user');
      setLoading(true);
      
      // Call logout API
      await authService.logout();
      
      console.log('AuthProvider: Logout successful');
    } catch (err) {
      console.error('AuthProvider: Logout error:', err);
    } finally {
      // Clear local storage and state regardless of API success
      console.log('AuthProvider: Clearing auth state');
      localStorage.removeItem('token');
      localStorage.removeItem('userData');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      
      // Update state to reflect logged out status
      setUser(null);
      setLoading(false);
    }
  }, []);

  /**
   * Update user profile
   * @param {Object} userData - User data to update
   * @returns {Promise<Object>} Updated profile
   */
  const updateProfile = useCallback(async (userData) => {
    try {
      setError(null);
  setLoading(true);

      // Use the API service to update profile
      const response = await apiService.updateProfile(userData);

      // Update user state with updated profile data
      if (response.user) {
        setUser(response.user);
        localStorage.setItem('userData', JSON.stringify(response.user));
      }

      return response;
    } catch (error) {
      console.error('Update profile failed:', error);
      
      if (error.response?.data?.error) {
        setError(error.response.data.error);
      } else {
        setError(error.message || 'Failed to update profile');
      }
      
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Clear authentication error
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value = {
    user,
    loading,
    error,
    apiStatus,
    login,
    register,
    logout,
    getProfile,
    updateProfile,
    clearError,
    isAuthenticated: !!user,
    token: localStorage.getItem('token')
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
