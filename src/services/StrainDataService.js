import ApiService from './ApiService';

class StrainDataService extends ApiService {
  constructor() {
    super();
    
    // Mock data for fallback
    this.mockStrains = [
      {
        id: 1,
        category: "weekly_special",
        strain_name: "Purple Haze Special",
        strain_type: "Sativa",
        price: 180,
        measurement: "3g",
        description: "Limited time offer! Energetic sativa with sweet berry notes",
        image_url: "https://images.pexels.com/photos/7584567/pexels-photo-7584567.jpeg",
        store_location: "WITBANK",
        thc: "THC: 22%",
        special: false
      },
      {
        id: 2,
        category: "weekly_special",
        strain_name: "OG Kush Deal",
        strain_type: "Hybrid",
        price: 220,
        measurement: "5g",
        description: "Weekend special! Classic hybrid with pine and citrus flavors",
        image_url: "https://images.pexels.com/photos/7584582/pexels-photo-7584582.jpeg",
        store_location: "DULLSTROOM",
        thc: "THC: 25%",
        special: false
      },
      {
        id: 3,
        category: "normal",
        strain_name: "Blue Dream",
        strain_type: "Hybrid",
        price: 150,
        measurement: "3g",
        description: "Sweet berry aroma with a balanced, full-body effect",
        image_url: "https://images.pexels.com/photos/7584582/pexels-photo-7584582.jpeg",
        store_location: "WITBANK",
        thc: "THC: 18%",
        special: false
      },
      {
        id: 4,
        category: "indoor",
        strain_name: "Wedding Cake",
        strain_type: "Indica",
        price: 280,
        measurement: "3g",
        description: "Premium indoor strain with sweet, earthy flavors",
        image_url: "https://images.pexels.com/photos/7584567/pexels-photo-7584567.jpeg",
        store_location: "DULLSTROOM",
        thc: "THC: 25%",
        special: true
      }
    ];
    
    // Get the API base URL from environment or use a default
    this.apiBaseUrl = process.env.REACT_APP_API_URL || this.getServerUrl();
    
    // Initialize cache for API responses
    this.cache = {};
    
    console.log('StrainDataService initialized with API URL:', this.apiBaseUrl);
  }
  
  // Get the server URL based on current window location
  getServerUrl() {
    // If we're in the browser, determine the server URL from the current window location
    if (typeof window !== 'undefined') {
      const protocol = window.location.protocol;
      const hostname = window.location.hostname;
      
      // If we're running on localhost:3000 (React dev server), use port 5000 for the API
      if (hostname === 'localhost' && window.location.port === '3000') {
        return `${protocol}//${hostname}:5000`;
      }
      
      // Otherwise, use the same origin as the current page
      return window.location.origin;
    }
    
    // Default fallback
    return 'http://localhost:5000';
  }
  
  // Get the full URL for an API endpoint
  getApiUrl(endpoint) {
    // Make sure endpoint starts with a slash
    if (!endpoint.startsWith('/')) {
      endpoint = '/' + endpoint;
    }
    
    return `${this.apiBaseUrl}${endpoint}`;
  }
  
  // Check if a response is HTML instead of JSON
  isHtmlResponse(data) {
    if (typeof data === 'string') {
      return data.trim().toLowerCase().startsWith('<!doctype html') || 
             data.trim().toLowerCase().startsWith('<html');
    }
    return false;
  }
  
