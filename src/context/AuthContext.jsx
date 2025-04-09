import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = () => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (token && storedUser) {
      setIsAuthenticated(true);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  };

  const login = (userData, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    setIsAuthenticated(true);
  };

  const logout = async () => {
    console.log('Starting logout process...'); // Debug log
    try {
      const token = localStorage.getItem('token');
      console.log('Token found:', !!token); // Debug log

      if (token) {
        await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/logout`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Logout API call successful'); // Debug log
      }

    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      console.log('Cleaning up auth state...'); // Debug log
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      setIsAuthenticated(false);
      console.log('Auth state cleaned up'); // Debug log
      navigate('/');
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
