import { useContext } from 'react';
import { AuthContext } from '../context/AuthProvider';

/**
 * Custom hook to use the authentication context
 * Provides access to authentication state and methods
 * 
 * @returns {Object} Authentication context
 * @property {Object|null} user - Current user data or null if not authenticated
 * @property {boolean} isAuthenticated - Whether user is authenticated
 * @property {boolean} loading - Whether authentication is loading
 * @property {string|null} error - Authentication error message or null
 * @property {Object|null} apiStatus - API connection status
 * @property {Function} login - Login function
 * @property {Function} register - Registration function
 * @property {Function} logout - Logout function
 * @property {Function} getProfile - Get user profile function
 * @property {Function} updateProfile - Update user profile function
 * @property {Function} clearError - Clear authentication error function
 */
const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

export default useAuth;