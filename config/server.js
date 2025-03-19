// Load environment variables
require('dotenv').config();

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

// CORS configuration
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:5000', 'http://127.0.0.1:5000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Force-Refresh'],
  exposedHeaders: ['X-API-Version', 'X-Response-Time', 'ETag', 'Last-Modified'],
  credentials: true // Important for cookies
}));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cookie parsing middleware
app.use(cookieParser());

// Add cache monitoring response time middleware
app.use(cacheMonitoring.createResponseTimeMiddleware());

// Enhanced logging middleware with API-specific details
app.use((req, res, next) => {
  const start = Date.now();
  const timestamp = new Date().toISOString();
  
  // Log request details
  console.log(`\n[${timestamp}] 🔄 ${req.method} ${req.url}`);
  
  // Log request body if present (but mask sensitive data)
  if (req.body && Object.keys(req.body).length > 0) {
    const sanitizedBody = { ...req.body };
    
    // Mask sensitive fields
    if (sanitizedBody.password) sanitizedBody.password = '********';
    if (sanitizedBody.currentPassword) sanitizedBody.currentPassword = '********';
    if (sanitizedBody.newPassword) sanitizedBody.newPassword = '********';
    if (sanitizedBody.confirmPassword) sanitizedBody.confirmPassword = '********';
    
    console.log(`[REQUEST BODY] ${JSON.stringify(sanitizedBody, null, 2)}`);
  }
  
  // Log query parameters if present
  if (req.query && Object.keys(req.query).length > 0) {
    console.log(`[REQUEST QUERY] ${JSON.stringify(req.query, null, 2)}`);
  }
  
  // Add response logging after request is complete
  res.on('finish', () => {
    const duration = Date.now() - start;
    const statusCode = res.statusCode;
    let logSymbol = '✅';
    
    // Use different symbols based on status code
    if (statusCode >= 400 && statusCode < 500) logSymbol = '⚠️';
    if (statusCode >= 500) logSymbol = '❌';
    
    // Special formatting for API routes
    if (req.url.startsWith('/api/')) {
      console.log(`[${timestamp}] ${logSymbol} API ${req.method} ${req.url} - Status: ${statusCode} - ${duration}ms`);
      
      // Log additional details for API requests
      const apiPath = req.url.split('?')[0]; // Remove query params
      const apiModule = apiPath.split('/')[2]; // Extract API module name
      
      if (apiModule) {
        console.log(`[${timestamp}] 📊 API Module: ${apiModule} - Operation completed in ${duration}ms`);
      }
    } else {
      console.log(`[${timestamp}] ${logSymbol} ${req.method} ${req.url} - Status: ${statusCode} - ${duration}ms`);
    }
  });
  
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

// Global error handler
app.use((err, req, res, next) => {
  const timestamp = new Date().toISOString();
  console.error(`\n[${timestamp}] ❌ Server error:`, err);
  
  // Log stack trace in development
  if (NODE_ENV !== 'production' && err.stack) {
    console.error(`[STACK TRACE] ${err.stack}`);
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
  console.log('\n=== VERIFYING AUTHENTICATION CONFIGURATION ===');
  
  // Check JWT secret
  if (!process.env.JWT_SECRET) {
    console.warn('⚠️ JWT_SECRET is not set. Using a default secret for development.');
    process.env.JWT_SECRET = 'default-dev-secret-do-not-use-in-production';
  } else {
    console.log('✅ JWT_SECRET is configured');
  }
  
  // Check refresh token secret
  if (!process.env.REFRESH_TOKEN_SECRET) {
    console.warn('⚠️ REFRESH_TOKEN_SECRET is not set. Using JWT_SECRET as fallback.');
    process.env.REFRESH_TOKEN_SECRET = process.env.JWT_SECRET;
  } else {
    console.log('✅ REFRESH_TOKEN_SECRET is configured');
  }
  
  // Check token expiry
  if (!process.env.JWT_EXPIRY) {
    console.warn('⚠️ JWT_EXPIRY is not set. Using default of 1 hour.');
    process.env.JWT_EXPIRY = '1h';
  } else {
    console.log(`✅ JWT_EXPIRY is set to ${process.env.JWT_EXPIRY}`);
  }
  
  // Check refresh token expiry
  if (!process.env.REFRESH_TOKEN_EXPIRY) {
    console.warn('⚠️ REFRESH_TOKEN_EXPIRY is not set. Using default of 7 days.');
    process.env.REFRESH_TOKEN_EXPIRY = '7d';
  } else {
    console.log(`✅ REFRESH_TOKEN_EXPIRY is set to ${process.env.REFRESH_TOKEN_EXPIRY}`);
  }
  
  // Check cookie usage
  if (process.env.USE_COOKIE_FOR_REFRESH === 'true') {
    console.log('✅ Using HTTP-only cookies for refresh tokens');
  } else {
    console.log('ℹ️ Using Authorization header for refresh tokens');
  }
  
  console.log('Authentication configuration verified');
}

/**
 * Initialize Phase 3 caching components
 */
async function initCachingComponents() {
  try {
    console.log('\n=== INITIALIZING PHASE 3 CACHING ===');
    
    // Initialize background refresh service
    await backgroundRefresh.init();
    
    // Pre-warm cache for critical endpoints
    await backgroundRefresh.prewarmCache();
    
    console.log('Phase 3 caching initialized successfully');
  } catch (error) {
    console.error('Error initializing Phase 3 caching:', error);
  }
}

/**
 * Graceful shutdown handler
 */
async function gracefulShutdown(signal) {
  console.log(`\n=== GRACEFUL SHUTDOWN (${signal}) ===`);
  
  try {
    // Export cache statistics before shutdown
    if (process.env.CACHE_EXPORT_ON_SHUTDOWN !== 'false') {
      console.log('Exporting cache statistics...');
      await cacheMonitoring.exportStats(
        path.join(__dirname, '..', 'logs', `cache-stats-shutdown-${Date.now()}.json`)
      );
    }
    
    // Stop background refresh jobs
    console.log('Stopping background refresh jobs...');
    backgroundRefresh.stopAllJobs();
    
    // Close database connection
    console.log('Closing database connection...');
    if (db.pool) {
      await db.pool.end();
    }
    
    console.log('Shutdown complete');
    process.exit(0);
  } catch (error) {
    console.error('Error during shutdown:', error);
    process.exit(1);
  }
}

// Setup graceful shutdown handlers
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Start the server
app.listen(PORT, async () => {
  console.log(`\n=== SERVER STARTED ===`);
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${NODE_ENV}`);
  console.log(`Database connection: ${db.pool ? 'established' : 'not connected'}`);
  console.log(`Cache enabled: yes (default TTL: ${process.env.API_CACHE_MAX_AGE || 300}s)`);
  
  // Verify authentication configuration
  verifyAuthConfig();
  
  // Initialize Phase 3 caching components
  await initCachingComponents();
  
  console.log(`\n=== API ENDPOINTS ===`);
  console.log(`Base API URL: http://localhost:${PORT}/api`);
  
  console.log(`\n=== AUTHENTICATION ENDPOINTS ===`);
  console.log(`Register: http://localhost:${PORT}/api/auth/register`);
  console.log(`Login: http://localhost:${PORT}/api/auth/login`);
  console.log(`Refresh Token: http://localhost:${PORT}/api/auth/refresh`);
  console.log(`Logout: http://localhost:${PORT}/api/auth/logout`);
  console.log(`Profile: http://localhost:${PORT}/api/auth/profile`);
  
  console.log(`\n=== PROTECTED ENDPOINTS ===`);
  console.log(`BudBar: http://localhost:${PORT}/api/budbar`);
  console.log(`Membership: http://localhost:${PORT}/api/membership`);
  console.log(`Admin: http://localhost:${PORT}/api/admin`);
  
  console.log(`\n=== UTILITY ENDPOINTS ===`);
  console.log(`Test endpoint: http://localhost:${PORT}/api/test`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
  console.log(`Cache dashboard: http://localhost:${PORT}/api/cache/stats`);
  
  console.log(`\n=== CACHE CONTROL ===`);
  console.log(`Force refresh: Add ?forceRefresh=true to any request`);
  
  // Log available API routes if they exist
  try {
    const apiRouter = express.Router();
    const routes = apiRouter.stack || [];
    if (routes.length > 0) {
      console.log(`\n=== AVAILABLE ROUTES ===`);
      routes.forEach(route => {
        if (route.route) {
          const path = route.route.path;
          const methods = Object.keys(route.route.methods).join(', ').toUpperCase();
          console.log(`${methods}: http://localhost:${PORT}/api${path}`);
        }
      });
    }
  } catch (err) {
    console.log(`\n=== ROUTES INFO UNAVAILABLE ===`);
  }
  
  // Log cache statistics periodically
  setInterval(() => {
    const stats = cacheService.getStats();
    console.log(`\n=== CACHE STATISTICS ===`);
    console.log(`Keys: ${stats.keys}`);
    console.log(`Hit ratio: ${(stats.hitRatio * 100).toFixed(2)}%`);
    console.log(`Hits: ${stats.hits}, Misses: ${stats.misses}`);
    console.log(`Background jobs: ${backgroundRefresh.getJobStatus().length}`);
  }, process.env.CACHE_STATS_LOG_INTERVAL || 300000); // 5 minutes
});

module.exports = app;
