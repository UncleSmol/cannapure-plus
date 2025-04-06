/**
 * Utility functions for processing strain data
 */

// For debugging purposes
const DEBUG_MODE = true;

/**
 * Processes API response that has { data: [...], metadata: {...} } structure
 * @param {Object} response - API response object
 * @returns {Object} - Processed strain data organized by category
 */
export const processApiResponse = (response) => {
  if (!response || !response.data || !Array.isArray(response.data)) {
    console.error('Invalid API response format:', response);
    return {};
  }

  return processRawData(response.data);
};

/**
 * Process raw strain data array and categorize it
 * @param {Array|Object} strains - Array of strain objects or pre-categorized object
 * @returns {Object} - Strains organized by category
 */
export const processRawData = (strains) => {
  // If input is already categorized, validate and return it
  if (strains && typeof strains === 'object' && !Array.isArray(strains)) {
    const hasValidCategories = Object.values(strains).every(category => 
      Array.isArray(category)
    );
    if (hasValidCategories) {
      return strains;
    }
  }

  // If input is not an array or is empty, log error and return empty categories
  if (!Array.isArray(strains)) {
    console.error('Invalid strains data:', strains);
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
  }

  if (DEBUG_MODE) {
    // Log unique categories found in data
    const categories = [...new Set(strains.map(s => s.category))];
    console.log('Unique categories in data:', categories);
  }

  // Create a case-insensitive test function for more flexible matching
  const categoryMatches = (strain, patterns) => {
    if (!strain || !strain.category) return false;
    
    const category = strain.category.toLowerCase();
    return patterns.some(pattern => category.includes(pattern.toLowerCase()));
  };
  
  // Organize strains by category - with better pattern matching
  const result = {
    normal_strains: strains.filter(strain => 
      categoryMatches(strain, ['normal'])
    ),
    greenhouse_strains: strains.filter(strain => 
      categoryMatches(strain, ['greenhouse', 'green house'])
    ),
    exotic_tunnel_strains: strains.filter(strain => 
      categoryMatches(strain, ['exotic', 'tunnel'])
    ),
    indoor_strains: strains.filter(strain => 
      categoryMatches(strain, ['indoor'])
    ),
    medical_strains: strains.filter(strain => 
      categoryMatches(strain, ['medical', 'medicinal'])
    ),
    pre_rolled: strains.filter(strain => 
      categoryMatches(strain, ['prerolled', 'pre_rolled', 'pre-rolled', 'pre rolled'])
    ),
    extracts_vapes: strains.filter(strain => 
      categoryMatches(strain, ['extract', 'extracts', 'vape', 'vapes', 'concentrate'])
    ),
    edibles: strains.filter(strain => 
      categoryMatches(strain, ['edible', 'edibles', 'food', 'infused'])
    ),
  };
  
  // Handle weekly specials - either from a dedicated category or based on the 'special' flag
  result.weekly_special = strains.filter(strain => 
    categoryMatches(strain, ['weekly', 'special', 'weekly_special', 'weekly special']) || 
    strain.special === true || 
    strain.special === 1 ||
    strain.isSpecial === true
  );
  
  // Debug: log any uncategorized strains for admin review
  if (DEBUG_MODE) {
    const allCategorized = [].concat(...Object.values(result));
    const categorizedIds = new Set(allCategorized.map(s => s.id));
    const uncategorized = strains.filter(s => !categorizedIds.has(s.id));
    
    if (uncategorized.length > 0) {
      console.log('Found uncategorized strains:', uncategorized);
    }
  }
  
  return result;
};

/**
 * Generate placeholder data for loading states
 * @param {string} type - Type identifier for placeholder
 * @param {string} store - Store filter value
 * @returns {Array|null} - Array with placeholder data or null
 */
export const getPlaceholderData = (type, store, isLoading) => {
  if (isLoading) {
    return [{
      id: `loading-placeholder-${type}`,
      strain_name: 'Loading...',
      strain_type: '',
      image_url: null,
      description: 'Finding strains in your area'
    }];
  }
  
  if (!store || store === 'ALL') {
    return [{
      id: `pick-store-placeholder-${type}`,
      strain_name: 'Pick a Store',
      strain_type: '',
      image_url: null,
      description: 'Select a store to view available strains'
    }];
  }
  
  return null;
};

