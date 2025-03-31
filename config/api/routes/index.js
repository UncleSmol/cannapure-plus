/**
 * API Routes Index
 * Centralizes all API routes
 */
const express = require('express');
const router = express.Router();
const { createLogger } = require('../utils/logger');

// Import route modules
const strainsRoutes = require('./strains');
const authRoutes = require('./auth');
const cacheDashboardRoutes = require('./cache-dashboard');
const userRoutes = require('./user');
const membershipRoutes = require('./membership');
// const budbarRoutes = require('./budbar');
// const adminRoutes = require('./admin');

// Import middleware
const authMiddleware = require('../middleware/auth');

const logger = createLogger('API-ROUTES');

// API version for response headers
const API_VERSION = process.env.API_VERSION || '1.0.0';

// Log all API requests and add API version to response headers
router.use((req, res, next) => {
  logger.debug(`${req.method} ${req.originalUrl}`);
  res.setHeader('X-API-Version', API_VERSION);
  next();
});

// Mount route modules
router.use('/auth', authRoutes);
router.use('/strains', strainsRoutes);
router.use('/user', userRoutes);
router.use('/membership', membershipRoutes);

// Cache dashboard routes (admin only)
router.use('/cache', 
  authMiddleware.verifyToken, 
  authMiddleware.requireRole('admin'), 
  cacheDashboardRoutes
);

// Protected routes for BudBar
// router.use('/budbar', 
//   authMiddleware.verifyToken,
//   budbarRoutes
// );

// Admin routes
router.use('/admin', 
  authMiddleware.verifyToken,
  authMiddleware.requireRole('admin'),
  // adminRoutes
);

// API version info
router.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the API',
    apiVersion: API_VERSION,
    endpoints: {
      auth: '/api/auth',
      strains: '/api/strains',
      user: '/api/user',
      membership: '/api/membership',
      cache: '/api/cache',
      admin: '/api/admin',
      budbar: '/api/budbar'
    }
  });
});

// API status endpoint
router.get('/status', (req, res) => {
  res.json({
    status: 'online',
    version: API_VERSION,
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
