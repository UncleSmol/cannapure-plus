/**
 * Authentication Middleware
 * Handles JWT token verification and role-based access control
 */
const tokenUtils = require('../utils/tokenUtils');
const db = require('../../database');

/**
 * Middleware to verify JWT token
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const verifyToken = async (req, res, next) => {
  console.log('[AUTH] Verifying token');
  
  // For development, you can bypass authentication
  if (process.env.NODE_ENV === 'development' && process.env.BYPASS_AUTH === 'true') {
    console.log('[AUTH] Authentication bypassed in development mode');
    req.user = { id: 1, role: 'admin' }; // Mock user
    return next();
  }
  
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    console.log('[AUTH] No authorization header found');
    return res.status(401).json({ 
      error: { 
        message: 'Authorization header missing', 
        code: 'AUTH_HEADER_MISSING' 
      } 
    });
  }

  const token = tokenUtils.extractTokenFromHeader(authHeader);
  if (!token) {
    console.log('[AUTH] No token found in authorization header');
    return res.status(401).json({ 
      error: { 
        message: 'Token missing', 
        code: 'TOKEN_MISSING' 
      } 
    });
  }

  // Verify the token
  const decoded = tokenUtils.verifyAccessToken(token);
  if (!decoded) {
    return res.status(401).json({ 
      error: { 
        message: 'Invalid token', 
        code: 'INVALID_TOKEN' 
      } 
    });
  }

  // Check if token is expired
  if (tokenUtils.isTokenExpired(token)) {
    return res.status(401).json({ 
      error: { 
        message: 'Token expired', 
        code: 'TOKEN_EXPIRED' 
      } 
    });
  }

  // For now, we'll just use the decoded token info
  // In a real implementation, you would validate against the database
  console.log(`[AUTH] Successfully authenticated user ID: ${decoded.userId}`);
  req.user = {
    id: decoded.userId,
    email: decoded.email,
    role: decoded.role || 'user'
  };
  
  next();
};

/**
 * Check if user has required role
 * @param {string} role - Required role
 * @returns {Function} - Express middleware
 */
const requireRole = (role) => {
  return (req, res, next) => {
    console.log(`[AUTH] Checking if user has role: ${role}`);
    
    if (!req.user) {
      console.log('[AUTH] No user found in request');
      return res.status(401).json({ 
        error: { message: 'Authentication required', code: 'AUTH_REQUIRED' } 
      });
    }
    
    if (req.user.role !== role && req.user.role !== 'admin') {
      console.log(`[AUTH] User role ${req.user.role} does not match required role ${role}`);
      return res.status(403).json({ 
        error: { message: 'Insufficient permissions', code: 'INSUFFICIENT_PERMISSIONS' } 
      });
    }
    
    console.log('[AUTH] Role check passed');
    next();
  };
};

/**
 * Middleware to check if user has any of the required roles
 * @param {Array} roles - Array of allowed roles
 * @returns {Function} - Express middleware
 */
const requireAnyRole = (roles) => {
  return (req, res, next) => {
    console.log(`[AUTH] Checking if user has any of roles: ${roles.join(', ')}`);
    
    if (!req.user) {
      console.log('[AUTH] No user found in request');
      return res.status(401).json({ 
        error: { message: 'Authentication required', code: 'AUTH_REQUIRED' } 
      });
    }
    
    // Admin always has access
    if (req.user.role === 'admin') {
      console.log('[AUTH] User is admin, access granted');
      return next();
    }
    
    if (!roles.includes(req.user.role)) {
      console.log(`[AUTH] User role ${req.user.role} not in allowed roles: ${roles.join(', ')}`);
      return res.status(403).json({ 
        error: { 
          message: 'Insufficient permissions', 
          code: 'INSUFFICIENT_PERMISSIONS',
          requiredRoles: roles,
          currentRole: req.user.role
        } 
      });
    }
    
    console.log('[AUTH] Role check passed');
    next();
  };
};

/**
 * Record user activity for auditing (placeholder function)
 * @param {number} userId - User ID
 * @param {string} activityType - Type of activity
 * @param {Object} req - Express request object
 */
const recordUserActivity = (userId, activityType, req) => {
  // This is a placeholder - in a real implementation, you would log to database
  console.log(`[AUTH] User activity: ${activityType} for user ID: ${userId}`);
  console.log(`[AUTH] Path: ${req.method} ${req.path}`);
};

module.exports = {
  verifyToken,
  requireRole,
  requireAnyRole,
  recordUserActivity,
  generateToken: tokenUtils.generateToken
};
