/**
 * Strain Data Service
 * Handles fetching strain data from the API
 */

/**
 * Fetches all strains from the API with improved error handling and retry logic
 * @returns {Promise<Object>} Object containing categorized strain data
 */
const fetchAllStrains = async () => {
  // Number of retry attempts
  const MAX_RETRIES = 3;
  let retryCount = 0;
  let lastError = null;

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
      
      // Add authorization header if token exists
      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
        console.log('Using authentication token for request');
      } else {
        console.warn('No authentication token found, request may be rejected');
      }

      // Determine the API URL - try to use environment variable if available
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      const endpoint = `${apiUrl}/all-strains`;
      
      console.log(`Making request to: ${endpoint}`);
      
      const response = await fetch(endpoint, {
        method: 'GET',
        signal: controller.signal,
        headers: headers,
        credentials: 'include', // Include cookies if they exist
        mode: 'cors' // Explicitly request CORS mode
      });
      
      clearTimeout(timeoutId);
    
      // Log response status to help diagnose issues
      console.log('API Response Status:', response.status);
      
      // Check if the response is ok (status in the range 200-299)
      if (!response.ok) {
        console.error('API response not OK:', response.status, response.statusText);
        const errorText = await response.text();
        console.error('Error response:', errorText);
        
        // Handle authentication errors specifically
        if (response.status === 401) {
          console.error('Authentication error: You need to be logged in to access this data');
          // Redirect to login if desired
          // window.location.hash = "userAuthenticationPage";
          
          // Clear invalid token
          localStorage.removeItem('accessToken');
          
          throw new Error(`Authentication failed: ${response.status}`);
        }
        
        throw new Error(`API responded with status: ${response.status}`);
      }
    
      // For debugging, get the raw text first
      const rawText = await response.text();
      console.log('Raw API response:', rawText.substring(0, 200) + (rawText.length > 200 ? '...' : ''));
    
    // Only try to parse if we have content
    if (!rawText || rawText.trim() === '') {
      console.error('Empty response from API');
      return {};
    }
    
    // Try to parse the JSON
    let data;
    try {
      data = JSON.parse(rawText);
    } catch (parseError) {
      console.error('JSON parsing error:', parseError);
      console.error('Problematic JSON:', rawText.substring(0, 200));
      return {};
    }
    
    console.log('Data parsed successfully, sample:', data.slice(0, 2));
    
    // Ensure data is an array before filtering
    if (!Array.isArray(data)) {
      console.error('API did not return an array of strains:', typeof data);
      return {};
    }
    
    // Add IDs if they don't exist (using index as fallback)
    const dataWithIds = data.map((strain, index) => ({
      ...strain,
      id: strain.id || `strain-${index}` // Use existing ID or generate one
    }));

    // Get all strains with special = true across categories
    const weekly_specials_tag = dataWithIds.filter(strain => strain.special === true);

    // Organize remaining data by category
    const organizedData = {
      weekly_specials_tag: weekly_specials_tag,
      normal_strains: dataWithIds.filter(strain => strain.category === 'normal'),
      greenhouse_strains: dataWithIds.filter(strain => strain.category === 'greenhouse'),
      exotic_tunnel_strains: dataWithIds.filter(strain => strain.category === 'exotic'),
      indoor_strains: dataWithIds.filter(strain => strain.category === 'indoor'),
      medical_strains: dataWithIds.filter(strain => strain.category === 'medical'),
      pre_rolled: dataWithIds.filter(strain => strain.category === 'prerolled'),
      extracts_vapes: dataWithIds.filter(strain => strain.category === 'extracts'),
      edibles: dataWithIds.filter(strain => strain.category === 'edibles')
    };

    // Cache the data for offline use
    try {
      localStorage.setItem('strain_data_cache', JSON.stringify(organizedData));
      localStorage.setItem('strain_data_timestamp', Date.now().toString());
    } catch (cacheError) {
      console.warn('Failed to cache strain data:', cacheError);
    }

    return organizedData;
    } catch (error) {
      lastError = error;
      console.error(`Error fetching strains (attempt ${retryCount + 1}):`, error);
      
      // If this was an abort error (timeout), log it specifically
      if (error.name === 'AbortError') {
        console.error('Request timed out after 15 seconds');
      }
      
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
  
  // All retries failed, try to return cached data if available
  try {
    const cachedData = localStorage.getItem('strain_data_cache');
    const timestamp = localStorage.getItem('strain_data_timestamp');
    
    if (cachedData && timestamp) {
      const age = Date.now() - parseInt(timestamp);
      const ONE_DAY = 24 * 60 * 60 * 1000;
      
      if (age < ONE_DAY) {
        console.log('Returning cached strain data from', new Date(parseInt(timestamp)).toLocaleString());
        return JSON.parse(cachedData);
      }
    }
  } catch (cacheError) {
    console.error('Error retrieving cached data:', cacheError);
  }
  
  console.error(`All ${MAX_RETRIES} attempts to fetch strains failed:`, lastError);
  return {};
};

export { fetchAllStrains };

