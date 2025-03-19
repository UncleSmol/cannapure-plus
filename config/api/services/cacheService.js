/**
 * Advanced Cache Service
 * Implements Phase 3 of the Data Freshness Strategy
 */
const NodeCache = require('node-cache');
const schedule = require('node-schedule');
const EventEmitter = require('events');
const db = require('../../database');

// Cache events
class CacheEvents extends EventEmitter {}
const cacheEvents = new CacheEvents();

// Create cache instance with standard TTL and check period
const cache = new NodeCache({
  stdTTL: process.env.CACHE_DEFAULT_TTL || 300, // 5 minutes in seconds
  checkperiod: process.env.CACHE_CHECK_PERIOD || 60, // Check for expired keys every 60 seconds
  useClones: false, // Don't clone objects (for performance)
  deleteOnExpire: true // Delete keys when they expire
});

// Cache statistics
const stats = {
  hits: 0,
  misses: 0,
  sets: 0,
  deletes: 0,
  refreshes: 0,
  lastReset: Date.now(),
  backgroundJobs: 0,
  invalidations: {
    manual: 0,
    automatic: 0,
    targeted: 0
  }
};

// Cache dependencies tracking
const dependencies = new Map();

// Background refresh jobs
const refreshJobs = new Map();

/**
 * Get an item from the cache
 * @param {string} key - Cache key
 * @param {Function} fetchFunction - Function to fetch data if not in cache
 * @param {Object} options - Cache options
 * @returns {Promise<*>} - Cached or fetched data
 */
async function get(key, fetchFunction, options = {}) {
  const {
    ttl = process.env.CACHE_DEFAULT_TTL || 300,
    forceRefresh = false,
    namespace = 'default',
    dependencies = [],
    backgroundRefresh = false,
    refreshThreshold = 0.8 // Refresh when 80% of TTL has passed
  } = options;

  // Create namespaced key
  const namespacedKey = `${namespace}:${key}`;
  
  // Check if force refresh is requested
  if (forceRefresh) {
    console.log(`[CACHE] Force refresh requested for key: ${namespacedKey}`);
    return refreshCache(namespacedKey, fetchFunction, options);
  }
  
  // Try to get from cache
  const cachedItem = cache.get(namespacedKey);
  
  if (cachedItem) {
    stats.hits++;
    console.log(`[CACHE] Hit for key: ${namespacedKey}`);
    
    // Check if we should refresh in background
    if (backgroundRefresh) {
      const now = Date.now();
      const expiresAt = cachedItem.metadata.expiresAt;
      const timeUntilExpiry = expiresAt - now;
      const ttlMs = ttl * 1000;
      
      // If we're past the refresh threshold, refresh in background
      if (timeUntilExpiry < ttlMs * (1 - refreshThreshold)) {
        console.log(`[CACHE] Background refresh triggered for key: ${namespacedKey}`);
        refreshInBackground(namespacedKey, fetchFunction, options);
      }
    }
    
    return cachedItem;
  }
  
  stats.misses++;
  console.log(`[CACHE] Miss for key: ${namespacedKey}`);
  
  // Not in cache, fetch and store
  return refreshCache(namespacedKey, fetchFunction, options);
}

/**
 * Refresh cache for a specific key
 * @param {string} key - Cache key
 * @param {Function} fetchFunction - Function to fetch data
 * @param {Object} options - Cache options
 * @returns {Promise<*>} - Fetched data
 */
async function refreshCache(key, fetchFunction, options = {}) {
  const {
    ttl = process.env.CACHE_DEFAULT_TTL || 300,
    dependencies = []
  } = options;
  
  try {
    console.log(`[CACHE] Fetching fresh data for key: ${key}`);
    const data = await fetchFunction();
    
    // Add metadata
    const now = Date.now();
    const result = {
      data,
      metadata: {
        cachedAt: now,
        expiresAt: now + (ttl * 1000),
        ttl,
        refreshCount: 0
      }
    };
    
    // Store in cache
    cache.set(key, result, ttl);
    stats.sets++;
    
    // Register dependencies
    if (dependencies.length > 0) {
      registerDependencies(key, dependencies);
    }
    
    return result;
  } catch (error) {
    console.error(`[CACHE] Error refreshing cache for key: ${key}`, error);
    throw error;
  }
}

/**
 * Refresh cache in background
 * @param {string} key - Cache key
 * @param {Function} fetchFunction - Function to fetch data
 * @param {Object} options - Cache options
 */
