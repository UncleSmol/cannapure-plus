/**
 * Cache Middleware
 * Caches API responses for GET requests
 */
const { createLogger } = require('../utils/logger');

const logger = createLogger('CACHE_MIDDLEWARE');

/**
 * Create a middleware for caching API responses
 * @param {Object} options - Cache configuration options
 * @returns {Function} Express middleware
 */
const cacheMiddleware = (options = {}) => {
  const {
    ttl = 300, // 5 minutes default
    keyPrefix = 'api',
    customKey = null // Function to generate custom cache key
  } = options;

  return (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // For now, this is a simple implementation that just adds headers
    // In a real implementation, this would check cache and return cached responses
    res.setHeader('X-Cache-TTL', ttl);
    res.setHeader('X-Cache-Prefix', keyPrefix);
    
    // Log cache attempt
    logger.debug(`Cache middleware applied to ${req.originalUrl} with TTL: ${ttl}`);
    
    // Continue to the next middleware
    next();
  };
};

/**
 * Helper function to cache a response
 * @param {Object} options - Cache configuration options
 * @returns {Function} Express middleware
 */
const cacheResponse = (options = {}) => {
  return cacheMiddleware(options);
};

module.exports = {
  cacheMiddleware,
  cacheResponse
};
