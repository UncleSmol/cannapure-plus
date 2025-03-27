// Load environment variables
require('dotenv').config();

// Import the new logger utility
const { createLogger, configureLogging, LOG_LEVELS } = require('./api/utils/logger');
const logger = createLogger('SERVER');

// Configure global logging
configureLogging({
  logLevel: process.env.LOG_LEVEL ? parseInt(process.env.LOG_LEVEL) : undefined,
  ignoredErrors: [
    // Suppress specific errors during development
    /Table 'cannapureplus_dev.medical_strains' doesn't exist/
  ]
});

const express = require('express');
const cors = require('cors');
const path = require('path');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const db = require("./database");
const apiRoutes = require('./api/routes/index'); // Use the index.js file with auth routes
const responseMiddleware = require('./api/middleware/response');

// Import Phase 3 caching services
const cacheService = require('./api/services/cacheService');
const cacheMonitoring = require('./api/services/cacheMonitoring');
const backgroundRefresh = require('./api/services/backgroundRefresh');
const { invalidateCache } = require('./api/middleware/cacheInvalidation');

// Import cache dashboard routes
const cacheDashboardRoutes = require('./api/routes/cache-dashboard.js');

// Import authentication middleware
const authMiddleware = require('./api/middleware/auth');

// Initialize express app
const app = express();

// Environment variables
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Security middleware
app.use(helmet({
  contentSecurityPolicy: NODE_ENV === 'production' ? undefined : false,
  crossOriginEmbedderPolicy: false
}));

// CORS configuration - Improved to handle preflight requests and all routes
app.use(cors({
  origin: function(origin, callback) {
    // Allow any origin in development mode
    if (NODE_ENV !== 'production') {
      return callback(null, true);
    }
    
    // In production, check against allowed origins
    const allowedOrigins = [
      'http://localhost:3000', 
      'http://127.0.0.1:3000', 
      'http://localhost:5000', 
      'http://127.0.0.1:5000'
    ];
    
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Force-Refresh', 'Cache-Control', 'Accept', 'Origin', 'X-Requested-With'],
  exposedHeaders: ['X-API-Version', 'X-Response-Time', 'ETag', 'Last-Modified'],
  credentials: true, // Important for cookies
  maxAge: 86400 // Cache preflight requests for 24 hours
}));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cookie parsing middleware
app.use(cookieParser());

// Add cache monitoring response time middleware
app.use(cacheMonitoring.createResponseTimeMiddleware());

// Simple request tracking middleware
app.use((req, res, next) => {
  next();
});

// Add forced refresh capability
app.use(responseMiddleware.allowForcedRefresh());

// Handle conditional requests
app.use(responseMiddleware.handleConditionalRequests());

// Add cache headers to responses
app.use(responseMiddleware.addCacheHeaders({
  maxAge: process.env.API_CACHE_MAX_AGE || 300, // 5 minutes default
  includeETag: true,
  varyByQueryParams: true,
  varyByAccept: true,
  publicCache: process.env.NODE_ENV === 'production' // Public cache in production only
}));

// API routes
app.use('/api', apiRoutes);

// Cache dashboard routes (admin only)
app.use('/api/cache', 
  authMiddleware.verifyToken, 
  authMiddleware.requireRole('admin'), 
  cacheDashboardRoutes
);

// Endpoint for testing status - specifically for frontend health checks
app.get('/status', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    serverPort: PORT,
    environment: NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

// Health check endpoint with enhanced cache information
app.get('/api/health', (req, res) => {
  // Get cache statistics
  const cacheStats = cacheService.getStats();
  const monitoringStats = cacheMonitoring.getMonitoringStats({ includeHistory: false });
  const backgroundJobs = backgroundRefresh.getJobStatus();
  
  res.status(200).json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: NODE_ENV,
    serverPort: PORT,
    database: db.pool ? 'connected' : 'disconnected',
    cache: {
      enabled: true,
      maxAge: process.env.API_CACHE_MAX_AGE || 300,
      stats: cacheStats,
      issues: monitoringStats.issues,
      backgroundJobs: {
        count: backgroundJobs.length,
        active: backgroundJobs.filter(job => job.active).length
      }
    },
    auth: {
      enabled: true,
      jwtEnabled: !!process.env.JWT_SECRET,
      cookiesEnabled: process.env.USE_COOKIE_FOR_REFRESH === 'true',
      protectedRoutes: ['/api/budbar', '/api/membership', '/api/admin', '/api/cache']
    },
    dataFreshness: {
      phase1: 'implemented',
      phase2: 'implemented',
      phase3: 'implemented',
      features: {
        cacheHeaders: true,
        conditionalRequests: true,
        versionInformation: true,
        forcedRefresh: true,
        backgroundRefresh: true,
        cacheMonitoring: true,
        cacheDashboard: true
      }
    }
  });
});

