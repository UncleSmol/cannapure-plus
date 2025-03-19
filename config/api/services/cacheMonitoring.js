/**
 * Cache Monitoring Service
 * Monitors cache performance, collects statistics, and provides insights
 */
const EventEmitter = require('events');
const cacheService = require('./cacheService');
const fs = require('fs').promises;
const path = require('path');

// Create event emitter for monitoring events
class MonitoringEvents extends EventEmitter {}
const monitoringEvents = new MonitoringEvents();

// Store historical statistics
const historySize = process.env.CACHE_HISTORY_SIZE || 100;
const statsHistory = [];
let lastAlertTime = 0;
const alertThrottleTime = process.env.CACHE_ALERT_THROTTLE || 300000; // 5 minutes

// Performance thresholds
const thresholds = {
  hitRatio: process.env.CACHE_HIT_RATIO_THRESHOLD || 0.7, // 70% hit ratio
  memoryUsage: process.env.CACHE_MEMORY_THRESHOLD || 100 * 1024 * 1024, // 100MB
  keysCount: process.env.CACHE_KEYS_THRESHOLD || 10000, // 10,000 keys
  responseTime: process.env.CACHE_RESPONSE_TIME_THRESHOLD || 200 // 200ms
};

// Store response time metrics
const responseTimeMetrics = {
  cached: {
    count: 0,
    total: 0,
    min: Infinity,
    max: 0
  },
  uncached: {
    count: 0,
    total: 0,
    min: Infinity,
    max: 0
  }
};

/**
 * Collect current cache statistics
 * @returns {Object} - Current cache statistics
 */
function collectStats() {
  const cacheStats = cacheService.getStats();
  const timestamp = Date.now();
  
  // Calculate memory usage
  const memoryUsage = process.memoryUsage();
  
  const stats = {
    timestamp,
    cache: cacheStats,
    system: {
      memory: {
        rss: memoryUsage.rss,
        heapTotal: memoryUsage.heapTotal,
        heapUsed: memoryUsage.heapUsed,
        external: memoryUsage.external
      },
      uptime: process.uptime()
    },
    responseTime: {
      cached: responseTimeMetrics.cached.count > 0 ? {
        avg: responseTimeMetrics.cached.total / responseTimeMetrics.cached.count,
        min: responseTimeMetrics.cached.min,
        max: responseTimeMetrics.cached.max,
        count: responseTimeMetrics.cached.count
      } : null,
      uncached: responseTimeMetrics.uncached.count > 0 ? {
        avg: responseTimeMetrics.uncached.total / responseTimeMetrics.uncached.count,
        min: responseTimeMetrics.uncached.min,
        max: responseTimeMetrics.uncached.max,
        count: responseTimeMetrics.uncached.count
      } : null
    }
  };
  
  // Add to history and maintain history size
  statsHistory.push(stats);
  if (statsHistory.length > historySize) {
    statsHistory.shift();
  }
  
  return stats;
}

/**
 * Check for performance issues
 * @param {Object} stats - Current cache statistics
 * @returns {Array} - Array of detected issues
 */
function checkPerformanceIssues(stats) {
  const issues = [];
  
  // Check hit ratio
  if (stats.cache.hitRatio < thresholds.hitRatio && stats.cache.hits + stats.cache.misses > 100) {
    issues.push({
      type: 'hitRatio',
      message: `Low cache hit ratio: ${(stats.cache.hitRatio * 100).toFixed(2)}%`,
      current: stats.cache.hitRatio,
      threshold: thresholds.hitRatio,
      severity: 'warning'
    });
  }
  
  // Check memory usage
  if (stats.system.memory.heapUsed > thresholds.memoryUsage) {
    issues.push({
      type: 'memory',
      message: `High memory usage: ${(stats.system.memory.heapUsed / (1024 * 1024)).toFixed(2)}MB`,
      current: stats.system.memory.heapUsed,
      threshold: thresholds.memoryUsage,
      severity: 'warning'
    });
  }
  
  // Check keys count
  if (stats.cache.keys > thresholds.keysCount) {
    issues.push({
      type: 'keysCount',
      message: `High number of cache keys: ${stats.cache.keys}`,
      current: stats.cache.keys,
      threshold: thresholds.keysCount,
      severity: 'warning'
    });
  }
  
  // Check response time for uncached requests
  if (stats.responseTime.uncached && stats.responseTime.uncached.avg > thresholds.responseTime) {
    issues.push({
      type: 'responseTime',
      message: `Slow uncached response time: ${stats.responseTime.uncached.avg.toFixed(2)}ms`,
      current: stats.responseTime.uncached.avg,
      threshold: thresholds.responseTime,
      severity: 'warning'
    });
  }
  
  return issues;
}

/**
 * Handle performance issues
 * @param {Array} issues - Detected performance issues
 */
function handlePerformanceIssues(issues) {
  if (issues.length === 0) {
    return;
  }
  
  // Throttle alerts to prevent flooding
  const now = Date.now();
  if (now - lastAlertTime < alertThrottleTime) {
    return;
  }
  
  lastAlertTime = now;
  
  // Log issues
  console.warn('[CACHE MONITOR] Performance issues detected:');
  issues.forEach(issue => {
    console.warn(`[CACHE MONITOR] - ${issue.message} (${issue.severity})`);
  });
  
  // Emit event
  monitoringEvents.emit('performanceIssues', issues);
  
  // Take automatic actions for critical issues
  const criticalIssues = issues.filter(issue => issue.severity === 'critical');
  if (criticalIssues.length > 0) {
    console.warn('[CACHE MONITOR] Critical issues detected, taking automatic actions');
    
    // Check for memory issues and clear cache if necessary
    if (criticalIssues.some(issue => issue.type === 'memory')) {
      console.warn('[CACHE MONITOR] Clearing cache due to critical memory usage');
      cacheService.clear();
    }
  }
}

