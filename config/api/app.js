/**
 * CannapurePlus API Application Configuration
 * Sets up the Express application with Phase 3 caching implementation
 */
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');

// Create Express app
const app = express();

// Import middleware
const { addCacheHeaders, handleConditionalRequests, allowForcedRefresh } = require('./middleware/response');
const { invalidateCache } = require('./middleware/cacheInvalidation');

// Import services
const cacheService = require('./services/cacheService');
const cacheMonitoring = require('./services/cacheMonitoring');
const backgroundRefresh = require('./services/backgroundRefresh');

// Import routes
const strainsRoutes = require('./routes/strains');
const healthRoutes = require('./routes/health');
const cacheDashboardRoutes = require('./routes/cache-dashboard');

// Setup logging
const logDirectory = path.join(process.cwd(), 'logs');
// Ensure log directory exists
if (!fs.existsSync(logDirectory)) {
  fs.mkdirSync(logDirectory, { recursive: true });
}

// Create a write stream for access logs
const accessLogStream = fs.createWriteStream(
  path.join(logDirectory, 'access.log'),
  { flags: 'a' }
);

// Basic middleware
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
if (process.env.NODE_ENV === 'production') {
  // Use combined format for production
  app.use(morgan('combined', { stream: accessLogStream }));
} else {
  // Use dev format for development
  app.use(morgan('dev'));
}

// Cache monitoring middleware for response times
app.use(cacheMonitoring.createResponseTimeMiddleware());

// Health check route - no caching middleware needed
app.use('/api/health', healthRoutes);

// API routes with caching middleware
app.use('/api/strains', 
  allowForcedRefresh(),
  handleConditionalRequests({
    enabled: process.env.CACHE_CONDITIONAL_REQUESTS !== 'false',
    checkETag: true,
    checkLastModified: true
  }),
  addCacheHeaders({
    maxAge: parseInt(process.env.CACHE_STRAINS_MAX_AGE) || 300,
    includeETag: true,
    varyByQueryParams: true,
    varyByAccept: true,
    publicCache: process.env.CACHE_PUBLIC === 'true'
  }),
  strainsRoutes
);

// Cache dashboard routes (admin only)
app.use('/api/cache', 
  // TODO: Add authentication middleware for admin access
  cacheDashboardRoutes
);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('[APP] Error:', err);
  
  // Add to monitoring
  if (cacheMonitoring.recordError) {
    cacheMonitoring.recordError(err, req);
  }
  
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    timestamp: new Date().toISOString()
  });
});

/**
 * Initialize the application
 * @returns {Promise<void>}
 */
async function initApp() {
  console.log('[APP] Initializing application...');
  
  try {
    // Initialize cache monitoring
    console.log('[APP] Initializing cache monitoring...');
    
    // Initialize background refresh service
    console.log('[APP] Initializing background refresh service...');
    await backgroundRefresh.init();
    
    // Pre-warm cache for critical endpoints
    console.log('[APP] Pre-warming cache...');
    await backgroundRefresh.prewarmCache();
    
    console.log('[APP] Application initialized successfully');
  } catch (error) {
    console.error('[APP] Error initializing application:', error);
    throw error;
  }
}

module.exports = {
  app,
  initApp
};