/**
 * Rate Limiting Middleware
 * Protects against brute force attacks and DoS
 */

const db = require('../../database');
const authConfig = require('../auth.config');

/**
 * Login attempt rate limiter
 * Tracks failed login attempts and locks accounts if necessary
 */
const loginRateLimiter = (req, res, next) => {
  const ipAddress = req.ip || req.headers['x-forwarded-for'] || 'unknown';
  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }
  
  // Check if IP is currently locked out
  checkIpLockout(ipAddress, (err, isLocked) => {
    if (err) {
      console.error('Error checking IP lockout:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
    
    if (isLocked) {
      return res.status(429).json({ 
        error: 'Too many login attempts. Please try again later.' 
      });
    }
    
    // Check if account is locked
    checkAccountLockout(email, (err, isAccountLocked) => {
      if (err) {
        console.error('Error checking account lockout:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }
      
      if (isAccountLocked) {
        return res.status(429).json({ 
          error: 'Account temporarily locked due to too many failed login attempts. Please try again later.' 
        });
      }
      
      // If not locked, proceed to login attempt
      next();
    });
  });
};

/**
 * Check if IP address is currently locked out
 */
const checkIpLockout = (ipAddress, callback) => {
  const windowMinutes = authConfig.security.rateLimitWindow;
  const maxAttempts = authConfig.security.rateLimitMax;
  
  const query = `
    SELECT COUNT(*) as attempt_count
    FROM login_attempts
    WHERE ip_address = ?
    AND success = 0
    AND attempt_time > DATE_SUB(NOW(), INTERVAL ? MINUTE)
  `;
  
  db.query(query, [ipAddress, windowMinutes], (err, results) => {
    if (err) {
      return callback(err);
    }
    
    const attemptCount = results[0].attempt_count;
    return callback(null, attemptCount >= maxAttempts);
  });
};

/**
 * Check if user account is locked due to too many failed attempts
 */
const checkAccountLockout = (email, callback) => {
  // First check if user account is manually locked
  db.query(
    'SELECT is_locked, lock_expires_at FROM users WHERE email = ?',
    [email],
    (err, results) => {
      if (err) {
        return callback(err);
      }
      
      if (!results || results.length === 0) {
        // User not found, but don't reveal this information
        return callback(null, false);
      }
      
      const user = results[0];
      
      // If account is manually locked and lock hasn't expired
      if (user.is_locked && user.lock_expires_at && new Date(user.lock_expires_at) > new Date()) {
        return callback(null, true);
      }
      
      // Check for too many failed login attempts
      const attemptLimit = authConfig.security.loginAttemptLimit;
      const windowMinutes = authConfig.security.rateLimitWindow;
      
      const query = `
        SELECT COUNT(*) as failed_count
        FROM login_attempts
        WHERE email = ?
        AND success = 0
        AND attempt_time > DATE_SUB(NOW(), INTERVAL ? MINUTE)
      `;
      
      db.query(query, [email, windowMinutes], (err, results) => {
        if (err) {
          return callback(err);
        }
        
        const failedCount = results[0].failed_count;
        return callback(null, failedCount >= attemptLimit);
      });
    }
  );
};

/**
 * Record login attempt in the database
 */
const recordLoginAttempt = (email, ipAddress, success, userId = null, details = null) => {
  db.query(
    'INSERT INTO login_attempts (user_id, email, ip_address, success, attempt_details) VALUES (?, ?, ?, ?, ?)',
    [userId, email, ipAddress, success ? 1 : 0, details],
    (err) => {
      if (err) {
        console.error('Error recording login attempt:', err);
      }
      
      // If too many failed attempts, lock the account temporarily
      if (!success) {
        checkAndLockAccount(email);
      }
    }
  );
};

/**
 * Check if account needs to be locked due to multiple failed attempts
 */
const checkAndLockAccount = (email) => {
  const attemptLimit = authConfig.security.loginAttemptLimit;
  const windowMinutes = authConfig.security.rateLimitWindow;
  const lockoutMinutes = authConfig.security.loginLockoutTime;
  
  const query = `
    SELECT COUNT(*) as failed_count, u.id
    FROM login_attempts la
    JOIN users u ON la.email = u.email
    WHERE la.email = ?
    AND la.success = 0
    AND la.attempt_time > DATE_SUB(NOW(), INTERVAL ? MINUTE)
    GROUP BY u.id
  `;
  
  db.query(query, [email, windowMinutes], (err, results) => {
    if (err || !results || results.length === 0) {
      return;
    }
    
    const { failed_count, id } = results[0];
    
    if (failed_count >= attemptLimit) {
      // Lock the account temporarily
      const lockExpiresAt = new Date();
      lockExpiresAt.setMinutes(lockExpiresAt.getMinutes() + lockoutMinutes);
      
      db.query(
        'UPDATE users SET is_locked = 1, lock_reason = ?, lock_expires_at = ? WHERE id = ?',
        ['Too many failed login attempts', lockExpiresAt, id],
        (err) => {
          if (err) {
            console.error('Error locking account:', err);
          }
        }
      );
    }
  });
};

module.exports = {
  loginRateLimiter,
  recordLoginAttempt
};