import axios from 'axios';

// Explicitly hardcode the API base URL to port 5000
const API_BASE_URL = 'http://localhost:5000/api';

console.log('API Service initialized with base URL:', API_BASE_URL);

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true
});

// Add request interceptor for debugging
apiClient.interceptors.request.use(request => {
  console.log('API Request:', request.method.toUpperCase(), request.baseURL + request.url);
  console.log('Full URL:', request.baseURL + request.url);
  return request;
});

// Add response interceptor for debugging
apiClient.interceptors.response.use(
  response => {
    console.log('API Response:', response.status, response.config.method.toUpperCase(), response.config.url);
    return response;
  },
  error => {
    console.error('API Error:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
      console.error('Request URL:', error.config.baseURL + error.config.url);
    } else if (error.request) {
      console.error('Request was made but no response received');
      console.error('Request:', error.request);
    }
    return Promise.reject(error);
  }
);

// Authentication service
const authService = {
  register: async (userData) => {
    console.log('Registering user with data:', { ...userData, password: '********' });
    try {
      // Explicitly construct the full URL to ensure it's correct
      const fullUrl = 'http://localhost:5000/api/auth/register';
      console.log('Full registration URL:', fullUrl);
      
      // Use the full URL directly instead of relying on baseURL
      const response = await axios.post(fullUrl, userData, {
        headers: {
          'Content-Type': 'application/json'
        },
        withCredentials: true
      });
      
      console.log('Registration successful:', response.data);
      return response.data;
    } catch (error) {
      console.error('Registration error:', error.response?.data || error.message);
      throw error;
    }
  },
  
  login: async (credentials) => {
    console.log('Logging in user:', credentials.email);
    try {
      // Explicitly construct the full URL to ensure it's correct
      const fullUrl = 'http://localhost:5000/api/auth/login';
      console.log('Full login URL:', fullUrl);
      
      // Use the full URL directly instead of relying on baseURL
      const response = await axios.post(fullUrl, credentials, {
        headers: {
          'Content-Type': 'application/json'
        },
        withCredentials: true
      });
      
      console.log('Login successful:', response.data);
      return response.data;
    } catch (error) {
      console.error('Login error:', error.response?.data || error.message);
      throw error;
    }
  },
  
  logout: async () => {
    console.log('Logging out user');
    try {
      const response = await apiClient.post('/auth/logout');
      console.log('Logout successful');
      return response.data;
    } catch (error) {
      console.error('Logout error:', error.response?.data || error.message);
      throw error;
    }
  },
  
  // Add a direct test method to verify API connectivity
  testConnection: async () => {
    try {
      // Explicitly construct the full URL to ensure it's correct
      const fullUrl = 'http://localhost:5000/api/health';
      console.log('Testing API connection to:', fullUrl);
      
      const response = await axios.get(fullUrl);
      console.log('API connection test successful:', response.data);
      return response.data;
    } catch (error) {
      console.error('API connection test failed:', error.message);
      throw error;
    }
  }
};

// Data services
const dataService = {
  getAllStrains: async () => {
    try {
      const response = await apiClient.get('/all-strains');
      return response.data;
    } catch (error) {
      console.error('Error fetching strains:', error.response?.data || error.message);
      throw error;
    }
  },
  
  getMembershipData: async () => {
    try {
      const response = await apiClient.get('/membership');
      return response.data;
    } catch (error) {
      console.error('Error fetching membership data:', error.response?.data || error.message);
      throw error;
    }
  }
};

export { authService, dataService, apiClient };
