/**
 * Authentication Configuration
 * This file contains all configuration parameters for authentication
 */

module.exports = {
  // JWT Configuration
  jwt: {
    secret: process.env.JWT_SECRET || '9e38b8b6626a72ca7c7d9f3d1aa8f45e5e0b3dabf17aaf6eccd5255d3f98ac5f',
    accessTokenExpiry: '15m',  // 15 minutes
    refreshTokenExpiry: '7d',   // 7 days
  },
  
  // Password settings
  password: {
    saltRounds: parseInt(process.env.PASSWORD_SALT_ROUNDS) || 10,
    minLength: parseInt(process.env.PASSWORD_MIN_LENGTH) || 8
  },
  
  // Security settings
  security: {
    rateLimitWindow: parseInt(process.env.RATE_LIMIT_WINDOW) || 15, // minutes
    rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX) || 5, // attempts
    loginLockoutTime: parseInt(process.env.LOGIN_LOCKOUT_TIME) || 30, // minutes
    loginAttemptLimit: parseInt(process.env.LOGIN_ATTEMPT_LIMIT) || 5,
    csrfTokenExpiry: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
    sessionDuration: parseInt(process.env.SESSION_DURATION) || 86400, // 24 hours in seconds
  }
};