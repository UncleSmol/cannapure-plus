/**
 * Token Utilities for Authentication
 * Handles JWT token generation, validation, and refresh functionality
 */
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// Environment variables with fallbacks
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-for-development';
const JWT_EXPIRY = process.env.JWT_EXPIRY || '1h';
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'your-refresh-secret-key-for-development';
const REFRESH_TOKEN_EXPIRY = process.env.REFRESH_TOKEN_EXPIRY || '7d';

/**
 * Generate access token for a user
 * @param {Object} user - User object
 * @returns {string} - JWT access token
 */
function generateAccessToken(user) {
  console.log(`[AUTH] Generating access token for user ID: ${user.id}`);
  
  const payload = {
    userId: user.id,
    email: user.email,
    firstName: user.first_name,
    lastName: user.last_name,
    membershipTier: user.membership_tier || 'BASIC',
    membershipStatus: user.membership_status || 'ACTIVE',
    accountStatus: user.account_status || 'ACTIVE',
    // Don't include sensitive information in the token
  };

  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRY });
}

/**
 * Generate refresh token for a user
 * @param {Object} user - User object
 * @returns {string} - JWT refresh token
 */
function generateRefreshToken(user) {
  console.log(`[AUTH] Generating refresh token for user ID: ${user.id}`);
  
  // For refresh tokens, include minimal information
  const payload = {
    userId: user.id,
    tokenVersion: user.token_version || 0, // Used for token revocation
    tokenType: 'refresh'
  };

  return jwt.sign(payload, REFRESH_TOKEN_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRY });
}

/**
 * Generate both access and refresh tokens
 * @param {Object} user - User object
 * @returns {Object} - Object containing both tokens
 */
function generateTokens(user) {
  return {
    accessToken: generateAccessToken(user),
    refreshToken: generateRefreshToken(user)
  };
}

/**
 * Verify access token
 * @param {string} token - JWT access token
 * @returns {Object|null} - Decoded token payload or null if invalid
 */
function verifyAccessToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    console.error('[AUTH] Access token verification failed:', error.message);
    return null;
  }
}

/**
 * Verify refresh token
 * @param {string} token - JWT refresh token
 * @returns {Object|null} - Decoded token payload or null if invalid
 */
function verifyRefreshToken(token) {
  try {
    return jwt.verify(token, REFRESH_TOKEN_SECRET);
  } catch (error) {
    console.error('[AUTH] Refresh token verification failed:', error.message);
    return null;
  }
}

/**
 * Decode token without verification (for debugging)
 * @param {string} token - JWT token
 * @returns {Object|null} - Decoded token payload or null if invalid
 */
function decodeToken(token) {
  try {
    return jwt.decode(token);
  } catch (error) {
    console.error('[AUTH] Token decoding failed:', error.message);
    return null;
  }
}

/**
 * Generate a secure random token for password reset
 * @returns {string} - Random token
 */
function generateResetToken() {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Extract token from authorization header
 * @param {string} authHeader - Authorization header
 * @returns {string|null} - Token or null if not found
 */
function extractTokenFromHeader(authHeader) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  return authHeader.split(' ')[1];
}

/**
 * Check if token is expired
 * @param {string} token - JWT token
 * @returns {boolean} - True if expired, false otherwise
 */
function isTokenExpired(token) {
  try {
    const decoded = jwt.decode(token);
    if (!decoded || !decoded.exp) {
      return true;
    }
    
    // exp is in seconds, Date.now() is in milliseconds
    return decoded.exp * 1000 < Date.now();
  } catch (error) {
    console.error('[AUTH] Error checking token expiration:', error.message);
    return true;
  }
}

/**
 * Get time until token expiration
 * @param {string} token - JWT token
 * @returns {number} - Seconds until expiration, 0 if expired
 */
function getTokenTimeRemaining(token) {
  try {
    const decoded = jwt.decode(token);
    if (!decoded || !decoded.exp) {
      return 0;
    }
    
    const expiryTime = decoded.exp * 1000; // Convert to milliseconds
    const currentTime = Date.now();
    
    return Math.max(0, Math.floor((expiryTime - currentTime) / 1000));
  } catch (error) {
    console.error('[AUTH] Error getting token time remaining:', error.message);
    return 0;
  }
}

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  generateTokens,
  verifyAccessToken,
  verifyRefreshToken,
  decodeToken,
  generateResetToken,
  extractTokenFromHeader,
  isTokenExpired,
  getTokenTimeRemaining
};