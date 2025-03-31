const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { createLogger } = require('../utils/logger');

const logger = createLogger('MEMBERSHIP-API');

/**
 * @route   GET /api/membership
 * @desc    Fallback endpoint for membership data
 * @access  Private
 */
router.get('/', authMiddleware.verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    logger.info(`Fetching membership data from fallback endpoint for user ID: ${userId}`);

    // In a real implementation, you would fetch this from the database
    // For now, return mock data based on the user's information
    const membershipData = {
      firstName: req.user.firstName || 'User',
      lastName: req.user.lastName || '',
      cpNumber: `CP${String(req.user.id).padStart(6, '0')}`,
      activeDays: 30, // Mock data
      membershipTier: req.user.membershipTier || 'basic'
    };

    logger.debug('Membership data sent from fallback endpoint:', membershipData);
    return res.json(membershipData);

  } catch (error) {
    logger.error('Error fetching membership data from fallback endpoint:', error);
    return res.status(500).json({ 
      message: 'Server error while fetching membership data',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;