/**
 * Get strains for a specific category with store filtering
 * @param {Object} allStrains - All strain data organized by category
 * @param {string} categoryId - Category ID to filter for
 * @param {string} store - Store filter value
 * @param {boolean} isLoading - Loading state flag
 * @returns {Array} - Filtered strains for the category and store
 */
export const getCategoryStrains = (allStrains, categoryId, store, isLoading) => {
  // Return placeholder data if needed
  const placeholderData = getPlaceholderData(categoryId, store, isLoading);
  if (placeholderData) return placeholderData;
  
  // If no strains, return empty array
  if (!allStrains || !allStrains[categoryId] || !Array.isArray(allStrains[categoryId])) {
    if (DEBUG_MODE) {
      console.log(`No strains found for category ${categoryId}`);
    }
    return [];
  }
  
  // If no store filter or 'ALL' is selected, return all strains in this category
  if (!store || store === 'ALL' || store === '') {
    return allStrains[categoryId];
  }
  
  // Case-insensitive store location filtering
  const categoryStrains = allStrains[categoryId].filter(strain => {
    // Handle null/undefined store location
    if (!strain.store_location) return false;
    
    // Case-insensitive contains check
    return strain.store_location.toUpperCase().includes(store.toUpperCase());
  });
  
  // If no strains found for this store and category, return empty
  if (categoryStrains.length === 0) {
    if (DEBUG_MODE) {
      console.log(`No strains found for category ${categoryId} in store ${store}`);
    }
    return [];
  }
  
  return categoryStrains;
};

/**
 * Get weekly specials with store filtering
 * @param {Object} allStrains - All strain data organized by category
 * @param {string} store - Store filter value
 * @param {boolean} isLoading - Loading state flag
 * @returns {Array} - Filtered weekly specials
 */
export const getWeeklySpecials = (allStrains, store, isLoading) => {
  // Return placeholder data if needed
  const placeholderData = getPlaceholderData('weekly', store, isLoading);
  if (placeholderData) return placeholderData;

  // Safety check - if allStrains is null, undefined, or not an object, return empty array
  if (!allStrains || typeof allStrains !== 'object') {
    console.error('Invalid allStrains data:', allStrains);
    return [];
  }

  // Weekly specials from the weekly_special category
  let taggedSpecials = [];
  
  if (Array.isArray(allStrains.weekly_special)) {
    // Filter by store if a store is selected
    if (!store || store === 'ALL' || store === '') {
      taggedSpecials = allStrains.weekly_special;
    } else {
      taggedSpecials = allStrains.weekly_special.filter(strain => {
        if (!strain.store_location) return false;
        return strain.store_location.toUpperCase().includes(store.toUpperCase());
      });
    }
  }

  // If no dedicated specials, find items with special flag from other categories
  if (taggedSpecials.length === 0) {
    Object.entries(allStrains).forEach(([category, strains]) => {
      if (category !== 'weekly_special' && Array.isArray(strains)) {
        const specialStrains = strains.filter(strain => {
          // Check for special flag
          const isSpecial = strain.special === true || strain.special === 1 || strain.isSpecial === true;
          
          // Filter by store if needed
          if (!store || store === 'ALL' || store === '') {
            return isSpecial;
          } else {
            return isSpecial && strain.store_location && 
                   strain.store_location.toUpperCase().includes(store.toUpperCase());
          }
        });
        
        taggedSpecials = [...taggedSpecials, ...specialStrains];
      }
    });
  }

  // If still no specials, pick random items (only if store filter active)
  if (taggedSpecials.length === 0 && store && store !== 'ALL' && store !== '') {
    let randomSelections = [];
    
    // Get all strains for this store from each category
    Object.entries(allStrains).forEach(([category, strains]) => {
      if (category !== 'weekly_special' && Array.isArray(strains)) {
        const storeStrains = strains.filter(strain => 
          strain.store_location && 
          strain.store_location.toUpperCase().includes(store.toUpperCase())
        );
        
        // Pick up to 2 random strains from each category
        if (storeStrains.length > 0) {
          const randomStoreStrains = storeStrains
            .sort(() => Math.random() - 0.5)
            .slice(0, 2);
            
          randomSelections = [...randomSelections, ...randomStoreStrains];
        }
      }
    });
    
    taggedSpecials = randomSelections;
  }

  // Limit number of specials to display and ensure we return a valid array
  return Array.isArray(taggedSpecials) ? taggedSpecials.slice(0, 12) : [];
};