const jwt = require('jsonwebtoken');
const { logger } = require('../utils/logger');

/**
 * Middleware to verify JWT token from request headers
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
module.exports = function(req, res, next) {
  // Get token from header
  const authHeader = req.header('Authorization');
  
  // Log the auth header for debugging
  logger.debug(`Auth header received: ${authHeader ? 'Present' : 'Missing'}`);
  
  if (!authHeader) {
    logger.warn('No Authorization header found in request');
    return res.status(401).json({ message: 'No authorization token, access denied' });
  }

  // Check if it's a Bearer token
  if (!authHeader.startsWith('Bearer ')) {
    logger.warn('Authorization header is not a Bearer token');
    return res.status(401).json({ message: 'Invalid token format, must be Bearer token' });
  }

  // Extract the token
  const token = authHeader.split(' ')[1];
  
  if (!token) {
    logger.warn('Token is empty after Bearer prefix');
    return res.status(401).json({ message: 'Token is empty, access denied' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Log successful verification
    logger.debug(`Token verified successfully for user ID: ${decoded.id || decoded.userId}`);
    
    // Add user from payload to request object
    req.user = {
      id: decoded.id || decoded.userId, // Handle different token formats
      ...decoded
    };
    next();
  } catch (error) {
    logger.error('Token verification failed:', error);
    
    // Provide more specific error messages based on the error type
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token has expired, please login again' });
    } else if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token, please login again' });
    }
    
    return res.status(401).json({ message: 'Token is not valid, access denied' });
  }
};