import React from 'react';
import './AuthStatusIndicator.css';
import { useAuth } from '../../context/AuthProvider'; // Updated import path

/**
 * Auth Status Indicator
 * Shows API connection status and auth system status
 */
const AuthStatusIndicator = () => {
  const { apiStatus, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="auth-status-indicator loading">
        <div className="status-icon loading-icon"></div>
        <p>Checking authentication system...</p>
      </div>
    );
  }
  
  if (!apiStatus) {
    return null;
  }
  
  if (!apiStatus.connected) {
    return (
      <div className="auth-status-indicator error">
        <div className="status-icon error-icon"></div>
        <p>
          Authentication system unavailable
          {apiStatus.error && <span className="error-details">{apiStatus.error}</span>}
        </p>
      </div>
    );
  }
  
  return (
    <div className="auth-status-indicator success">
      <div className="status-icon success-icon"></div>
      <p>Authentication system connected</p>
    </div>
  );
};

export default AuthStatusIndicator;
