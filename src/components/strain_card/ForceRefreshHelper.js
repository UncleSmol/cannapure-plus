import React from 'react';

/**
 * A simple component that adds a button to force clear cache and refresh data
 * Place this component at the top of your main page
 */
const ForceRefreshHelper = () => {
  const buttonStyle = {
    position: 'fixed',
    top: '10px',
    right: '10px',
    zIndex: 9999,
    padding: '8px 16px',
    background: '#f44336',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: 'bold',
    boxShadow: '0 2px 5px rgba(0,0,0,0.3)'
  };

  const clearCacheAndRefresh = () => {
    try {
      // List of cache items to clear
      const cacheKeys = [
        'strain_data_cache',
        'strain_data_timestamp'
      ];
      
      // Clear all cache items
      cacheKeys.forEach(key => {
        localStorage.removeItem(key);
      });
      
      console.log('Cache cleared successfully! Reloading page...');
      
      // Force reload from server (bypass cache)
      window.location.reload(true);
    } catch (error) {
      console.error('Error clearing cache:', error);
      alert('Failed to clear cache. Please try again or clear cache manually.');
    }
  };

  return (
    <button 
      style={buttonStyle} 
      onClick={clearCacheAndRefresh}
      title="Clear cache and reload data"
    >
      Force Refresh Data
    </button>
  );
};

export default ForceRefreshHelper;