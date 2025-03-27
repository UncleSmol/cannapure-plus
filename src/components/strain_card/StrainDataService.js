
/**
 * Strain Data Service
 * Handles fetching strain data from the API
 */

/**
 * Fetches all strains from the API with improved error handling and retry logic
 * @param {boolean} forceRefresh - If true, bypasses cache and forces fresh data fetch
 * @returns {Promise<Object>} Object containing strain data
 */
const fetchAllStrains = async (forceRefresh = false) => {
  // Clear cache if force refresh is requested
  if (forceRefresh) {
    try {
      localStorage.removeItem('strain_data_cache');
      localStorage.removeItem('strain_data_timestamp');
      
      // Also clear category-specific cached data
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (
          key.startsWith('category-') || 
          key.startsWith('weeklyspecials_tag-') ||
          key.includes('-timestamp')
        )) {
          localStorage.removeItem(key);
        }
      }
      
      console.log('Cache cleared for fresh data fetch');
    } catch (cacheError) {
      console.warn('Failed to clear cache:', cacheError);
    }
  } else {
    // Check for cached data when not forcing refresh
    try {
      const cachedData = localStorage.getItem('strain_data_cache');
      const timestamp = localStorage.getItem('strain_data_timestamp');
      
      if (cachedData && timestamp) {
        const age = Date.now() - parseInt(timestamp);
        const MAX_AGE = 15 * 60 * 1000; // 15 minutes (reduced from 1 day)
        
        if (age < MAX_AGE) {
          console.log('Using cached strain data from', new Date(parseInt(timestamp)).toLocaleString());
          return JSON.parse(cachedData);
        }
      }
    } catch (cacheError) {
      console.error('Error retrieving cached data:', cacheError);
    }
  }

  // Number of retry attempts
  const MAX_RETRIES = 3;
  let retryCount = 0;
  
  while (retryCount < MAX_RETRIES) {
    try {
      // Add a timeout for fetch to prevent hanging requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
      
      console.log(`Fetching strains from API (attempt ${retryCount + 1})...`);
      
      // Get auth token from localStorage
      const accessToken = localStorage.getItem('accessToken');
      
      // Prepare headers with authentication
      const headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Origin': window.location.origin
      };
      
      // Add cache control headers if forcing refresh
      if (forceRefresh) {
        headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
        headers['Pragma'] = 'no-cache';
        headers['X-Force-Refresh'] = 'true';
      }
      
      // Add authorization header if token exists
      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
        console.log('Using authentication token for request');
      }

      // Determine the API URL - try to use environment variable if available
      const apiUrl = process.env.REACT_APP_API_URL || window.location.origin + '/api';
      
      // Add timestamp to bust cache if forcing refresh
      const endpoint = forceRefresh 
        ? `${apiUrl}/all-strains?_=${Date.now()}`
        : `${apiUrl}/all-strains`;
      
      console.log(`Making request to: ${endpoint}`);
      
      const response = await fetch(endpoint, {
        method: 'GET',
        signal: controller.signal,
        headers: headers,
        credentials: 'include' // Include cookies if they exist
      });
      
      clearTimeout(timeoutId);
      
      // Check if the response is ok
      if (!response.ok) {
        console.error('API response not OK:', response.status, response.statusText);
        throw new Error(`API responded with status: ${response.status}`);
      }
      
      // Parse the response
      const data = await response.json();
      
      // Cache the data (unless forcing refresh)
      if (!forceRefresh) {
        try {
          localStorage.setItem('strain_data_cache', JSON.stringify(data));
          localStorage.setItem('strain_data_timestamp', Date.now().toString());
          console.log('Strain data cached successfully');
        } catch (cacheError) {
          console.warn('Failed to cache strain data:', cacheError);
        }
      }
      
      return data;
    } catch (error) {
      console.error(`Error fetching strains (attempt ${retryCount + 1}):`, error);
      
      // Increment retry count
      retryCount++;
      
      // Wait before retrying (exponential backoff)
      if (retryCount < MAX_RETRIES) {
        const waitTime = Math.pow(2, retryCount) * 1000; // 2s, 4s, 8s
        console.log(`Retrying in ${waitTime/1000} seconds...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }
  
  // If all retries fail, try to return cached data if available (even if it's old)
  try {
    const cachedData = localStorage.getItem('strain_data_cache');
    if (cachedData) {
      console.warn('Using stale cached data after failed API requests');
      return JSON.parse(cachedData);
    }
  } catch (error) {
    console.error('Failed to retrieve cached data:', error);
  }
  
  // Return empty fallback data structure if everything fails
  return getFallbackData();
};

/**
 * Returns empty structured object as fallback when no data is available
 * @returns {Object} Empty structured object
 */
const getFallbackData = () => {
  console.warn('Using empty fallback data');
  
  return {
    normal_strains: [],
    greenhouse_strains: [],
    exotic_tunnel_strains: [],
    indoor_strains: [],
    medical_strains: [],
    pre_rolled: [],
    extracts_vapes: [],
    edibles: [],
    weekly_special: []
  };
};

/**
 * Clears all strain-related cache from localStorage
 * @returns {Object} Result of the operation
 */
const clearStrainDataCache = () => {
  try {
    // Find and clear all strain-related cache
    const keysToRemove = [];
    
    // Main strain data cache
    keysToRemove.push('strain_data_cache', 'strain_data_timestamp');
    
    // Category-specific cache
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (
        key.startsWith('category-') || 
        key.startsWith('weeklyspecials_tag-') ||
        key.includes('-timestamp')
      )) {
        keysToRemove.push(key);
      }
    }
    
    // Remove all identified keys
    keysToRemove.forEach(key => localStorage.removeItem(key));
    
    console.log(`Cleared ${keysToRemove.length} cached items`);
    
    return {
      success: true,
      count: keysToRemove.length,
      message: `Cleared ${keysToRemove.length} cached items`
    };
  } catch (error) {
    console.error('Failed to clear cache:', error);
    return {
      success: false,
      error: error.message,
      message: 'Failed to clear cache'
    };
  }
};

// For backward compatibility, set default export for existing imports
const StrainDataService = {
  fetchAllStrains,
  clearStrainDataCache
};

export default StrainDataService;

// For new code, also export functions individually
export { fetchAllStrains, clearStrainDataCache };
