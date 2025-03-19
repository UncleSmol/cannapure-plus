/**
 * Cache Dashboard API Route
 * Provides endpoints for monitoring cache performance and managing cache
 */
const express = require('express');
const router = express.Router();
const cacheService = require('../services/cacheService');
const cacheMonitoring = require('../services/cacheMonitoring');
const backgroundRefresh = require('../services/backgroundRefresh');

/**
 * Get cache statistics
 * @route GET /api/cache/stats
 */
router.get('/stats', async (req, res) => {
  try {
    const { includeHistory, historyLimit } = req.query;
    
    const stats = cacheMonitoring.getMonitoringStats({
      includeHistory: includeHistory === 'true',
      historyLimit: parseInt(historyLimit) || 10
    });
    
    res.json({
      data: stats,
      metadata: {
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('[CACHE DASHBOARD] Error getting stats:', error);
    res.status(500).json({
      error: 'Error getting cache statistics',
      message: error.message
    });
  }
});

/**
 * Get cache keys
 * @route GET /api/cache/keys
 */
router.get('/keys', async (req, res) => {
  try {
    const { pattern, limit, offset } = req.query;
    
    // Get all keys from cache service
    const allKeys = cacheService.getKeys();
    
    // Filter by pattern if provided
    let filteredKeys = allKeys;
    if (pattern) {
      const regex = new RegExp(pattern);
      filteredKeys = allKeys.filter(key => regex.test(key));
    }
    
    // Apply pagination
    const paginatedKeys = filteredKeys.slice(
      parseInt(offset) || 0,
      (parseInt(offset) || 0) + (parseInt(limit) || 100)
    );
    
    res.json({
      data: {
        keys: paginatedKeys,
        total: filteredKeys.length,
        limit: parseInt(limit) || 100,
        offset: parseInt(offset) || 0
      },
      metadata: {
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('[CACHE DASHBOARD] Error getting keys:', error);
    res.status(500).json({
      error: 'Error getting cache keys',
      message: error.message
    });
  }
});

/**
 * Get cache key details
 * @route GET /api/cache/keys/:key
 */
router.get('/keys/:key', async (req, res) => {
  try {
    const { key } = req.params;
    const { namespace } = req.query;
    
    // Get key details from cache service
    const namespacedKey = namespace ? `${namespace}:${key}` : key;
    const keyDetails = cacheService.getKeyDetails(namespacedKey);
    
    if (!keyDetails) {
      return res.status(404).json({
        error: 'Cache key not found',
        key: namespacedKey
      });
    }
    
    res.json({
      data: keyDetails,
      metadata: {
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('[CACHE DASHBOARD] Error getting key details:', error);
    res.status(500).json({
      error: 'Error getting cache key details',
      message: error.message
    });
  }
});

/**
 * Clear cache
 * @route POST /api/cache/clear
 */
router.post('/clear', async (req, res) => {
  try {
    const { pattern, namespace } = req.body;
    
    let count;
    if (pattern) {
      // Clear by pattern
      count = cacheService.invalidate(pattern, {
        isPattern: true,
        namespace,
        source: 'manual'
      });
    } else {
      // Clear all
      count = cacheService.clear();
    }
    
    res.json({
      data: {
        cleared: count,
        pattern,
        namespace
      },
      metadata: {
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('[CACHE DASHBOARD] Error clearing cache:', error);
    res.status(500).json({
      error: 'Error clearing cache',
      message: error.message
    });
  }
});

/**
 * Export cache statistics
 * @route POST /api/cache/export
 */
router.post('/export', async (req, res) => {
  try {
    const { filePath } = req.body;
    
    const exportPath = await cacheMonitoring.exportStats(filePath);
    
    res.json({
      data: {
        exportPath,
        timestamp: new Date().toISOString()
      },
      metadata: {
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('[CACHE DASHBOARD] Error exporting stats:', error);
    res.status(500).json({
      error: 'Error exporting cache statistics',
      message: error.message
    });
  }
});

/**
 * Get background refresh jobs
 * @route GET /api/cache/jobs
 */
router.get('/jobs', async (req, res) => {
  try {
    const jobs = backgroundRefresh.getJobStatus();
    
    res.json({
      data: {
        jobs,
        count: jobs.length
      },
      metadata: {
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('[CACHE DASHBOARD] Error getting jobs:', error);
    res.status(500).json({
      error: 'Error getting background refresh jobs',
      message: error.message
    });
  }
});

/**
 * Start a background refresh job
 * @route POST /api/cache/jobs
 */
router.post('/jobs', async (req, res) => {
  try {
    const { key, namespace, cronExpression, ttl, fetchFunction } = req.body;
    
    // Validate required fields
    if (!key || !namespace || !cronExpression || !ttl) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['key', 'namespace', 'cronExpression', 'ttl']
      });
    }
    
    // Create endpoint configuration
    const endpoint = {
      key,
      namespace,
      cronExpression,
      ttl,
      fetchFunction: eval(`(${fetchFunction})`) // Note: This is potentially unsafe
    };
    
    const jobId = backgroundRefresh.startRefreshJob(endpoint);
    
    res.json({
      data: {
        jobId,
        endpoint
      },
      metadata: {
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('[CACHE DASHBOARD] Error starting job:', error);
    res.status(500).json({
      error: 'Error starting background refresh job',
      message: error.message
    });
  }
});

/**
 * Stop a background refresh job
 * @route DELETE /api/cache/jobs/:jobId
 */
router.delete('/jobs/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params;
    
    const success = backgroundRefresh.stopRefreshJob(jobId);
    
    if (!success) {
      return res.status(404).json({
        error: 'Job not found',
        jobId
      });
    }
    
    res.json({
      data: {
        jobId,
        stopped: true
      },
      metadata: {
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('[CACHE DASHBOARD] Error stopping job:', error);
    res.status(500).json({
      error: 'Error stopping background refresh job',
      message: error.message
    });
  }
});

/**
 * Manually trigger a cache refresh
 * @route POST /api/cache/refresh
 */
router.post('/refresh', async (req, res) => {
  try {
    const { key, namespace } = req.body;
    
    // Validate required fields
    if (!key) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['key']
      });
    }
    
    // Invalidate the key to force refresh
    cacheService.invalidate(key, {
      namespace,
      source: 'manual'
    });
    
    res.json({
      data: {
        key,
        namespace,
        refreshed: true
      },
      metadata: {
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('[CACHE DASHBOARD] Error refreshing cache:', error);
    res.status(500).json({
      error: 'Error refreshing cache',
      message: error.message
    });
  }
});

module.exports = router;