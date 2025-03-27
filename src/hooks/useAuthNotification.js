import { useCallback } from 'react';
import { useAuth } from '../context/AuthProvider';
import { useNotification } from '../context/NotificationProvider';

/**
 * Custom hook that combines authentication functions with notifications
 * @returns {Object} Auth methods with integrated notifications
 */
export const useAuthNotification = () => {
  const auth = useAuth();
  const { success, error: showError } = useNotification();

  // Login with notifications
  const login = useCallback(async (credentials) => {
    try {
      const result = await auth.login(credentials);
      success('Successfully logged in!');
      return result;
    } catch (err) {
      showError(err.message || 'Login failed. Please check your credentials.');
      throw err;
    }
  }, [auth, success, showError]);

  // Register with notifications
  const register = useCallback(async (userData) => {
    try {
      const result = await auth.register(userData);
      
      if (result.success) {
        success('Registration successful! You can now log in.');
      } else {
        showError(result.error || 'Registration failed. Please try again.');
      }
      
      return result;
    } catch (err) {
      showError(err.message || 'Registration failed. Please try again.');
      throw err;
    }
  }, [auth, success, showError]);

  // Logout with notifications
  const logout = useCallback(async () => {
    try {
      await auth.logout();
      success('Successfully logged out');
    } catch (err) {
      showError(err.message || 'Logout failed');
      throw err;
    }
  }, [auth, success, showError]);

  // Update profile with notifications
  const updateProfile = useCallback(async (userData) => {
    try {
      const result = await auth.updateProfile(userData);
      success('Profile updated successfully');
      return result;
    } catch (err) {
      showError(err.message || 'Failed to update profile');
      throw err;
    }
  }, [auth, success, showError]);

  return {
    ...auth,
    login,
    register,
    logout,
    updateProfile
  };
};

export default useAuthNotification;