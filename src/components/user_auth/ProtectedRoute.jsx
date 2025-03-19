import React from 'react';
import { useAuth } from '../../context/AuthProvider';

/**
 * Protected Route Component
 * Only renders children if user is authenticated
 * Otherwise redirects to login page
 */
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  // Show loading state
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }
  
  // If not authenticated, redirect to login page
  if (!isAuthenticated) {
    // Navigate to login page
    window.location.hash = 'userAuthenticationPage';
    return null;
  }
  
  // If authenticated, render children
  return children;
};

export default ProtectedRoute;
