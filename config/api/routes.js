const express = require('express');
const strainsRoutes = require('./strains/routes');
const errorHandler = require('./middleware/error');

// Initialize router
const router = express.Router();

// Health check endpoint (public)
router.get('/health', (req, res) => {
  console.log('[API] Health check requested');
  const healthData = { 
    status: 'ok', 
    timestamp: new Date().toISOString() 
  };
  console.log('[API] Health check response:', healthData);
  res.status(200).json(healthData);
});

// Test endpoint (public)
router.get('/test', (req, res) => {
  console.log('[API] Test endpoint requested');
  const testData = { message: 'API is working!' };
  console.log('[API] Test endpoint response:', testData);
  res.status(200).json(testData);
});

// Register API routes - removed authentication for now
router.use('/strains', strainsRoutes);

// Error handling middleware
router.use(errorHandler);

module.exports = router;
