import { createContext } from 'react';

// Create the Authentication Context
const AuthContext = createContext({
  // User state
  user: null,
  isAuthenticated: false,
  isLoading: true,
  
  // Token management
  accessToken: null,
  refreshToken: null,
  
  // Authentication methods
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  
  // Token refresh method
  refreshAccessToken: async () => {},
  
  // Auth state
  error: null,
  clearError: () => {},
});

export default AuthContext;