  // Make an API request with error handling and caching
  async makeApiRequest(url, options = {}) {
    console.log(`Making API request to: ${url}`);
    
    // Generate a cache key based on the URL and options
    const cacheKey = `${url}-${JSON.stringify(options)}`;
    
    try {
      // Get token from localStorage if available
      const token = localStorage.getItem('token');
      
      // Set default headers if not provided
      const headers = options.headers || {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      };
      
      // Add authorization header if token exists
      if (token && !headers['Authorization']) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      // Make the fetch request
      const response = await fetch(url, {
        ...options,
        headers,
        // Don't use cache: 'no-cache' as we want to allow 304 responses
      });
      
      console.log(`API Response Status: ${response.status}`);
      
      // Handle 304 Not Modified responses
      if (response.status === 304) {
        console.log('Server returned 304 Not Modified, using cached data');
        
        // If we have cached data for this request, return it
        if (this.cache[cacheKey]) {
          return this.cache[cacheKey];
        }
        
        // If we don't have cached data, this is unexpected
        // Try to make a fresh request without If-None-Match header
        console.log('No cached data found for 304 response, making fresh request');
        
        const freshHeaders = { ...headers };
        delete freshHeaders['If-None-Match'];
        delete freshHeaders['If-Modified-Since'];
        
        return this.makeApiRequest(url, {
          ...options,
          headers: freshHeaders,
          cache: 'no-cache' // Force a fresh request
        });
      }
      
      // Check if response is OK (status in the range 200-299)
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      // Get the content type from the response headers
      const contentType = response.headers.get('content-type');
      
      // If content type indicates HTML, log an error
      if (contentType && contentType.includes('text/html')) {
        const text = await response.text();
        console.error('Received HTML response instead of JSON:', text.substring(0, 100) + '...');
        throw new Error('API returned HTML instead of JSON. Check your API routes.');
      }
      
      // Parse the JSON response
      const data = await response.json();
      
      // Cache the response data
      this.cache[cacheKey] = data;
      
      return data;
    } catch (error) {
      console.error('API request error:', error.message);
      
      // If we have cached data for this request, return it as a fallback
      if (this.cache[cacheKey]) {
        console.log('Using cached data as fallback after error');
        return this.cache[cacheKey];
      }
      
      throw error;
    }
  }
  
