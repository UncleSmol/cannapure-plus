/**
 * Cache Utility Functions
 * Provides utility functions for managing application cache
 */

/**
 * Clear all application cache stored in localStorage
 * @returns {Object} Result of the operation with details about what was cleared
 */
export const clearAllCache = () => {
  const result = {
    success: true,
    clearedItems: [],
    errors: []
  };

  try {
    // List of cache keys to clear
    const cacheKeys = [
      // Strain data cache
      'strain_data_cache',
      'strain_data_timestamp',
      
      // Add any other cache keys used in the application
      // 'user_preferences',
      // 'recent_views',
    ];
    
    cacheKeys.forEach(key => {
      try {
        if (localStorage.getItem(key) !== null) {
          localStorage.removeItem(key);
          result.clearedItems.push(key);
        }
      } catch (error) {
        result.errors.push({
          key,
          error: error.message
        });
      }
    });
    
    console.log(`Cache cleared: ${result.clearedItems.length} items removed`);
    
    // Set overall success based on whether there were any errors
    result.success = result.errors.length === 0;
    
    return result;
  } catch (error) {
    console.error('Error clearing cache:', error);
    return {
      success: false,
      clearedItems: result.clearedItems,
      errors: [...result.errors, { general: error.message }]
    };
  }
};

/**
 * Get information about all cache items
 * @returns {Object} Cache information including keys, sizes, and timestamps
 */
export const getCacheInfo = () => {
  const cacheInfo = {
    totalItems: 0,
    totalSizeBytes: 0,
    items: []
  };
  
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      const value = localStorage.getItem(key);
      const sizeBytes = new Blob([value]).size;
      
      cacheInfo.items.push({
        key,
        sizeBytes,
        sizeFormatted: formatBytes(sizeBytes),
        lastModified: key.includes('timestamp') ? new Date(parseInt(value)).toISOString() : 'unknown'
      });
      
      cacheInfo.totalItems++;
      cacheInfo.totalSizeBytes += sizeBytes;
    }
    
    cacheInfo.totalSizeFormatted = formatBytes(cacheInfo.totalSizeBytes);
    return cacheInfo;
  } catch (error) {
    console.error('Error getting cache info:', error);
    return {
      error: error.message,
      totalItems: 0,
      totalSizeBytes: 0,
      items: []
    };
  }
};

/**
 * Format bytes to a human-readable format
 * @param {number} bytes - The size in bytes
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted string (e.g., "1.5 KB")
 */
function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}