async function refreshInBackground(key, fetchFunction, options = {}) {
  // Don't wait for the result
  setTimeout(async () => {
    try {
      stats.refreshes++;
      stats.backgroundJobs++;
      
      // Get current cached item
      const cachedItem = cache.get(key);
      
      // Fetch fresh data
      const data = await fetchFunction();
      
      // Update metadata
      const now = Date.now();
      const result = {
        data,
        metadata: {
          cachedAt: now,
          expiresAt: now + (options.ttl * 1000),
          ttl: options.ttl,
          refreshCount: cachedItem ? cachedItem.metadata.refreshCount + 1 : 0,
          previousCachedAt: cachedItem ? cachedItem.metadata.cachedAt : null
        }
      };
      
      // Store in cache
      cache.set(key, result, options.ttl);
      
      console.log(`[CACHE] Background refresh completed for key: ${key}`);
      
      // Emit event
      cacheEvents.emit('backgroundRefresh', { key, result });
    } catch (error) {
      console.error(`[CACHE] Background refresh error for key: ${key}`, error);
    }
  }, 0);
}

/**
 * Register dependencies between cache keys
 * @param {string} key - Cache key
 * @param {Array<string>} deps - Dependencies
 */
function registerDependencies(key, deps) {
  deps.forEach(dep => {
    if (!dependencies.has(dep)) {
      dependencies.set(dep, new Set());
    }
    dependencies.get(dep).add(key);
  });
  
  console.log(`[CACHE] Registered dependencies for key: ${key}`, deps);
}

/**
 * Invalidate cache for a specific key and its dependents
 * @param {string} key - Cache key or pattern
 * @param {Object} options - Invalidation options
 * @returns {number} - Number of invalidated keys
 */
function invalidate(key, options = {}) {
  const {
    namespace = 'default',
    isPattern = false,
    cascade = true,
    source = 'manual'
  } = options;
  
  let count = 0;
  
  // Handle pattern invalidation
  if (isPattern) {
    const keys = cache.keys();
    const pattern = new RegExp(key);
    
    keys.forEach(k => {
      if (pattern.test(k)) {
        cache.del(k);
        count++;
        
        // Invalidate dependencies if cascade is true
        if (cascade && dependencies.has(k)) {
          const deps = dependencies.get(k);
          deps.forEach(dep => {
            cache.del(dep);
            count++;
          });
          // Clear dependencies
          dependencies.delete(k);
        }
      }
    });
  } else {
    // Handle specific key invalidation
    const namespacedKey = `${namespace}:${key}`;
    
    if (cache.has(namespacedKey)) {
      cache.del(namespacedKey);
      count++;
      
      // Invalidate dependencies if cascade is true
      if (cascade && dependencies.has(namespacedKey)) {
        const deps = dependencies.get(namespacedKey);
        deps.forEach(dep => {
          cache.del(dep);
          count++;
        });
        // Clear dependencies
        dependencies.delete(namespacedKey);
      }
    }
  }
  
  // Update stats
  if (source === 'manual') {
    stats.invalidations.manual += count;
  } else if (source === 'automatic') {
    stats.invalidations.automatic += count;
  } else if (source === 'targeted') {
    stats.invalidations.targeted += count;
  }
  
  stats.deletes += count;
  
  console.log(`[CACHE] Invalidated ${count} keys with source: ${source}`);
  
  // Emit event
  cacheEvents.emit('invalidate', { key, count, source });
  
  return count;
}

/**
 * Schedule a recurring cache refresh job
 * @param {string} key - Cache key
 * @param {Function} fetchFunction - Function to fetch data
 * @param {Object} options - Schedule options
 * @returns {string} - Job ID
 */