  // Get all strains with caching
  async fetchAllStrains() {
    try {
      // Check if we have cached strains data
      if (this.cache['allStrains']) {
        console.log('Using cached strains data');
        return this.cache['allStrains'];
      }
      
      // Based on server logs, the endpoint is /all-strains without the /api prefix
      const mainEndpoint = '/all-strains';
      console.log('Fetching strains from:', this.getApiUrl(mainEndpoint));
      
      try {
        const data = await this.makeApiRequest(this.getApiUrl(mainEndpoint), {
          // Explicitly set cache control headers to allow 304 responses
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Cache-Control': 'max-age=300' // Allow caching for 5 minutes
          }
        });
        
        console.log('Successfully fetched strains');
        
        // Cache the strains data
        this.cache['allStrains'] = data;
        
        return data;
      } catch (mainError) {
        console.error('Main endpoint failed:', mainError.message);
        
        // Try the test endpoint as fallback
        try {
          const testEndpoint = '/api/test/strains';
          console.log('Trying test endpoint:', this.getApiUrl(testEndpoint));
          
          const data = await this.makeApiRequest(this.getApiUrl(testEndpoint));
          console.log('Successfully fetched strains from test endpoint');
          
          // Cache the strains data
          this.cache['allStrains'] = data;
          
          return data;
        } catch (testError) {
          console.error('Test endpoint failed:', testError.message);
          console.log('Using mock strain data');
          
          // Cache the mock data
          this.cache['allStrains'] = this.mockStrains;
          
          return this.mockStrains;
        }
      }
    } catch (error) {
      console.error('Error fetching strains:', error.message);
      console.log('Using mock strain data');
      
      // Cache the mock data
      this.cache['allStrains'] = this.mockStrains;
      
      return this.mockStrains;
    }
  }
  
  // Force refresh strains data (bypass cache)
  async refreshStrains() {
    // Clear the strains cache
    delete this.cache['allStrains'];
    
    // Fetch fresh data
    return this.fetchAllStrains();
  }
  
  // Get strain by ID
  async fetchStrainById(id) {
    try {
      // Check if we have this strain cached
      const cacheKey = `strain-${id}`;
      if (this.cache[cacheKey]) {
        console.log(`Using cached data for strain ID: ${id}`);
        return this.cache[cacheKey];
      }
      
      // Try to find the strain in all strains
      const allStrains = await this.fetchAllStrains();
      const strain = allStrains.find(s => s.id === parseInt(id));
      
      if (strain) {
        // Cache the strain data
        this.cache[cacheKey] = strain;
        return strain;
      }
      
      // If not found, try to find it in mock data
      const mockStrain = this.mockStrains.find(s => s.id === parseInt(id));
      if (mockStrain) {
        console.log('Using mock strain data for ID:', id);
        // Cache the mock strain
        this.cache[cacheKey] = mockStrain;
        return mockStrain;
      }
      
      throw new Error(`Strain with ID ${id} not found`);
    } catch (error) {
      console.error(`Error fetching strain with ID ${id}:`, error.message);
      
      // Try to find the strain in mock data as fallback
      const mockStrain = this.mockStrains.find(s => s.id === parseInt(id));
      if (mockStrain) {
        console.log('Using mock strain data for ID:', id);
        return mockStrain;
      }
      
      throw error;
    }
  }
  
  // Get strains by category
  async getStrainsByCategory(category) {
    try {
      // Check if we have this category cached
      const cacheKey = `category-${category}`;
      if (this.cache[cacheKey]) {
        console.log(`Using cached data for category: ${category}`);
        return this.cache[cacheKey];
      }
      
      const allStrains = await this.fetchAllStrains();
      const categoryStrains = allStrains.filter(strain => strain.category === category);
      
      // Cache the category strains
      this.cache[cacheKey] = categoryStrains;
      
      return categoryStrains;
    } catch (error) {
      console.error(`Error fetching ${category} strains:`, error.message);
      const mockCategoryStrains = this.mockStrains.filter(strain => strain.category === category);
      
      // Cache the mock category strains
      this.cache[`category-${category}`] = mockCategoryStrains;
      
      return mockCategoryStrains;
    }
  }
  
  // Get strain by ID and category
  async getStrainById(id, category) {
    try {
      // Check if we have this strain cached
      const cacheKey = `strain-${category}-${id}`;
      if (this.cache[cacheKey]) {
        console.log(`Using cached data for strain ID: ${id} in category: ${category}`);
        return this.cache[cacheKey];
      }
      
      const categoryStrains = await this.getStrainsByCategory(category);
      const strain = categoryStrains.find(strain => strain.id === parseInt(id));
      
      if (strain) {
        // Cache the strain
        this.cache[cacheKey] = strain;
        return strain;
      }
      
      // If not found in the category, try to find it in mock data
      const mockStrain = this.mockStrains.find(s => 
        s.id === parseInt(id) && s.category === category);
      
      if (mockStrain) {
        // Cache the mock strain
        this.cache[cacheKey] = mockStrain;
        return mockStrain;
      }
      
      throw new Error(`Strain with ID ${id} in category ${category} not found`);
    } catch (error) {
      console.error(`Error fetching strain with ID ${id}:`, error.message);
      
      // Try to find the strain in mock data as fallback
      const mockStrain = this.mockStrains.find(strain => 
        strain.id === parseInt(id) && strain.category === category);
      
      if (mockStrain) {
        return mockStrain;
      }
      
      throw error;
    }
  }
  
  // Get user membership data
  async getUserMembership() {
    try {
      // Check if we have membership data cached
      if (this.cache['userMembership']) {
        console.log('Using cached membership data');
        return this.cache['userMembership'];
      }
      
      const endpoint = '/api/user/membership';
      console.log('Fetching user membership from:', this.getApiUrl(endpoint));
      
      const data = await this.makeApiRequest(this.getApiUrl(endpoint));
      console.log('Successfully fetched user membership');
      
      // Cache the membership data
      this.cache['userMembership'] = data;
      
      return data;
    } catch (error) {
      console.error('Error fetching user membership:', error.message);
      
      // Return mock membership data
      const mockMembership = {
        id: 999,
        firstName: "Guest",
        last_name: "User",
        cpNumber: "CP999999",
        membershipTier: "basic",
        activeDays: 0,
        expiryDate: null
      };
      
      // Cache the mock membership data
      this.cache['userMembership'] = mockMembership;
      
      return mockMembership;
    }
  }
  
  // Check API health
  async checkApiHealth() {
    try {
      const healthEndpoint = '/api/health';
      console.log('Checking API health:', this.getApiUrl(healthEndpoint));
      
      const data = await this.makeApiRequest(this.getApiUrl(healthEndpoint));
      console.log('API health check result:', data);
      
      return {
        isHealthy: data.status === 'ok',
        serverPort: data.serverPort,
        apiRoutes: data.apiRoutes
      };
    } catch (error) {
      console.error('API health check failed:', error.message);
      return {
        isHealthy: false,
        error: error.message
      };
    }
  }
  
  // Clear all cached data
  clearCache() {
    console.log('Clearing all cached data');
    this.cache = {};
  }
}

export default new StrainDataService();