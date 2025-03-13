import React, { createContext, useState, useEffect } from 'react';
import { authService } from '../services/api.service';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [apiStatus, setApiStatus] = useState(null);

  // Check for existing auth on mount and test API connection
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // First, test API connection to make sure we're using the right port
        try {
          const healthCheck = await authService.testConnection();
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
          // Validate token or get user data
          // This would typically call an endpoint like /auth/me or use the token to get user data
          // For now, we'll just set the user from localStorage if available
          const userData = JSON.parse(localStorage.getItem('userData') || '{}');
          if (userData.id) {
            setUser(userData);
          }
        }
      } catch (err) {
        console.error('Auth status check failed:', err);
        // Clear potentially invalid auth data
        localStorage.removeItem('token');
        localStorage.removeItem('userData');
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (credentials) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await authService.login(credentials);
      
      // Store token and user data
      localStorage.setItem('token', response.token);
      localStorage.setItem('userData', JSON.stringify(response.user));
      
      setUser(response.user);
      return response;
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('AuthProvider: Registering user with data:', { ...userData, password: '********' });
      const response = await authService.register(userData);
      console.log('AuthProvider: Registration response:', response);
      
      // If registration automatically logs in the user
      if (response.token) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('userData', JSON.stringify(response.user));
        setUser(response.user);
      }
      
      return response;
    } catch (err) {
      console.error('AuthProvider: Registration error:', err);
      setError(err.response?.data?.error || 'Registration failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    
    try {
      // Call logout API
      await authService.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      // Clear local storage and state regardless of API success
      localStorage.removeItem('token');
      localStorage.removeItem('userData');
      setUser(null);
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    error,
    apiStatus,
    login,
    register,
    logout,
    isAuthenticated: !!user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
