import React from 'react';
import useAuth from './useAuth';

/**
 * ProtectedRoute component
 * Renders children only if user is authenticated
 * Redirects to login page otherwise
 */
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  // Show loading state while authentication is being checked
  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }
  
  // Redirect to login page if not authenticated
  if (!isAuthenticated) {
    // Use hash-based routing
    window.location.hash = "userAuthenticationPage";
    return null;
  }
  
  // If authenticated, render the protected content
  return children;
};

export default ProtectedRoute;
