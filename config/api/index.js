// API modules export
const authAPI = require('./auth');
const strainsAPI = require('./strains');
const usersAPI = require('./users');

/**
 * API Configuration
 * Exports all API modules with Phase 3 caching integration
 */
module.exports = {
  auth: authAPI,
  strains: strainsAPI,
  users: usersAPI,
  
  // API version information
  version: process.env.API_VERSION || '1.0.0',
  
  // Cache configuration
  cache: {
    enabled: process.env.CACHE_ENABLED !== 'false',
    ttl: parseInt(process.env.CACHE_TTL || '3600', 10),
    refreshInterval: parseInt(process.env.CACHE_REFRESH_INTERVAL || '1800', 10)
  }
};
