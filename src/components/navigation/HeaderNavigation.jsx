import React from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../user_auth/useAuth';
import AuthStatusIndicator from '../user_auth/AuthStatusIndicator';
// Import other components as needed

const HeaderNavigation = () => {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <nav className="header-navigation">
      {/* Other navigation items */}
      
      <div className="auth-section">
        {isAuthenticated ? (
          <>
            <AuthStatusIndicator>
              <button className="icon-button user-icon" aria-label="User account">
                {/* Your user icon SVG or component */}
                <svg className="auth-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                  <path fill="none" d="M0 0h24v24H0z"/>
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
                </svg>
              </button>
            </AuthStatusIndicator>
            <div className="user-menu">
              <span className="welcome-text">Welcome, {user?.name || 'User'}</span>
              <button onClick={logout} className="logout-button">Logout</button>
            </div>
          </>
        ) : (
          <Link to="/login" className="login-button">
            <AuthStatusIndicator>
              <span className="login-icon">
                {/* Your login icon SVG or component */}
                <svg className="auth-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                  <path fill="none" d="M0 0h24v24H0z"/>
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
                </svg>
              </span>
            </AuthStatusIndicator>
            <span className="login-text">Login</span>
          </Link>
        )}
      </div>
    </nav>
  );
};

export default HeaderNavigation;
