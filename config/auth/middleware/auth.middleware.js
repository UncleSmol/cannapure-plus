/**
 * Authentication Middleware
 * Protects routes and validates user permissions
 */

const passport = require('passport');
const authConfig = require('../auth.config');
const db = require('../../database');

/**
 * Middleware to ensure user is authenticated
 */
const isAuthenticated = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user, info) => {
    if (err) {
      console.error('Authentication error:', err);
      return res.status(500).json({ error: 'Internal server error during authentication' });
    }
    
    if (!user) {
      const message = info?.message || 'Unauthorized - Authentication required';
      return res.status(401).json({ error: message });
    }
    
    // Set the user in the request object
    req.user = user;
    
    // Log user activity
    logUserActivity(user.id, 'ROUTE_ACCESS', req);
    
    // Update last active timestamp
    updateLastActive(user.id);
    
    return next();
  })(req, res, next);
};

/**
 * Update user's last active timestamp
 */
const updateLastActive = (userId) => {
  db.query(
    'UPDATE users SET last_active_date = NOW() WHERE id = ?',
    [userId],
    (err) => {
      if (err) {
        console.error('Error updating last active date:', err);
      }
    }
  );
};

/**
 * Log user activity for audit purposes
 */
const logUserActivity = (userId, activityType, req) => {
  const ipAddress = req.ip || req.headers['x-forwarded-for'] || 'unknown';
  const userAgent = req.headers['user-agent'] || 'unknown';
  const path = req.originalUrl || req.url || 'unknown';
  
  const activityDetails = JSON.stringify({
    path,
    method: req.method,
    timestamp: new Date().toISOString()
  });
  
  db.query(
    'INSERT INTO user_activity_logs (user_id, activity_type, ip_address, device_info, activity_details) VALUES (?, ?, ?, ?, ?)',
    [userId, activityType, ipAddress, userAgent, activityDetails],
    (err) => {
      if (err) {
        console.error('Error logging user activity:', err);
      }
    }
  );
};

/**
 * Verify account status middleware
 */
const hasActiveAccount = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'User not authenticated' });
  }
  
  if (req.user.account_status !== 'ACTIVE') {
    return res.status(403).json({ 
      error: 'Account not active',
      status: req.user.account_status
    });
  }
  
  next();
};

module.exports = {
  isAuthenticated,
  hasActiveAccount
};