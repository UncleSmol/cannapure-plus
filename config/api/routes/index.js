/**
 * API Routes Index
 * Centralizes all API routes
 */
const express = require('express');
const router = express.Router();

// Import route modules
const strainsRoutes = require('./strains');
const authRoutes = require('./auth');
const cacheDashboardRoutes = require('./cache-dashboard');

// Import middleware
const authMiddleware = require('../middleware/auth');

// Authentication routes
router.use('/auth', authRoutes);

// Strains routes (public)
router.use('/strains', strainsRoutes);

// Cache dashboard routes (admin only)
router.use('/cache', 
  authMiddleware.verifyToken, 
  authMiddleware.requireRole('admin'), 
  cacheDashboardRoutes
);

// Protected routes for BudBar
router.use('/budbar', 
  authMiddleware.verifyToken,
  (req, res, next) => {
    // BudBar routes would go here
    // For now, just a placeholder endpoint
    router.get('/', (req, res) => {
      res.json({
        data: {
          message: 'Welcome to the BudBar!',
          user: req.user
        },
        metadata: {
          timestamp: new Date().toISOString()
        }
      });
    });
    next();
  }
);

// Protected routes for Membership
router.use('/membership', 
  authMiddleware.verifyToken,
  (req, res, next) => {
    // Membership routes would go here
    // For now, just a placeholder endpoint
    router.get('/', (req, res) => {
      res.json({
        data: {
          message: 'Welcome to the Membership area!',
          user: req.user,
          membershipTier: req.user.membershipTier,
          membershipStatus: req.user.membershipStatus
        },
        metadata: {
          timestamp: new Date().toISOString()
        }
      });
    });
    next();
  }
);

// Admin routes
router.use('/admin', 
  authMiddleware.verifyToken,
  authMiddleware.requireRole('admin'),
  (req, res, next) => {
    // Admin routes would go here
    // For now, just a placeholder endpoint
    router.get('/', (req, res) => {
      res.json({
        data: {
          message: 'Welcome to the Admin area!',
          user: req.user
        },
        metadata: {
          timestamp: new Date().toISOString()
        }
      });
    });
    next();
  }
);

// API status endpoint
router.get('/status', (req, res) => {
  res.json({
    status: 'online',
    version: process.env.API_VERSION || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