// Test endpoint
app.get('/api/test', (req, res) => {
  res.status(200).json({ message: 'API is working!' });
});

// Serve static files from the build directory
app.use(express.static(path.join(__dirname, '..', 'build')));

// Catch-all route to serve the React app - This should be AFTER all API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'build', 'index.html'));
});

// Handle preflight OPTIONS requests for all routes
app.options('*', cors());

// Global error handler
app.use((err, req, res, next) => {
  const timestamp = new Date().toISOString();
  
  // Special handling for CORS errors
  if (err.message && err.message.includes('CORS')) {
    return res.status(403).json({
      error: {
        message: 'CORS error: Origin not allowed',
        code: 'CORS_ERROR',
        timestamp: timestamp
      }
    });
  }
  
  // Handle JWT errors specifically
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: {
        message: 'Invalid token',
        code: 'INVALID_TOKEN',
        timestamp: timestamp
      }
    });
  }
  
  // Handle token expiration
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: {
        message: 'Token expired',
        code: 'TOKEN_EXPIRED',
        timestamp: timestamp
      }
    });
  }
  
  res.status(err.status || 500).json({
    error: {
      message: NODE_ENV === 'production' 
        ? 'An error occurred' 
        : err.message || 'An internal server error occurred',
      code: err.code || 'SERVER_ERROR',
      timestamp: timestamp
    }
  });
});

/**
 * Verify authentication configuration
 */
function verifyAuthConfig() {
  // Check JWT secret
  if (!process.env.JWT_SECRET) {
    logger.warn('JWT_SECRET not set, using default development secret');
    process.env.JWT_SECRET = 'default-dev-secret-do-not-use-in-production';
  }
  
  // Check refresh token secret
  if (!process.env.REFRESH_TOKEN_SECRET) {
    logger.debug('REFRESH_TOKEN_SECRET not set, using JWT_SECRET');
    process.env.REFRESH_TOKEN_SECRET = process.env.JWT_SECRET;
  }
  
  // Check token expiry
  if (!process.env.JWT_EXPIRY) {
    logger.debug('JWT_EXPIRY not set, using default of 1h');
    process.env.JWT_EXPIRY = '1h';
  }
  
  // Check refresh token expiry
  if (!process.env.REFRESH_TOKEN_EXPIRY) {
    logger.debug('REFRESH_TOKEN_EXPIRY not set, using default of 7d');
    process.env.REFRESH_TOKEN_EXPIRY = '7d';
  }
  
  logger.info('Authentication configuration verified');
}

/**
 * Initialize Phase 3 caching components
 */
async function initCachingComponents() {
  try {
    logger.info('Initializing caching components');
    
    // Initialize background refresh service
    await backgroundRefresh.init();
    
    // Pre-warm cache for critical endpoints
    try {
      await backgroundRefresh.prewarmCache();
    } catch (error) {
      // Only log non-ignored errors
      if (!(/Table 'cannapureplus_dev.medical_strains' doesn't exist/).test(error.message)) {
        logger.error('Error during cache pre-warming:', error);
      } else {
        logger.debug('Skipping missing tables during pre-warming');
      }
    }
    
    logger.info('Caching components initialized successfully');
  } catch (error) {
    logger.error('Failed to initialize caching components:', error);
  }
}

/**
 * Graceful shutdown handler
 */
async function gracefulShutdown(signal) {
  logger.info(`Received ${signal} signal, shutting down gracefully`);
  
  try {
    // Export cache statistics before shutdown
    if (process.env.CACHE_EXPORT_ON_SHUTDOWN !== 'false') {
      logger.info('Exporting cache statistics before shutdown');
      await cacheMonitoring.exportStats(
        path.join(__dirname, '..', 'logs', `cache-stats-shutdown-${Date.now()}.json`)
      );
    }
    
    // Stop background refresh jobs
    logger.info('Stopping background refresh jobs');
    backgroundRefresh.stopAllJobs();
    
    // Close database connection
    if (db.pool) {
      logger.info('Closing database connection');
      await db.pool.end();
    }
    
    logger.info('Shutdown complete, exiting process');
    process.exit(0);
  } catch (error) {
    logger.error('Error during shutdown:', error);
    process.exit(1);
  }
}

// Setup graceful shutdown handlers
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Start the server
app.listen(PORT, async () => {
  logger.info(`Server starting on port ${PORT} in ${NODE_ENV} mode`);
  
  // Verify authentication configuration
  verifyAuthConfig();
  logger.debug('Authentication configuration verified');
  
  // Initialize Phase 3 caching components
  await initCachingComponents();
  
  logger.info(`Server running on port ${PORT}`);
});

module.exports = app;
