const express = require('express');
const router = express.Router();
const db = require('../../database');
const authMiddleware = require('../middleware/auth');
const { createLogger } = require('../utils/logger');
const { cacheResponse } = require('../middleware/cacheMiddleware');

const logger = createLogger('USER-API');

/**
 * @route   GET /api/user/profile
 * @desc    Get user profile information
 * @access  Private
 */
router.get('/profile', authMiddleware.verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    logger.info(`Fetching profile data for user ID: ${userId}`);
    
    // Query to get user profile data
    const query = `
      SELECT 
        id, 
        first_name, 
        last_name, 
        email, 
        phone, 
        created_at, 
        updated_at, 
        last_login
      FROM users 
      WHERE id = ?
    `;
    
    const [rows] = await db.query(query, [userId]);
    
    if (rows.length === 0) {
      logger.warn(`User with ID ${userId} not found in database`);
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Format the user data
    const userData = {
      id: rows[0].id,
      firstName: rows[0].first_name,
      lastName: rows[0].last_name,
      email: rows[0].email,
      phone: rows[0].phone,
      createdAt: rows[0].created_at,
      updatedAt: rows[0].updated_at,
      lastLogin: rows[0].last_login
    };
    
    return res.json(userData);
  } catch (error) {
    logger.error('Error fetching user profile:', error);
    return res.status(500).json({ 
      message: 'Server error while fetching user profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route   GET /api/user/membership
 * @desc    Get user membership information
 * @access  Private
 */
router.get('/membership', 
  authMiddleware.verifyToken, 
  cacheResponse({ ttl: 300, keyPrefix: 'user-membership' }), 
  async (req, res) => {
    try {
      const userId = req.user.id;
      logger.info(`Fetching membership data for user ID: ${userId}`);

      // Query to get membership data from users table
      const query = `
        SELECT 
          id,
          first_name,
          last_name,
          email,
          cpNumber,
          cp_issued_date,
          cp_status,
          membership_tier,
          membership_start_date,
          active_days,
          days_to_next_tier,
          last_active_date,
          tier_updated_at,
          membership_status,
          pause_date,
          total_pause_days
        FROM users 
        WHERE id = ?
      `;

      const [rows] = await db.query(query, [userId]);
      
      if (rows.length === 0) {
        logger.warn(`User with ID ${userId} not found in database`);
        return res.status(404).json({ message: 'User not found' });
      }

      const userData = rows[0];
      
      // Format the membership data for the response
      const membershipData = {
        firstName: userData.first_name,
        lastName: userData.last_name,
        email: userData.email,
        cpNumber: userData.cpNumber,
        issuedDate: userData.cp_issued_date,
        status: userData.cp_status,
        membershipTier: userData.membership_tier,
        startDate: userData.membership_start_date,
        activeDays: userData.active_days,
        daysToNextTier: userData.days_to_next_tier,
        lastActiveDate: userData.last_active_date,
        tierUpdatedAt: userData.tier_updated_at,
        membershipStatus: userData.membership_status,
        pauseDate: userData.pause_date,
        totalPauseDays: userData.total_pause_days
      };

      // Get membership benefits based on tier
      const benefits = await getMembershipBenefits(userData.membership_tier);
      membershipData.benefits = benefits;

      logger.debug('Membership data sent:', membershipData);
      return res.json(membershipData);
    } catch (error) {
      logger.error('Error fetching membership data:', error);
      return res.status(500).json({ 
        message: 'Server error while fetching membership data',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
});

/**
 * Get membership benefits based on tier
 * @param {string} tier - Membership tier
 * @returns {Promise<Array>} - Array of benefits
 */
async function getMembershipBenefits(tier) {
  try {
    // Check if benefits are stored in database
    const query = `
      SELECT benefit_description 
      FROM membership_benefits 
      WHERE tier = ?
      ORDER BY display_order
    `;
    
    const [rows] = await db.query(query, [tier]);
    
    // If benefits exist in database, return them
    if (rows && rows.length > 0) {
      return rows.map(row => row.benefit_description);
    }
    
    // Otherwise return default benefits based on tier
    switch((tier || '').toUpperCase()) {
      case 'GOLD':
        return [
          '15% discount on all products',
          'Free shipping on orders over R500',
          'Early access to new products',
          'Exclusive Gold member events'
        ];
      case 'DIAMOND':
        return [
          '20% discount on all products',
          'Free shipping on all orders',
          'Priority access to new products',
          'Exclusive Diamond member events',
          'Personal shopping assistant'
        ];
      case 'EMERALD':
        return [
          '25% discount on all products',
          'Free shipping on all orders',
          'VIP access to new products',
          'Exclusive Emerald member events',
          'Personal shopping assistant',
          'Monthly free product sample'
        ];
      case 'TROPEZ':
        return [
          '30% discount on all products',
          'Free shipping on all orders',
          'VIP access to new products and limited editions',
          'Exclusive Tropez member events',
          'Dedicated personal shopping assistant',
          'Monthly free product box',
          'Access to Tropez lounge'
        ];
      default: // BASIC
        return [
          '5% discount on selected products',
          'Member-only promotions',
          'Birthday special offer'
        ];
    }
  } catch (error) {
    logger.error('Error fetching membership benefits:', error);
    // Return default benefits if there's an error
    return ['Standard membership benefits'];
  }
}

module.exports = router;
