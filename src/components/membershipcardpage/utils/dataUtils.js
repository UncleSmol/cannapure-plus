import axios from "axios";
import { API_URL } from "./constants";

/**
 * Fetches membership data from the API
 * @param {string} authToken - Authentication token
 * @returns {Promise} Promise that resolves to membership data
 */
export const fetchMembershipData = async (authToken) => {
  if (!authToken) {
    throw new Error('Authentication token is required');
  }

  // Set up request config with auth token
  const config = {
    headers: {
      Authorization: `Bearer ${authToken}`
    }
  };

  try {
    // Using proper endpoint structure
    const endpoint = '/user/membership';
    console.log('Fetching membership data from:', `${API_URL}/api${endpoint}`);
    
    // Make the API request with the correct URL
    const response = await axios.get(`${API_URL}/api${endpoint}`, config);
    
    console.log('Membership data received:', response.data);
    return response.data;
  } catch (err) {
    console.error("Error fetching user data:", err);
    
    // Try fallback endpoint if main one fails
    try {
      console.log('Trying fallback endpoint');
      const fallbackResponse = await axios.get(`${API_URL}/api/membership`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      console.log('Fallback data received:', fallbackResponse.data);
      return fallbackResponse.data;
    } catch (fallbackErr) {
      console.error("Fallback endpoint also failed:", fallbackErr);
      
      // Rethrow the original error
      throw err;
    }
  }
};

/**
 * Creates mock membership data based on user context
 * @param {Object} user - User object from auth context
 * @returns {Object} Mock membership data
 */
export const createMockMembershipData = (user) => {
  if (!user) return null;
  
  return {
    firstName: user.firstName || user.first_name || 'User',
    last_name: user.lastName || user.last_name || '',
    cpNumber: user.cpNumber || `CP${String(user.id || '000000').padStart(6, '0')}`,
    membershipTier: user.membershipTier || user.membership_tier || 'basic',
    activeDays: 0,
    membershipStatus: 'ACTIVE',
    issuedDate: new Date().toISOString()
  };
};

/**
 * Determines the appropriate error message based on the error
 * @param {Error} error - The error object
 * @returns {string} User-friendly error message
 */
export const getErrorMessage = (error) => {
  if (!error) return "An unknown error occurred";
  
  if (error.response) {
    // Request was made and server responded with error status
    if (error.response.status === 401) {
      return 'Your session has expired. Please log in again.';
    } else if (error.response.status === 404) {
      return 'No membership found for your account.';
    } else if (error.response.status >= 500) {
      return 'Server error. Please try again later.';
    }
  } else if (error.request) {
    // Request was made but no response received
    return 'Unable to connect to the server. Please check your internet connection.';
  }
  
  // Something else caused the error
  return "Failed to load membership data. Please try again.";
};