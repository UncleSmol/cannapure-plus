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
      try {
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
      } catch (error) {
        // Check for specific error about missing tables
        if (error.code === 'ER_NO_SUCH_TABLE') {
          console.debug(`[REFRESH] Skipping refresh for strains:list due to missing table: ${error.sqlMessage}`);
          return { 
            data: [], 
            metadata: { 
              error: 'Database schema not fully initialized', 
              status: 'pending' 
            }
          };
        }
        throw error;
      }
    }
  },
  {
    key: 'strains:medical:list',
    namespace: 'api',
    cronExpression: '*/15 * * * *', // Every 15 minutes
    ttl: 900, // 15 minutes
    fetchFunction: async () => {
      try {
        const sql = 'SELECT * FROM medical_strains LIMIT 100';
        const [rows] = await db.execute(sql);
        return { data: rows };
      } catch (error) {
        // Check for specific error about missing tables
        if (error.code === 'ER_NO_SUCH_TABLE') {
          console.debug(`[REFRESH] Skipping refresh for strains:medical:list due to missing table: ${error.sqlMessage}`);
          return { 
            data: [], 
            metadata: { 
              error: 'Database schema not fully initialized', 
              status: 'pending' 
            }
          };
        }
        throw error;
      }
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
  
  try {
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
  } catch (error) {
    console.error(`[REFRESH] Failed to schedule refresh job for ${namespace}:${key}:`, error);
    return null;
  }
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
 * @returns {Promise<Array>} Results of pre-warming operations
 */
async function prewarmCache() {
  console.log('[REFRESH] Pre-warming cache for critical endpoints');
  
  const results = await Promise.all(
    CRITICAL_ENDPOINTS.map(async (endpoint) => {
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
        return { key, namespace, success: true };
      } catch (error) {
        // Only log detailed error if it's not a known missing table issue
        if (error.code === 'ER_NO_SUCH_TABLE') {
          console.debug(`[REFRESH] Skipping pre-warming for ${endpoint.namespace}:${endpoint.key} due to missing table: ${error.sqlMessage}`);
          return { 
            key: endpoint.key, 
            namespace: endpoint.namespace, 
            success: false, 
            reason: 'missing-table' 
          };
        } else {
          console.error(`[REFRESH] Error pre-warming cache for ${endpoint.namespace}:${endpoint.key}`, error);
          return { 
            key: endpoint.key, 
            namespace: endpoint.namespace, 
            success: false, 
            error: error.message 
          };
        }
      }
    })
  );
  
  console.log('[REFRESH] Completed pre-warming cache for critical endpoints');
  return results;
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
  
  try {
    // Pre-warm the cache
    const prewarmResults = await prewarmCache();
    
    // Log summary of pre-warming results
    const successCount = prewarmResults.filter(r => r.success).length;
    const pendingCount = prewarmResults.filter(r => r.reason === 'missing-table').length;
    const failedCount = prewarmResults.filter(r => !r.success && r.reason !== 'missing-table').length;
    
    console.log(`[REFRESH] Pre-warming summary: ${successCount} successful, ${pendingCount} pending (missing tables), ${failedCount} failed`);
    
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
  } catch (error) {
    console.error('[REFRESH] Failed to initialize background refresh service:', error);
    throw error;
  }
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
