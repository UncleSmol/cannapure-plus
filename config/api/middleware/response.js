/**
 * API Response Middleware
 * Adds cache headers and version information to API responses
 */

// Configuration
const DEFAULT_CACHE_MAX_AGE = process.env.API_CACHE_MAX_AGE || 300; // 5 minutes in seconds
const API_VERSION = process.env.API_VERSION || '1.0.0';
const ENVIRONMENT = process.env.NODE_ENV || 'development';

// Generate a unique ETag based on response data
function generateETag(data) {
  if (!data) return null;
  
  // Simple hash function for demo purposes
  // In production, use a proper hashing algorithm
  let hash = 0;
  const str = JSON.stringify(data);
  
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  return `W/"${hash.toString(16)}"`;
}

/**
 * Middleware to add cache headers to API responses
 * @param {Object} options - Configuration options
 * @returns {Function} Express middleware
 */
function addCacheHeaders(options = {}) {
  const {
    maxAge = DEFAULT_CACHE_MAX_AGE,
    includeETag = true,
    varyByQueryParams = true,
    varyByAccept = true,
    publicCache = false
  } = options;
  
  return (req, res, next) => {
    // Store the original res.json method
    const originalJson = res.json;
    
    // Override res.json to add cache headers before sending response
    res.json = function(data) {
      // Skip cache headers for errors
      if (res.statusCode >= 400) {
        return originalJson.call(this, data);
      }
      
      // Add API version header
      res.setHeader('X-API-Version', API_VERSION);
      
      // Add timestamp header
      res.setHeader('X-Response-Time', new Date().toISOString());
      
      // Add cache control headers
      const cacheControl = [];
      
      if (publicCache) {
        cacheControl.push('public');
      } else {
        cacheControl.push('private');
      }
      
      cacheControl.push(`max-age=${maxAge}`);
      
      // Add stale-while-revalidate directive for better performance
      cacheControl.push(`stale-while-revalidate=${Math.floor(maxAge / 2)}`);
      
      res.setHeader('Cache-Control', cacheControl.join(', '));
      
      // Add Last-Modified header
      res.setHeader('Last-Modified', new Date().toISOString());
      
      // Add Vary header for proper cache differentiation
      const varyHeaders = [];
      
      if (varyByQueryParams) {
        varyHeaders.push('Accept-Encoding');
      }
      
      if (varyByAccept) {
        varyHeaders.push('Accept');
      }
      
      if (varyHeaders.length > 0) {
        res.setHeader('Vary', varyHeaders.join(', '));
      }
      
      // Add ETag for conditional requests
      if (includeETag) {
        const etag = generateETag(data);
        if (etag) {
          res.setHeader('ETag', etag);
          
          // Check If-None-Match header for conditional requests
          const ifNoneMatch = req.headers['if-none-match'];
          if (ifNoneMatch && ifNoneMatch === etag) {
            console.log(`[API] Returning 304 Not Modified for ${req.path}`);
            return res.status(304).end();
          }
        }
      }
      
      // Add data freshness metadata to the response
      if (data && typeof data === 'object') {
        // Add metadata without modifying the original data structure
        if (!data.metadata) {
          data.metadata = {
            timestamp: new Date().toISOString(),
            version: API_VERSION,
            freshness: {
              generated: new Date().toISOString(),
              ttl: maxAge,
              expires: new Date(Date.now() + (maxAge * 1000)).toISOString()
            }
          };
        }
      }
      
      // Log cache headers
      console.log(`[API CACHE] Adding cache headers to ${req.method} ${req.path}:`, {
        'Cache-Control': cacheControl.join(', '),
        'Last-Modified': res.getHeader('Last-Modified'),
        'ETag': res.getHeader('ETag'),
        'Vary': res.getHeader('Vary')
      });
      
      // Call the original json method
      return originalJson.call(this, data);
    };
    
    next();
  };
}

/**
 * Middleware to handle conditional requests
 * @returns {Function} Express middleware
 */
function handleConditionalRequests() {
  return (req, res, next) => {
    // Store the original send method
    const originalSend = res.send;
    
    // Override send to handle conditional requests
    res.send = function(body) {
      // Check If-Modified-Since header
      const ifModifiedSince = req.headers['if-modified-since'];
      if (ifModifiedSince) {
        const modifiedSince = new Date(ifModifiedSince);
        const now = new Date();
        
        // If the request was made less than maxAge seconds ago, return 304
        if (now - modifiedSince < (DEFAULT_CACHE_MAX_AGE * 1000)) {
          console.log(`[API] Returning 304 Not Modified for ${req.path} (If-Modified-Since)`);
          return res.status(304).end();
        }
      }
      
      // Call the original send method
      return originalSend.call(this, body);
    };
    
    next();
  };
}

/**
 * Middleware to add forced refresh capability
 * @returns {Function} Express middleware
 */
function allowForcedRefresh() {
  return (req, res, next) => {
    // Check for force refresh header or query parameter
    const forceRefresh = req.headers['x-force-refresh'] === 'true' || 
                         req.query.forceRefresh === 'true';
    
    if (forceRefresh) {
      console.log(`[API] Force refresh requested for ${req.path}`);
      
      // Add a property to the request object
      req.forceRefresh = true;
      
      // Add no-cache headers to the response
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
    }
    
    next();
  };
}

module.exports = {
  addCacheHeaders,
  handleConditionalRequests,
  allowForcedRefresh
};