function scheduleRefresh(key, fetchFunction, options = {}) {
  const {
    namespace = 'default',
    cronExpression = '*/15 * * * *', // Every 15 minutes by default
    ttl = process.env.CACHE_DEFAULT_TTL || 300,
    dependencies = []
  } = options;
  
  const namespacedKey = `${namespace}:${key}`;
  const jobId = `refresh_${namespacedKey}`;
  
  // Cancel existing job if any
  if (refreshJobs.has(jobId)) {
    refreshJobs.get(jobId).cancel();
  }
  
  // Schedule new job
  const job = schedule.scheduleJob(cronExpression, async () => {
    try {
      console.log(`[CACHE] Scheduled refresh for key: ${namespacedKey}`);
      stats.backgroundJobs++;
      
      // Fetch fresh data
      const data = await fetchFunction();
      
      // Get current cached item
      const cachedItem = cache.get(namespacedKey);
      
      // Update metadata
      const now = Date.now();
      const result = {
        data,
        metadata: {
          cachedAt: now,
          expiresAt: now + (ttl * 1000),
          ttl,
          refreshCount: cachedItem ? cachedItem.metadata.refreshCount + 1 : 0,
          previousCachedAt: cachedItem ? cachedItem.metadata.cachedAt : null,
          refreshType: 'scheduled'
        }
      };
      
      // Store in cache
      cache.set(namespacedKey, result, ttl);
      
      // Register dependencies
      if (dependencies.length > 0) {
        registerDependencies(namespacedKey, dependencies);
      }
      
      console.log(`[CACHE] Scheduled refresh completed for key: ${namespacedKey}`);
      
      // Emit event
      cacheEvents.emit('scheduledRefresh', { key: namespacedKey, result });
    } catch (error) {
      console.error(`[CACHE] Scheduled refresh error for key: ${namespacedKey}`, error);
    }
  });
  
  // Store job reference
  refreshJobs.set(jobId, job);
  
  console.log(`[CACHE] Scheduled refresh job for key: ${namespacedKey} with cron: ${cronExpression}`);
  
  return jobId;
}

/**
 * Cancel a scheduled refresh job
 * @param {string} jobId - Job ID
 * @returns {boolean} - Success status
 */
function cancelScheduledRefresh(jobId) {
  if (refreshJobs.has(jobId)) {
    refreshJobs.get(jobId).cancel();
    refreshJobs.delete(jobId);
    console.log(`[CACHE] Cancelled scheduled refresh job: ${jobId}`);
    return true;
  }
  return false;
}

/**
 * Get cache statistics
 * @returns {Object} - Cache statistics
 */
function getStats() {
  const cacheStats = cache.getStats();
  
  return {
    ...stats,
    keys: cache.keys().length,
    memory: cacheStats.ksize,
    vsize: cacheStats.vsize,
    hitRatio: stats.hits + stats.misses > 0 ? stats.hits / (stats.hits + stats.misses) : 0,
    uptime: Date.now() - stats.lastReset,
    activeJobs: refreshJobs.size
  };
}

/**
 * Reset cache statistics
 */
function resetStats() {
  stats.hits = 0;
  stats.misses = 0;
  stats.sets = 0;
  stats.deletes = 0;
  stats.refreshes = 0;
  stats.lastReset = Date.now();
  stats.backgroundJobs = 0;
  stats.invalidations = {
    manual: 0,
    automatic: 0,
    targeted: 0
  };
  
  console.log('[CACHE] Statistics reset');
}

/**
 * Clear the entire cache
 * @returns {number} - Number of cleared keys
 */
function clear() {
  const count = cache.keys().length;
  cache.flushAll();
  dependencies.clear();
  
  stats.deletes += count;
  
  console.log(`[CACHE] Cleared entire cache (${count} keys)`);
  
  // Emit event
  cacheEvents.emit('clear', { count });
  
  return count;
}

/**
 * Setup cache invalidation triggers for database changes
 */
function setupInvalidationTriggers() {
  // Listen for database changes
  db.on('change', (data) => {
    const { table, operation, id } = data;
    
    console.log(`[CACHE] Database change detected: ${operation} on ${table} with ID ${id}`);
    
    // Invalidate related cache entries
    if (table.includes('strains')) {
      // Invalidate specific strain
      invalidate(`strain:${id}`, { 
        namespace: 'strains',
        cascade: true,
        source: 'automatic'
      });
      
      // Invalidate strain lists
      invalidate('strains:list', {
        namespace: 'api',
        cascade: true,
        source: 'automatic'
      });
      
      // Invalidate specific strain type if available
      const strainType = table.replace('_strains', '');
      invalidate(`strains:${strainType}:list`, {
        namespace: 'api',
        cascade: true,
        source: 'automatic'
      });
    }
  });
  
  console.log('[CACHE] Setup invalidation triggers for database changes');
}

// Initialize cache service
function init() {
  // Setup invalidation triggers
  setupInvalidationTriggers();
  
  // Setup cache monitoring
  setInterval(() => {
    const stats = getStats();
    console.log('[CACHE] Statistics:', stats);
  }, process.env.CACHE_STATS_INTERVAL || 300000); // 5 minutes by default
  
  console.log('[CACHE] Service initialized');
  
  return {
    get,
    invalidate,
    scheduleRefresh,
    cancelScheduledRefresh,
    getStats,
    resetStats,
    clear,
    on: cacheEvents.on.bind(cacheEvents)
  };
}

module.exports = init();