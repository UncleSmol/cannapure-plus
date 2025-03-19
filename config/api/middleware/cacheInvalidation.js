/**
 * Cache Invalidation Middleware
 * Automatically invalidates cache entries when data is modified
 */
const cacheService = require('../services/cacheService');

/**
 * Middleware to invalidate cache on data mutations
 * @param {Object} options - Invalidation options
 * @returns {Function} - Express middleware
 */
function invalidateCache(options = {}) {
  const {
    resources = [],
    patterns = [],
    namespace = 'api'
  } = options;
  
  return (req, res, next) => {
    // Store the original methods
    const originalSend = res.send;
    const originalJson = res.json;
    const originalEnd = res.end;
    
    // Only handle POST, PUT, PATCH, DELETE methods
    if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
      return next();
    }
    
    // Function to invalidate cache after successful response
    const invalidateAfterResponse = () => {
      // Only invalidate on successful responses
      if (res.statusCode >= 200 && res.statusCode < 300) {
        console.log(`[CACHE] Invalidating cache for ${req.method} ${req.path}`);
        
        // Invalidate specific resources
        resources.forEach(resource => {
          const resourceId = req.params.id || (req.body && req.body.id);
          
          // If we have an ID, invalidate the specific resource
          if (resourceId) {
            cacheService.invalidate(`${resource}:${resourceId}`, {
              namespace,
              cascade: true,
              source: 'targeted'
            });
          }
          
          // Always invalidate the resource list
          cacheService.invalidate(`${resource}:list`, {
            namespace,
            cascade: true,
            source: 'targeted'
          });
        });
        
        // Invalidate by patterns
        patterns.forEach(pattern => {
          cacheService.invalidate(pattern, {
            namespace,
            isPattern: true,
            cascade: true,
            source: 'targeted'
          });
        });
      }
    };
    
    // Override res.send
    res.send = function(body) {
      invalidateAfterResponse();
      return originalSend.call(this, body);
    };
    
    // Override res.json
    res.json = function(body) {
      invalidateAfterResponse();
      return originalJson.call(this, body);
    };
    
    // Override res.end
    res.end = function(chunk, encoding) {
      invalidateAfterResponse();
      return originalEnd.call(this, chunk, encoding);
    };
    
    next();
  };
}

/**
 * Middleware to invalidate specific cache entries
 * @param {string} key - Cache key or pattern
 * @param {Object} options - Invalidation options
 * @returns {Function} - Express middleware
 */
function invalidateSpecific(key, options = {}) {
  return (req, res, next) => {
    // Store the original methods
    const originalSend = res.send;
    const originalJson = res.json;
    const originalEnd = res.end;
    
    // Function to invalidate cache after successful response
    const invalidateAfterResponse = () => {
      // Only invalidate on successful responses
      if (res.statusCode >= 200 && res.statusCode < 300) {
        console.log(`[CACHE] Invalidating specific cache for ${req.method} ${req.path}`);
        
        // Replace path parameters in the key
        let processedKey = key;
        Object.keys(req.params).forEach(param => {
          processedKey = processedKey.replace(`:${param}`, req.params[param]);
        });
        
        // Invalidate the specific key
        cacheService.invalidate(processedKey, {
          ...options,
          source: 'targeted'
        });
      }
    };
    
    // Override res.send
    res.send = function(body) {
      invalidateAfterResponse();
      return originalSend.call(this, body);
    };
    
    // Override res.json
    res.json = function(body) {
      invalidateAfterResponse();
      return originalJson.call(this, body);
    };
    
    // Override res.end
    res.end = function(chunk, encoding) {
      invalidateAfterResponse();
      return originalEnd.call(this, chunk, encoding);
    };
    
    next();
  };
}

module.exports = {
  invalidateCache,
  invalidateSpecific
};