/**
 * Background Refresh Service
 * Handles scheduled and on-demand background refreshing of cached data
 */
const schedule = require('node-schedule');
const cacheService = require('./cacheService');
const db = require('../../database');

// Store active jobs
const activeJobs = new Map();

// Critical endpoints that should be pre-warmed and kept fresh
const CRITICAL_ENDPOINTS = [
  {
    key: 'strains:list',
    namespace: 'api',
    cronExpression: '*/30 * * * *', // Every 30 minutes
    ttl: 1800, // 30 minutes
    fetchFunction: async () => {
      const sql = `
        SELECT * FROM medical_strains
        UNION ALL
        SELECT * FROM normal_strains
        UNION ALL
        SELECT * FROM greenhouse_strains
        UNION ALL
        SELECT * FROM indoor_strains
        UNION ALL
        SELECT * FROM exotic_tunnel_strains
        LIMIT 100
      `;
      const [rows] = await db.execute(sql);
      return { data: rows };
    }
  },
  {
    key: 'strains:medical:list',
    namespace: 'api',
    cronExpression: '*/15 * * * *', // Every 15 minutes
    ttl: 900, // 15 minutes
    fetchFunction: async () => {
      const sql = 'SELECT * FROM medical_strains LIMIT 100';
      const [rows] = await db.execute(sql);
      return { data: rows };
    }
  },
  {
    key: 'health',
    namespace: 'api',
    cronExpression: '*/5 * * * *', // Every 5 minutes
    ttl: 300, // 5 minutes
    fetchFunction: async () => {
      // Simple health check data
      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
        cache: cacheService.getStats()
      };
    }
  }
];

/**
 * Start a background refresh job
 * @param {Object} endpoint - Endpoint configuration
 * @returns {string} - Job ID
 */
function startRefreshJob(endpoint) {
  const { key, namespace, cronExpression, ttl, fetchFunction } = endpoint;
  
  const jobId = cacheService.scheduleRefresh(key, fetchFunction, {
    namespace,
    cronExpression,
    ttl
  });
  
  activeJobs.set(jobId, {
    key,
    namespace,
    cronExpression,
    ttl,
    startedAt: Date.now()
  });
  
  console.log(`[REFRESH] Started background refresh job for ${namespace}:${key} with cron: ${cronExpression}`);
  
  return jobId;
}

/**
 * Stop a background refresh job
 * @param {string} jobId - Job ID
 * @returns {boolean} - Success status
 */
function stopRefreshJob(jobId) {
  if (activeJobs.has(jobId)) {
    const job = activeJobs.get(jobId);
    cacheService.cancelScheduledRefresh(jobId);
    activeJobs.delete(jobId);
    console.log(`[REFRESH] Stopped background refresh job for ${job.namespace}:${job.key}`);
    return true;
  }
  return false;
}

/**
 * Pre-warm the cache for critical endpoints
 * @returns {Promise<void>}
 */
async function prewarmCache() {
  console.log('[REFRESH] Pre-warming cache for critical endpoints');
  
  const promises = CRITICAL_ENDPOINTS.map(async (endpoint) => {
    try {
      const { key, namespace, ttl, fetchFunction } = endpoint;
      
      console.log(`[REFRESH] Pre-warming cache for ${namespace}:${key}`);
      
      // Fetch and cache the data
      const data = await fetchFunction();
      
      // Store in cache
      const now = Date.now();
      const result = {
        data,
        metadata: {
          cachedAt: now,
          expiresAt: now + (ttl * 1000),
          ttl,
          refreshCount: 0,
          refreshType: 'prewarm'
        }
      };
      
      // Use the cache service to store
      cacheService.invalidate(key, { namespace });
      cacheService.get(key, () => Promise.resolve(data), {
        namespace,
        ttl
      });
      
      console.log(`[REFRESH] Pre-warmed cache for ${namespace}:${key}`);
    } catch (error) {
      console.error(`[REFRESH] Error pre-warming cache for ${endpoint.namespace}:${endpoint.key}`, error);
    }
  });
  
  await Promise.all(promises);
  console.log('[REFRESH] Completed pre-warming cache for critical endpoints');
}

/**
 * Start all background refresh jobs
 */
function startAllJobs() {
  CRITICAL_ENDPOINTS.forEach(endpoint => {
    startRefreshJob(endpoint);
  });
  
  console.log(`[REFRESH] Started ${CRITICAL_ENDPOINTS.length} background refresh jobs`);
}

/**
 * Stop all background refresh jobs
 */
function stopAllJobs() {
  const jobIds = Array.from(activeJobs.keys());
  jobIds.forEach(jobId => {
    stopRefreshJob(jobId);
  });
  
  console.log(`[REFRESH] Stopped ${jobIds.length} background refresh jobs`);
}

/**
 * Get status of all background refresh jobs
 * @returns {Array} - Job status
 */
function getJobStatus() {
  return Array.from(activeJobs.entries()).map(([jobId, job]) => {
    return {
      jobId,
      key: job.key,
      namespace: job.namespace,
      cronExpression: job.cronExpression,
      ttl: job.ttl,
      startedAt: job.startedAt,
      runningFor: Date.now() - job.startedAt
    };
  });
}

/**
 * Initialize the background refresh service
 */
async function init() {
  console.log('[REFRESH] Initializing background refresh service');
  
  // Pre-warm the cache
  await prewarmCache();
  
  // Start all jobs
  startAllJobs();
  
  // Setup monitoring
  setInterval(() => {
    const status = getJobStatus();
    console.log(`[REFRESH] Background jobs status: ${status.length} active jobs`);
  }, process.env.REFRESH_MONITOR_INTERVAL || 900000); // 15 minutes by default
  
  console.log('[REFRESH] Background refresh service initialized');
  
  return {
    startRefreshJob,
    stopRefreshJob,
    prewarmCache,
    startAllJobs,
    stopAllJobs,
    getJobStatus
  };
}

module.exports = {
  init,
  startRefreshJob,
  stopRefreshJob,
  prewarmCache,
  startAllJobs,
  stopAllJobs,
  getJobStatus
};