/**
 * Record response time
 * @param {boolean} isCached - Whether the response was cached
 * @param {number} responseTime - Response time in milliseconds
 */
function recordResponseTime(isCached, responseTime) {
  const metrics = isCached ? responseTimeMetrics.cached : responseTimeMetrics.uncached;
  
  metrics.count++;
  metrics.total += responseTime;
  metrics.min = Math.min(metrics.min, responseTime);
  metrics.max = Math.max(metrics.max, responseTime);
}

/**
 * Reset response time metrics
 */
function resetResponseTimeMetrics() {
  responseTimeMetrics.cached = {
    count: 0,
    total: 0,
    min: Infinity,
    max: 0
  };
  
  responseTimeMetrics.uncached = {
    count: 0,
    total: 0,
    min: Infinity,
    max: 0
  };
}

/**
 * Get cache monitoring statistics
 * @param {Object} options - Options for statistics retrieval
 * @returns {Object} - Cache monitoring statistics
 */
function getMonitoringStats(options = {}) {
  const {
    includeHistory = false,
    historyLimit = 10
  } = options;
  
  const currentStats = collectStats();
  const issues = checkPerformanceIssues(currentStats);
  
  const result = {
    current: currentStats,
    issues,
    thresholds
  };
  
  if (includeHistory) {
    result.history = statsHistory.slice(-historyLimit);
  }
  
  return result;
}

/**
 * Export statistics to a JSON file
 * @param {string} filePath - Path to export the statistics
 * @returns {Promise<void>}
 */
async function exportStats(filePath = null) {
  try {
    const stats = {
      timestamp: new Date().toISOString(),
      current: collectStats(),
      history: statsHistory,
      issues: checkPerformanceIssues(collectStats()),
      thresholds
    };
    
    // Use default path if not provided
    const exportPath = filePath || path.join(process.cwd(), 'logs', `cache-stats-${Date.now()}.json`);
    
    // Ensure directory exists
    await fs.mkdir(path.dirname(exportPath), { recursive: true });
    
    // Write stats to file
    await fs.writeFile(exportPath, JSON.stringify(stats, null, 2));
    
    console.log(`[CACHE MONITOR] Exported statistics to ${exportPath}`);
    
    return exportPath;
  } catch (error) {
    console.error('[CACHE MONITOR] Error exporting statistics:', error);
    throw error;
  }
}

/**
 * Create middleware to monitor response times
 * @returns {Function} - Express middleware
 */


function createResponseTimeMiddleware() {
  return (req, res, next) => {
    // Skip for non-GET requests
    if (req.method !== 'GET') {
      return next();
    }
    
    // Record start time
    const startTime = Date.now();
    
    // Store the original end method
    const originalEnd = res.end;
    
    // Override end method to calculate response time
    res.end = function(chunk, encoding) {
      // Calculate response time
      const responseTime = Date.now() - startTime;
      
      // Determine if response was cached
      const isCached = res.getHeader('X-Cache') === 'HIT';
      
      // Record response time
      recordResponseTime(isCached, responseTime);
      
      // Add response time header if headers haven't been sent yet
      if (!res.headersSent) {
        res.setHeader('X-Response-Time', `${responseTime}ms`);
      }
      
      // Call original end method
      return originalEnd.call(this, chunk, encoding);
    };
    
    next();
  };
}

/**
 * Initialize the cache monitoring service
 * @returns {Object} - Cache monitoring service
 */
function init() {
  console.log('[CACHE MONITOR] Initializing cache monitoring service');
  
  // Setup periodic statistics collection
  const statsInterval = setInterval(() => {
    const stats = collectStats();
    const issues = checkPerformanceIssues(stats);
    handlePerformanceIssues(issues);
  }, process.env.CACHE_MONITOR_INTERVAL || 60000); // 1 minute by default
  
  // Setup periodic statistics export
  const exportInterval = setInterval(() => {
    if (process.env.CACHE_STATS_EXPORT_ENABLED === 'true') {
      exportStats();
    }
  }, process.env.CACHE_STATS_EXPORT_INTERVAL || 3600000); // 1 hour by default
  
  // Listen for cache events
  cacheService.on('invalidate', (data) => {
    console.log(`[CACHE MONITOR] Cache invalidation: ${data.count} keys invalidated`);
  });
  
  cacheService.on('clear', (data) => {
    console.log(`[CACHE MONITOR] Cache cleared: ${data.count} keys removed`);
  });
  
  console.log('[CACHE MONITOR] Cache monitoring service initialized');
  
  return {
    getMonitoringStats,
    exportStats,
    createResponseTimeMiddleware,
    on: monitoringEvents.on.bind(monitoringEvents),
    resetResponseTimeMetrics,
    stop: () => {
      clearInterval(statsInterval);
      clearInterval(exportInterval);
      console.log('[CACHE MONITOR] Cache monitoring service stopped');
    }
  };
}

module.exports = init();