import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthProvider';

/**
 * Protected Route Component
 * Restricts access to authenticated users only
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render if authenticated
 * @param {string[]} [props.requiredRoles] - Optional roles required to access the route
 * @param {string} [props.redirectTo] - Path to redirect to if not authenticated (default: /login)
 * @returns {React.ReactNode} - Protected component or redirect
 */
const ProtectedRoute = ({ 
  children, 
  requiredRoles = [], 
  redirectTo = '/login' 
}) => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  // Check if user has required roles
  const hasRequiredRoles = () => {
    if (requiredRoles.length === 0) return true;
    if (!user || !user.role) return false;
    return requiredRoles.includes(user.role);
  };

  // Effect to log authentication status
  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        console.log('Access denied: User not authenticated');
      } else if (!hasRequiredRoles()) {
        console.log('Access denied: User does not have required roles');
      }
    }
  }, [isAuthenticated, loading]);

  // Show loading state
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  // Redirect if not authenticated or doesn't have required roles
  if (!isAuthenticated || !hasRequiredRoles()) {
    // Save the attempted URL for redirecting after login
    const currentPath = location.pathname + location.search + location.hash;
    
    return (
      <Navigate 
        to={redirectTo} 
        state={{ from: currentPath }} 
        replace 
      />
    );
  }

  // Render children if authenticated and has required roles
  return children;
};

export default ProtectedRoute;