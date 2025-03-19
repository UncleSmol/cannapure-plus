/**
 * Health check API route with data freshness information
 */
const express = require('express');
const router = express.Router();
const db = require('../db');
const { getCacheStats } = require('../utils/db-utils');

// API version
const API_VERSION = process.env.API_VERSION || '1.0.0';

/**
 * Health check endpoint
 * @route GET /api/health
 */
router.get('/', async (req, res) => {
  try {
    // Check database connection
    const dbConnected = db.pool ? true : false;
    let dbStatus = 'disconnected';
    
    if (dbConnected) {
      try {
        // Test database connection with a simple query
        await db.query('SELECT 1');
        dbStatus = 'connected';
      } catch (error) {
        dbStatus = 'error';
      }
    }
    
    // Get cache statistics
    const cacheStats = getCacheStats();
    
    // Build response
    const healthData = {
      status: dbStatus === 'connected' ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      version: API_VERSION,
      database: {
        status: dbStatus,
        pool: {
          connectionLimit: process.env.DB_CONNECTION_LIMIT || 10,
          queueLimit: process.env.DB_QUEUE_LIMIT || 0,
          waitForConnections: process.env.DB_WAIT_FOR_CONNECTIONS === 'true'
        }
      },
      cache: {
        enabled: true,
        maxAge: process.env.API_CACHE_MAX_AGE || 300,
        stats: cacheStats
      },
      dataFreshness: {
        phase1: 'implemented',
        phase2: 'implemented',
        phase3: 'pending',
        features: {
          cacheHeaders: true,
          conditionalRequests: true,
          versionInformation: true,
          forcedRefresh: true
        }
      }
    };
    
    // Add metadata for consistency with other endpoints
    const response = {
      data: healthData,
      metadata: {
        timestamp: new Date().toISOString(),
        version: API_VERSION
      }
    };
    
    res.json(response);
  } catch (error) {
    console.error('[HEALTH] Health check error:', error);
    res.status(500).json({
      status: 'error',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;