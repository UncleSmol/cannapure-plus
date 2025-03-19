/**
 * Database utilities to support data freshness strategy
 */
const mysql = require('mysql2');
const API_VERSION = process.env.API_VERSION || '1.0.0';

// In-memory cache for query results
const queryCache = new Map();
let cacheHits = 0;
let cacheMisses = 0;

/**
 * Execute a database query with optional caching
 * @param {Object} db - Database connection pool
 * @param {string} sql - SQL query
 * @param {Array} params - Query parameters
 * @param {Object} options - Query options
 * @returns {Promise<Object>} - Query results with freshness metadata
 */
async function executeQuery(db, sql, params = [], options = {}) {
  const {
    useCache = false,
    ttl = 300000, // 5 minutes default
    forceRefresh = false
  } = options;
  
  // Generate cache key
  const cacheKey = generateCacheKey(sql, params);
  
  // Check cache if enabled and not forcing refresh
  if (useCache && !forceRefresh) {
    const cachedResult = queryCache.get(cacheKey);
    if (cachedResult && cachedResult.expires > Date.now()) {
      cacheHits++;
      console.log(`[DB] Cache hit for query: ${sql.substring(0, 50)}...`);
      return {
        ...cachedResult.data,
        metadata: {
          ...cachedResult.data.metadata,
          cache: {
            hit: true,
            generated: cachedResult.created,
            expires: new Date(cachedResult.expires).toISOString(),
            timeRemaining: Math.floor((cachedResult.expires - Date.now()) / 1000)
          }
        }
      };
    }
    cacheMisses++;
  }
  
  // Execute query
  try {
    console.log(`[DB] Executing query: ${sql.substring(0, 100)}...`);
    const [rows] = await db.execute(sql, params);
    
    // Add freshness metadata
    const now = new Date();
    const result = {
      data: rows,
      metadata: {
        timestamp: now.toISOString(),
        version: API_VERSION,
        freshness: {
          generated: now.toISOString(),
          ttl: ttl / 1000, // Convert to seconds for client
          expires: new Date(now.getTime() + ttl).toISOString()
        }
      }
    };
    
    // Cache result if caching is enabled
    if (useCache) {
      queryCache.set(cacheKey, {
        data: result,
        created: now.getTime(),
        expires: now.getTime() + ttl
      });
      console.log(`[DB] Cached query result with TTL: ${ttl/1000}s`);
    }
    
    return result;
  } catch (error) {
    console.error(`[DB] Query error: ${error.message}`);
    throw error;
  }
}

/**
 * Generate a cache key for a query
 * @param {string} sql - SQL query
 * @param {Array} params - Query parameters
 * @returns {string} - Cache key
 */
function generateCacheKey(sql, params) {
  return `${sql}:${JSON.stringify(params)}`;
}

/**
 * Clear the query cache
 * @param {string} pattern - Optional pattern to match cache keys
 * @returns {number} - Number of cache entries cleared
 */
function clearQueryCache(pattern = null) {
  if (!pattern) {
    const count = queryCache.size;
    queryCache.clear();
    console.log(`[DB] Cleared entire query cache (${count} entries)`);
    return count;
  }
  
  let count = 0;
  for (const key of queryCache.keys()) {
    if (key.includes(pattern)) {
      queryCache.delete(key);
      count++;
    }
  }
  
  console.log(`[DB] Cleared ${count} cache entries matching pattern: ${pattern}`);
  return count;
}

/**
 * Get cache statistics
 * @returns {Object} - Cache statistics
 */
function getCacheStats() {
  return {
    size: queryCache.size,
    hits: cacheHits,
    misses: cacheMisses,
    hitRatio: cacheHits + cacheMisses > 0 ? cacheHits / (cacheHits + cacheMisses) : 0
  };
}

module.exports = {
  executeQuery,
  clearQueryCache,
  getCacheStats
};