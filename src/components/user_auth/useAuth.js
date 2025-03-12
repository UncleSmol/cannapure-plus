import { useContext } from 'react';
import AuthContext from './AuthContext';

/**
 * Custom hook for accessing authentication context
 * Provides access to user state and authentication methods
 * 
 * @returns {Object} Authentication context
 * @example
 * const { user, isAuthenticated, login, logout } = useAuth();
 */
const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

export default useAuth;
