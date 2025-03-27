
import ApiService from './ApiService';
import { api } from './api.service';

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
    
    // Initialize cache for API responses
    this.cache = {};
    
    console.log('StrainDataService initialized');
  }
  
  // Make an API request with error handling and caching
  async makeApiRequest(endpoint, options = {}) {
    console.log(`Making API request to: ${endpoint}`);
    
    // Ensure endpoint starts with a slash
    const formattedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    
    // Generate a cache key based on the endpoint and options
    const cacheKey = `${formattedEndpoint}-${JSON.stringify(options)}`;
    
    try {
      // Use the shared api instance from api.service.js
      const response = await api.request({
        url: formattedEndpoint,
        ...options,
        headers: {
          ...options.headers,
          'Accept': 'application/json' // Explicitly request JSON
        }
      });
      
      console.log(`API Response Status: ${response.status}`);
      
      // Log the data count for debugging
      if (response.data) {
        if (Array.isArray(response.data)) {
          console.log(`Received ${response.data.length} records`);
        } else if (typeof response.data === 'object') {
          // Handle structured response
          let totalCount = 0;
          for (const key in response.data) {
            if (Array.isArray(response.data[key])) {
              console.log(`Category ${key}: ${response.data[key].length} records`);
              totalCount += response.data[key].length;
            }
          }
          console.log(`Total records across all categories: ${totalCount}`);
        }
      }
      
      // Check if we received HTML instead of JSON
      const contentType = response.headers['content-type'];
      if (contentType && contentType.includes('text/html')) {
        console.error('Received HTML response instead of JSON. Request URL:', formattedEndpoint);
        throw new Error('Received HTML instead of expected JSON. Check API endpoint configuration.');
      }
      
      // Cache the response data
      this.cache[cacheKey] = response.data;
      
      return response.data;
    } catch (error) {
      console.error('API request error:', error.message);
      
      // If we received HTML, log a more helpful error
      if (error.response && error.response.headers['content-type']?.includes('text/html')) {
        console.error('API returned HTML instead of JSON. This typically indicates:');
        console.error('1. The API endpoint URL is incorrect');
        console.error('2. You are hitting a frontend route instead of API route');
        console.error('3. The server is not properly configured to serve JSON for this endpoint');
      }
      
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
      
      console.log('Fetching all strains');
      
      try {
        // Try the main strains endpoint with pagination parameters to get all records
        const data = await this.makeApiRequest('/strains?limit=200&page=1');
        
        console.log('Successfully fetched strains');
        
        // Cache the strains data
        this.cache['allStrains'] = data;
        
        return data;
      } catch (mainError) {
        console.error('Main endpoint failed:', mainError.message);
        
        // Try the test endpoint as fallback with pagination parameters
        try {
          console.log('Trying test endpoint with pagination');
            
          const data = await this.makeApiRequest('/test/strains?limit=200&page=1');
          console.log('Successfully fetched strains from test endpoint');
            
          // Cache the strains data
          this.cache['allStrains'] = data;
            
          return data;
        } catch (testError) {
          console.error('Test endpoint failed:', testError.message);
          console.log('Using mock strain data');
          
          // Create a structured mock data object that matches the expected format
          const structuredMockData = {
            normal_strains: this.mockStrains.filter(strain => strain.category === 'normal'),
            greenhouse_strains: this.mockStrains.filter(strain => strain.category === 'greenhouse'),
            exotic_tunnel_strains: this.mockStrains.filter(strain => strain.category === 'exotic_tunnel'),
            indoor_strains: this.mockStrains.filter(strain => strain.category === 'indoor'),
            medical_strains: this.mockStrains.filter(strain => strain.category === 'medical'),
            pre_rolled: this.mockStrains.filter(strain => strain.category === 'pre_rolled'),
            extracts_vapes: this.mockStrains.filter(strain => strain.category === 'extracts_vapes'),
            edibles: this.mockStrains.filter(strain => strain.category === 'edibles'),
            weekly_special: this.mockStrains.filter(strain => strain.category === 'weekly_special')
          };
          
          // Cache the structured mock data
          this.cache['allStrains'] = structuredMockData;
          
          return structuredMockData;
        }
      }
    } catch (error) {
      console.error('Error fetching strains:', error.message);
      console.log('Using mock strain data');
      
      // Create a structured mock data object as fallback
      const structuredMockData = {
        normal_strains: this.mockStrains.filter(strain => strain.category === 'normal'),
        greenhouse_strains: this.mockStrains.filter(strain => strain.category === 'greenhouse'),
        exotic_tunnel_strains: this.mockStrains.filter(strain => strain.category === 'exotic_tunnel'),
        indoor_strains: this.mockStrains.filter(strain => strain.category === 'indoor'),
        medical_strains: this.mockStrains.filter(strain => strain.category === 'medical'),
        pre_rolled: this.mockStrains.filter(strain => strain.category === 'pre_rolled'),
        extracts_vapes: this.mockStrains.filter(strain => strain.category === 'extracts_vapes'),
        edibles: this.mockStrains.filter(strain => strain.category === 'edibles'),
        weekly_special: this.mockStrains.filter(strain => strain.category === 'weekly_special')
      };
      
      // Cache the structured mock data
      this.cache['allStrains'] = structuredMockData;
      
      return structuredMockData;
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
      
      // Try to fetch the strain directly
      try {
        const data = await this.makeApiRequest(`/strains/${id}`);
        // Cache the strain data
        this.cache[cacheKey] = data;
        return data;
      } catch (directError) {
        console.error(`Direct fetch for strain ID ${id} failed:`, directError.message);
        
        // Try to find the strain in all strains
        const allStrains = await this.fetchAllStrains();
        let strain = null;
        
        // Search through all categories in the structured response
        for (const categoryKey in allStrains) {
          if (Array.isArray(allStrains[categoryKey])) {
            const foundStrain = allStrains[categoryKey].find(s => s.id === parseInt(id));
            if (foundStrain) {
              strain = foundStrain;
              break;
            }
          }
        }
        
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
      }
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
      
      // Try to fetch strains by category directly
      try {
        const data = await this.makeApiRequest(`/strains/category/${category}`);
        // Cache the category strains
        this.cache[cacheKey] = data;
        return data;
      } catch (directError) {
        console.error(`Direct fetch for category ${category} failed:`, directError.message);
        
        const allStrains = await this.fetchAllStrains();
      
        // Handle the new structured response format
        // Map category names to the property names in the response
        const categoryMapping = {
          'normal': 'normal_strains',
          'greenhouse': 'greenhouse_strains',
          'exotic_tunnel': 'exotic_tunnel_strains',
          'indoor': 'indoor_strains',
          'medical': 'medical_strains',
          'pre_rolled': 'pre_rolled',
          'extracts_vapes': 'extracts_vapes',
          'edibles': 'edibles',
          'weekly_special': 'weekly_special'
        };
        
        // Get the property name for this category
        const propertyName = categoryMapping[category] || category;
        
        // Check if the category exists in the response
        if (allStrains[propertyName]) {
          // Cache the category strains
          this.cache[cacheKey] = allStrains[propertyName];
          return allStrains[propertyName];
        }
        
        // Fallback to filtering if the category doesn't exist in the structured response
        // This is for backward compatibility
        let categoryStrains = [];
        
        // First try to find the category in the structured response
        Object.values(allStrains).forEach(strainArray => {
          if (Array.isArray(strainArray)) {
            const matchingStrains = strainArray.filter(strain => strain.category === category);
            categoryStrains = [...categoryStrains, ...matchingStrains];
          }
        });
        
        // If we found strains, return them
        if (categoryStrains.length > 0) {
          // Cache the category strains
          this.cache[cacheKey] = categoryStrains;
          return categoryStrains;
        }
        
        // Last resort: use mock data
        const mockCategoryStrains = this.mockStrains.filter(strain => strain.category === category);
        
        // Cache the mock category strains
        this.cache[cacheKey] = mockCategoryStrains;
        
        return mockCategoryStrains;
      }
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
      
      // If not found in the category, try to find it in all strains
      const allStrains = await this.fetchAllStrains();
      
      // Map category names to the property names in the response
      const categoryMapping = {
        'normal': 'normal_strains',
        'greenhouse': 'greenhouse_strains',
        'exotic_tunnel': 'exotic_tunnel_strains',
        'indoor': 'indoor_strains',
        'medical': 'medical_strains',
        'pre_rolled': 'pre_rolled',
        'extracts_vapes': 'extracts_vapes',
        'edibles': 'edibles',
        'weekly_special': 'weekly_special'
      };
      
      // Get the property name for this category
      const propertyName = categoryMapping[category] || category;
      
      // Check if the category exists in the response and search for the strain
      if (allStrains[propertyName]) {
        const foundStrain = allStrains[propertyName].find(s => s.id === parseInt(id));
        if (foundStrain) {
          // Cache the strain
          this.cache[cacheKey] = foundStrain;
          return foundStrain;
        }
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
      
      console.log('Fetching user membership');
      
      const data = await this.makeApiRequest('/user/membership');
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
      console.log('Checking API health');
      
      const data = await this.makeApiRequest('/health');
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

// Create an instance of the service
const strainDataServiceInstance = new StrainDataService();

// Export the instance as the default export
export default strainDataServiceInstance;
