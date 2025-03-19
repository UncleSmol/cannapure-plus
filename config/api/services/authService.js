/**
 * Authentication Service
 * Handles user registration, login, token management, and other authentication operations
 */
const bcrypt = require('bcrypt');
const tokenUtils = require('../utils/tokenUtils');
const db = require('../../database');

// Constants
const SALT_ROUNDS = 10;
const MAX_FAILED_ATTEMPTS = 5;
const LOCK_DURATION_MINUTES = 30;

/**
 * Register a new user
 * @param {Object} userData - User registration data
 * @returns {Promise<Object>} - Newly created user
 */
async function registerUser(userData) {
  console.log('[AUTH SERVICE] Registering new user');
  
  try {
    // Validate required fields
    const requiredFields = ['email', 'password', 'first_name', 'last_name', 'id_number', 'phone_number'];
    for (const field of requiredFields) {
      if (!userData[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }
    
    // Check if email already exists
    const [existingUsers] = await db.query(
      'SELECT id FROM users WHERE email = ?',
      [userData.email]
    );
    
    if (existingUsers.length > 0) {
      throw new Error('Email already registered');
    }
    
    // Check if ID number already exists
    const [existingIds] = await db.query(
      'SELECT id FROM users WHERE id_number = ?',
      [userData.id_number]
    );
    
    if (existingIds.length > 0) {
      throw new Error('ID number already registered');
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(userData.password, SALT_ROUNDS);
    
    // Insert new user
    const [result] = await db.query(
      `INSERT INTO users (
        email, password, first_name, last_name, id_number, phone_number, 
        address, account_status, created_at, updated_at, membership_tier, 
        membership_status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW(), ?, ?)`,
      [
        userData.email,
        hashedPassword,
        userData.first_name,
        userData.last_name,
        userData.id_number,
        userData.phone_number,
        userData.address || null,
        'PENDING', // New accounts start as pending until verified
        'BASIC', // Default membership tier
        'ACTIVE' // Default membership status
      ]
    );
    
    const userId = result.insertId;
    
    // Get the newly created user
    const [users] = await db.query(
      `SELECT id, email, first_name, last_name, account_status, 
       membership_tier, membership_status, created_at 
       FROM users WHERE id = ?`,
      [userId]
    );
    
    if (users.length === 0) {
      throw new Error('Failed to retrieve created user');
    }
    
    const newUser = users[0];
    
    // Log the registration
    await logUserActivity(userId, 'REGISTRATION', {
      email: userData.email,
      ip: userData.ip || 'unknown',
      userAgent: userData.userAgent || 'unknown'
    });
    
    console.log(`[AUTH SERVICE] User registered successfully with ID: ${userId}`);
    
    return {
      user: newUser,
      message: 'Registration successful'
    };
  } catch (error) {
    console.error('[AUTH SERVICE] Registration error:', error.message);
    throw error;
  }
}

/**
 * Authenticate a user
 * @param {string} email - User email
 * @param {string} password - User password
 * @param {Object} requestInfo - Information about the request
 * @returns {Promise<Object>} - Authentication result with tokens
 */
async function loginUser(email, password, requestInfo = {}) {
  console.log(`[AUTH SERVICE] Login attempt for email: ${email}`);
  
  try {
    // Get user by email
    const [users] = await db.query(
      `SELECT id, email, password, first_name, last_name, account_status, 
       membership_tier, membership_status, failed_login_attempts, 
       is_locked, lock_expires_at 
       FROM users WHERE email = ?`,
      [email]
    );
    
    if (users.length === 0) {
      // Log failed login attempt for non-existent user
      await logLoginAttempt(null, email, false, requestInfo, 'User not found');
      throw new Error('Invalid email or password');
    }
    
    const user = users[0];
    
    // Check if account is locked
    if (user.is_locked) {
      const lockExpiry = new Date(user.lock_expires_at);
      if (lockExpiry > new Date()) {
        // Account is still locked
        const minutesRemaining = Math.ceil((lockExpiry - new Date()) / (60 * 1000));
        
        await logLoginAttempt(user.id, email, false, requestInfo, 'Account locked');
        
        throw new Error(`Account is locked. Try again in ${minutesRemaining} minutes.`);
      } else {
        // Lock has expired, reset lock and failed attempts
        await db.query(
          'UPDATE users SET is_locked = 0, failed_login_attempts = 0 WHERE id = ?',
          [user.id]
        );
      }
    }
    
    // Check if account is active
    if (user.account_status !== 'ACTIVE' && user.account_status !== 'PENDING') {
      await logLoginAttempt(user.id, email, false, requestInfo, `Account status: ${user.account_status}`);
      throw new Error(`Your account is ${user.account_status.toLowerCase()}. Please contact support.`);
    }
    
    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.password);
    
    if (!passwordMatch) {
      // Increment failed login attempts
      const failedAttempts = (user.failed_login_attempts || 0) + 1;
      
      // Check if we should lock the account
      if (failedAttempts >= MAX_FAILED_ATTEMPTS) {
        // Lock the account
        const lockExpiresAt = new Date();
        lockExpiresAt.setMinutes(lockExpiresAt.getMinutes() + LOCK_DURATION_MINUTES);
        
        await db.query(
          'UPDATE users SET failed_login_attempts = ?, is_locked = 1, lock_reason = ?, lock_expires_at = ? WHERE id = ?',
          [failedAttempts, 'Too many failed login attempts', lockExpiresAt, user.id]
        );
        
        await logLoginAttempt(user.id, email, false, requestInfo, 'Account locked due to too many failed attempts');
        
        throw new Error(`Too many failed login attempts. Account locked for ${LOCK_DURATION_MINUTES} minutes.`);
      } else {
        // Just increment the counter
        await db.query(
          'UPDATE users SET failed_login_attempts = ?, last_login_attempt = NOW() WHERE id = ?',
          [failedAttempts, user.id]
        );
        
        await logLoginAttempt(user.id, email, false, requestInfo, 'Invalid password');
        
        throw new Error('Invalid email or password');
      }
    }
    
    // Login successful - reset failed attempts
    await db.query(
      'UPDATE users SET failed_login_attempts = 0, last_login = NOW(), last_login_ip = ?, device_fingerprint = ? WHERE id = ?',
      [requestInfo.ip || 'unknown', requestInfo.userAgent || 'unknown', user.id]
    );
    
    // Generate tokens
    const tokens = tokenUtils.generateTokens(user);
    
    // Store refresh token in database
    await storeRefreshToken(user.id, tokens.refreshToken, requestInfo);
    
    // Log successful login
    await logLoginAttempt(user.id, email, true, requestInfo, 'Login successful');
    
    // Log user activity
    await logUserActivity(user.id, 'LOGIN', requestInfo);
    
    console.log(`[AUTH SERVICE] Login successful for user ID: ${user.id}`);
    
    // Remove sensitive information
    delete user.password;
    delete user.failed_login_attempts;
    delete user.is_locked;
    delete user.lock_expires_at;
    
    return {
      user,
      tokens,
      message: 'Login successful'
    };
  } catch (error) {
    console.error('[AUTH SERVICE] Login error:', error.message);
    throw error;
  }
}

/**
 * Refresh access token using refresh token
 * @param {string} refreshToken - Refresh token
 * @param {Object} requestInfo - Information about the request
 * @returns {Promise<Object>} - New tokens
 */
async function refreshToken(refreshToken, requestInfo = {}) {
  console.log('[AUTH SERVICE] Refreshing token');
  
  try {
    // Verify refresh token
    const decoded = tokenUtils.verifyRefreshToken(refreshToken);
    if (!decoded) {
      throw new Error('Invalid refresh token');
    }
    
    // Check if token exists in database
    const [sessions] = await db.query(
      'SELECT id, user_id, is_valid FROM user_sessions WHERE session_token = ?',
      [refreshToken]
    );
    
    if (sessions.length === 0) {
      throw new Error('Refresh token not found');
    }
    
    const session = sessions[0];
    
    // Check if token is valid
    if (!session.is_valid) {
      throw new Error('Refresh token has been revoked');
    }
    
    // Get user
    const [users] = await db.query(
      `SELECT id, email, first_name, last_name, account_status, 
       membership_tier, membership_status 
       FROM users WHERE id = ?`,
      [session.user_id]
    );
    
    if (users.length === 0) {
      throw new Error('User not found');
    }
    
    const user = users[0];
    
    // Check if account is active
    if (user.account_status !== 'ACTIVE') {
      throw new Error(`Your account is ${user.account_status.toLowerCase()}. Please contact support.`);
    }
    
    // Generate new tokens
    const newTokens = tokenUtils.generateTokens(user);
    
    // Update refresh token in database
    await db.query(
      'UPDATE user_sessions SET session_token = ?, updated_at = NOW() WHERE id = ?',
      [newTokens.refreshToken, session.id]
    );
    
    // Log token refresh
    await logUserActivity(user.id, 'TOKEN_REFRESH', requestInfo);
    
    console.log(`[AUTH SERVICE] Token refreshed for user ID: ${user.id}`);
    
    return {
      tokens: newTokens,
      message: 'Token refreshed successfully'
    };
  } catch (error) {
    console.error('[AUTH SERVICE] Token refresh error:', error.message);
    throw error;
  }
}

/**
 * Logout user by invalidating refresh token
 * @param {string} refreshToken - Refresh token
 * @param {Object} requestInfo - Information about the request
 * @returns {Promise<Object>} - Logout result
 */
async function logoutUser(refreshToken, requestInfo = {}) {
  console.log('[AUTH SERVICE] Logging out user');
  
  try {
    if (!refreshToken) {
      throw new Error('Refresh token is required');
    }
    
    // Verify refresh token
    const decoded = tokenUtils.verifyRefreshToken(refreshToken);
    if (!decoded) {
      throw new Error('Invalid refresh token');
    }
    
    // Invalidate token in database
    const [result] = await db.query(
      'UPDATE user_sessions SET is_valid = 0 WHERE session_token = ?',
      [refreshToken]
    );
    
    if (result.affectedRows === 0) {
      throw new Error('Refresh token not found');
    }
    
    // Log logout
    await logUserActivity(decoded.userId, 'LOGOUT', requestInfo);
    
    console.log(`[AUTH SERVICE] Logout successful for user ID: ${decoded.userId}`);
    
    return {
      message: 'Logout successful'
    };
  } catch (error) {
    console.error('[AUTH SERVICE] Logout error:', error.message);
    throw error;
  }
}

/**
 * Get user profile
 * @param {number} userId - User ID
 * @returns {Promise<Object>} - User profile
 */
async function getUserProfile(userId) {
  console.log(`[AUTH SERVICE] Getting profile for user ID: ${userId}`);
  
  try {
    const [users] = await db.query(
      `SELECT id, email, first_name, last_name, id_number, phone_number, 
       address, cpNumber, cp_status, account_status, membership_tier, 
       membership_status, membership_start_date, active_days, 
       days_to_next_tier, last_active_date, created_at 
       FROM users WHERE id = ?`,
      [userId]
    );
    
    if (users.length === 0) {
      throw new Error('User not found');
    }
    
    const user = users[0];
    
    console.log(`[AUTH SERVICE] Profile retrieved for user ID: ${userId}`);
    
    return {
      user,
      message: 'Profile retrieved successfully'
    };
  } catch (error) {
    console.error('[AUTH SERVICE] Get profile error:', error.message);
    throw error;
  }
}

/**
 * Update user profile
 * @param {number} userId - User ID
 * @param {Object} userData - User data to update
 * @returns {Promise<Object>} - Updated user profile
 */
async function updateUserProfile(userId, userData) {
  console.log(`[AUTH SERVICE] Updating profile for user ID: ${userId}`);
  
  try {
    // Fields that can be updated
    const allowedFields = ['first_name', 'last_name', 'phone_number', 'address'];
    
    // Build update query
    let updateFields = [];
    let updateValues = [];
    
    for (const field of allowedFields) {
      if (userData[field] !== undefined) {
        updateFields.push(`${field} = ?`);
        updateValues.push(userData[field]);
      }
    }
    
    if (updateFields.length === 0) {
      throw new Error('No valid fields to update');
    }
    
    // Add user ID to values
    updateValues.push(userId);
    
    // Execute update
    const [result] = await db.query(
      `UPDATE users SET ${updateFields.join(', ')}, updated_at = NOW() WHERE id = ?`,
      updateValues
    );
    
    if (result.affectedRows === 0) {
      throw new Error('User not found');
    }
    
    // Get updated user
    const [users] = await db.query(
      `SELECT id, email, first_name, last_name, id_number, phone_number, 
       address, cpNumber, cp_status, account_status, membership_tier, 
       membership_status, membership_start_date, active_days, 
       days_to_next_tier, last_active_date, created_at, updated_at 
       FROM users WHERE id = ?`,
      [userId]
    );
    
    if (users.length === 0) {
      throw new Error('Failed to retrieve updated user');
    }
    
    const updatedUser = users[0];
    
    console.log(`[AUTH SERVICE] Profile updated for user ID: ${userId}`);
    
    return {
      user: updatedUser,
      message: 'Profile updated successfully'
    };
  } catch (error) {
    console.error('[AUTH SERVICE] Update profile error:', error.message);
    throw error;
  }
}

/**
 * Request password reset
 * @param {string} email - User email
 * @returns {Promise<Object>} - Password reset result
 */
async function requestPasswordReset(email) {
  console.log(`[AUTH SERVICE] Password reset requested for email: ${email}`);
  
  try {
    // Get user by email
    const [users] = await db.query(
      'SELECT id, email, first_name FROM users WHERE email = ?',
      [email]
    );
    
    if (users.length === 0) {
      // Don't reveal that the email doesn't exist
      return {
        message: 'If your email is registered, you will receive a password reset link'
      };
    }
    
    const user = users[0];
    
    // Generate reset token
    const resetToken = tokenUtils.generateResetToken();
    
    // Set expiration (24 hours from now)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);
    
    // Store token in database
    await db.query(
      'UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE id = ?',
      [resetToken, expiresAt, user.id]
    );
    
    // In a real implementation, you would send an email with the reset link
    // For now, we'll just log it
    console.log(`[AUTH SERVICE] Reset token for ${email}: ${resetToken}`);
    console.log(`[AUTH SERVICE] Reset link would be: https://yourdomain.com/reset-password?token=${resetToken}`);
    
    // Log the reset request
    await logUserActivity(user.id, 'PASSWORD_RESET_REQUEST', {
      email: email
    });
    
    return {
      message: 'If your email is registered, you will receive a password reset link'
    };
  } catch (error) {
    console.error('[AUTH SERVICE] Password reset request error:', error.message);
    throw error;
  }
}

/**
 * Reset password using token
 * @param {string} token - Reset token
 * @param {string} newPassword - New password
 * @returns {Promise<Object>} - Password reset result
 */
async function resetPassword(token, newPassword) {
  console.log('[AUTH SERVICE] Resetting password with token');
  
  try {
    // Find user with this reset token
    const [users] = await db.query(
      'SELECT id, email, reset_token_expires FROM users WHERE reset_token = ?',
      [token]
    );
    
    if (users.length === 0) {
      throw new Error('Invalid or expired reset token');
    }
    
    const user = users[0];
    
    // Check if token is expired
    const expiresAt = new Date(user.reset_token_expires);
    if (expiresAt < new Date()) {
      throw new Error('Reset token has expired');
    }
    
    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
    
    // Update password and clear reset token
    await db.query(
      'UPDATE users SET password = ?, reset_token = NULL, reset_token_expires = NULL, updated_at = NOW() WHERE id = ?',
      [hashedPassword, user.id]
    );
    
    // Invalidate all existing sessions for this user
    await db.query(
      'UPDATE user_sessions SET is_valid = 0 WHERE user_id = ?',
      [user.id]
    );
    
    // Log the password reset
    await logUserActivity(user.id, 'PASSWORD_RESET', {
      email: user.email
    });
    
    console.log(`[AUTH SERVICE] Password reset successful for user ID: ${user.id}`);
    
    return {
      message: 'Password has been reset successfully'
    };
  } catch (error) {
    console.error('[AUTH SERVICE] Password reset error:', error.message);
    throw error;
  }
}

/**
 * Change password
 * @param {number} userId - User ID
 * @param {string} currentPassword - Current password
 * @param {string} newPassword - New password
 * @returns {Promise<Object>} - Password change result
 */
async function changePassword(userId, currentPassword, newPassword) {
  console.log(`[AUTH SERVICE] Changing password for user ID: ${userId}`);
  
  try {
    // Get user
    const [users] = await db.query(
      'SELECT id, email, password FROM users WHERE id = ?',
      [userId]
    );
    
    if (users.length === 0) {
      throw new Error('User not found');
    }
    
    const user = users[0];
    
    // Verify current password
    const passwordMatch = await bcrypt.compare(currentPassword, user.password);
    
    if (!passwordMatch) {
      throw new Error('Current password is incorrect');
    }
    
    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
    
    // Update password
    await db.query(
      'UPDATE users SET password = ?, updated_at = NOW() WHERE id = ?',
      [hashedPassword, userId]
    );
    
    // Invalidate all existing sessions except the current one
    // In a real implementation, you would pass the current session ID to keep it valid
    
    // Log the password change
    await logUserActivity(userId, 'PASSWORD_CHANGE', {
      email: user.email
    });
    
    console.log(`[AUTH SERVICE] Password changed successfully for user ID: ${userId}`);
    
    return {
      message: 'Password changed successfully'
    };
  } catch (error) {
    console.error('[AUTH SERVICE] Password change error:', error.message);
    throw error;
  }
}

/**
 * Store refresh token in database
 * @param {number} userId - User ID
 * @param {string} refreshToken - Refresh token
 * @param {Object} requestInfo - Information about the request
 * @returns {Promise<void>}
 */
async function storeRefreshToken(userId, refreshToken, requestInfo = {}) {
  try {
    // Set expiration (7 days from now or as configured)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // Default to 7 days
    
    // Store in database
    await db.query(
      `INSERT INTO user_sessions (
        user_id, session_token, device_info, ip_address, 
        created_at, expires_at, is_valid
      ) VALUES (?, ?, ?, ?, NOW(), ?, 1)`,
      [
        userId,
        refreshToken,
        requestInfo.userAgent || 'unknown',
        requestInfo.ip || 'unknown',
        expiresAt
      ]
    );
    
    console.log(`[AUTH SERVICE] Refresh token stored for user ID: ${userId}`);
  } catch (error) {
    console.error('[AUTH SERVICE] Error storing refresh token:', error.message);
    throw error;
  }
}

/**
 * Log login attempt
 * @param {number|null} userId - User ID (null if user not found)
 * @param {string} email - Email used in login attempt
 * @param {boolean} success - Whether login was successful
 * @param {Object} requestInfo - Information about the request
 * @param {string} details - Additional details
 * @returns {Promise<void>}
 */
async function logLoginAttempt(userId, email, success, requestInfo = {}, details = '') {
  try {
    await db.query(
      `INSERT INTO login_attempts (
        user_id, email, ip_address, attempt_time, 
        success, attempt_details
      ) VALUES (?, ?, ?, NOW(), ?, ?)`,
      [
        userId,
        email,
        requestInfo.ip || 'unknown',
        success ? 1 : 0,
        details
      ]
    );
    
    console.log(`[AUTH SERVICE] Login attempt logged for email: ${email}, success: ${success}`);
  } catch (error) {
    console.error('[AUTH SERVICE] Error logging login attempt:', error.message);
    // Non-blocking - don't throw error
  }
}

/**
 * Log user activity
 * @param {number} userId - User ID
 * @param {string} activityType - Type of activity
 * @param {Object} requestInfo - Information about the request
 * @returns {Promise<void>}
 */
async function logUserActivity(userId, activityType, requestInfo = {}) {
  try {
    await db.query(
      `INSERT INTO user_activity_logs (
        user_id, activity_type, ip_address, 
        device_info, activity_details, created_at
      ) VALUES (?, ?, ?, ?, ?, NOW())`,
      [
        userId,
        activityType,
        requestInfo.ip || 'unknown',
        requestInfo.userAgent || 'unknown',
        JSON.stringify(requestInfo)
      ]
    );
    
    console.log(`[AUTH SERVICE] Activity logged for user ID: ${userId}, type: ${activityType}`);
  } catch (error) {
    console.error('[AUTH SERVICE] Error logging user activity:', error.message);
    // Non-blocking - don't throw error
  }
}

module.exports = {
  registerUser,
  loginUser,
  refreshToken,
  logoutUser,
  getUserProfile,
  updateUserProfile,
  requestPasswordReset,
  resetPassword,
  changePassword
};