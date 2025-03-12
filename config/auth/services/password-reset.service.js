/**
 * Password Reset Service
 * Handles password reset functionality including token generation and validation
 */

const crypto = require('crypto');
const userService = require('./user.service');
const db = require('../../database');
const bcrypt = require('bcrypt');
const authConfig = require('../auth.config');

/**
 * Generate a password reset token for a user
 * @param {string} email - User's email address
 * @returns {Promise<Object>} - Object containing the reset token and user info
 */
const generatePasswordResetToken = async (email) => {
  try {
    // Find user by email
    const user = await userService.findUserByEmail(email);
    
    if (!user) {
      throw new Error('User not found');
    }
    
    // Generate a secure random token
    const resetToken = crypto.randomBytes(32).toString('hex');
    
    // Set token expiration (1 hour from now)
    const resetTokenExpires = new Date();
    resetTokenExpires.setHours(resetTokenExpires.getHours() + 1);
    
    // Store the token in the database
    await new Promise((resolve, reject) => {
      db.query(
        'UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE id = ?',
        [resetToken, resetTokenExpires, user.id],
        (err, results) => {
          if (err) {
            return reject(err);
          }
          resolve(results);
        }
      );
    });
    
    // Log this activity
    logPasswordResetRequest(user.id, 'unknown');
    
    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name
      },
      resetToken
    };
    
  } catch (error) {
    throw error;
  }
};

/**
 * Validate a password reset token
 * @param {string} token - The reset token to validate
 * @returns {Promise<Object>} - User object if token is valid
 */
const validateResetToken = async (token) => {
  try {
    // Find user with this token
    const user = await new Promise((resolve, reject) => {
      db.query(
        'SELECT * FROM users WHERE reset_token = ? AND reset_token_expires > NOW()',
        [token],
        (err, results) => {
          if (err) {
            return reject(err);
          }
          
          if (!results || results.length === 0) {
            return resolve(null);
          }
          
          resolve(results[0]);
        }
      );
    });
    
    if (!user) {
      throw new Error('Invalid or expired reset token');
    }
    
    return {
      id: user.id,
      email: user.email,
      firstName: user.first_name
    };
    
  } catch (error) {
    throw error;
  }
};

/**
 * Reset user password with a valid token
 * @param {string} token - The reset token
 * @param {string} newPassword - The new password
 * @returns {Promise<boolean>} - Success indicator
 */
const resetPassword = async (token, newPassword) => {
  try {
    // Validate the token first
    const user = await validateResetToken(token);
    
    if (!user) {
      throw new Error('Invalid or expired reset token');
    }
    
    // Hash the new password
    const hashedPassword = await userService.hashPassword(newPassword);
    
    // Update the password and clear the reset token
    await new Promise((resolve, reject) => {
      db.query(
        'UPDATE users SET password = ?, reset_token = NULL, reset_token_expires = NULL WHERE id = ?',
        [hashedPassword, user.id],
        (err, results) => {
          if (err) {
            return reject(err);
          }
          resolve(results);
        }
      );
    });
    
    // Log this activity
    logPasswordChange(user.id, 'unknown', 'reset_token');
    
    return true;
    
  } catch (error) {
    throw error;
  }
};

/**
 * Log password reset request
 * @param {number} userId - User ID
 * @param {string} ipAddress - IP address of the requester
 */
const logPasswordResetRequest = (userId, ipAddress) => {
  db.query(
    'INSERT INTO user_activity_logs (user_id, activity_type, ip_address, activity_details) VALUES (?, ?, ?, ?)',
    [userId, 'PASSWORD_CHANGE', ipAddress, 'Password reset requested'],
    (err) => {
      if (err) {
        console.error('Error logging password reset request:', err);
      }
    }
  );
};

/**
 * Log password change
 * @param {number} userId - User ID
 * @param {string} ipAddress - IP address of the requester
 * @param {string} method - Method used to change password (reset_token, current_password)
 */
const logPasswordChange = (userId, ipAddress, method) => {
  db.query(
    'INSERT INTO user_activity_logs (user_id, activity_type, ip_address, activity_details) VALUES (?, ?, ?, ?)',
    [userId, 'PASSWORD_CHANGE', ipAddress, `Password changed via ${method}`],
    (err) => {
      if (err) {
        console.error('Error logging password change:', err);
      }
    }
  );
};

module.exports = {
  generatePasswordResetToken,
  validateResetToken,
  resetPassword
};