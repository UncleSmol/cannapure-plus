/**
 * Error handling middleware
 */
const errorHandler = (err, req, res, next) => {
  // Log the error details
  console.error('\n[ERROR] API Error:', err);
  console.error(`[ERROR] Request: ${req.method} ${req.originalUrl}`);
  
  if (req.body && Object.keys(req.body).length > 0) {
    console.error('[ERROR] Request body:', JSON.stringify(req.body, null, 2));
  }
  
  if (req.query && Object.keys(req.query).length > 0) {
    console.error('[ERROR] Query params:', req.query);
  }
  
  if (req.params && Object.keys(req.params).length > 0) {
    console.error('[ERROR] URL params:', req.params);
  }
  
  // If the error is already formatted (from our API functions)
  if (err.status && err.message) {
    console.error(`[ERROR] Sending ${err.status} response with message: ${err.message}`);
    return res.status(err.status).json({
      error: {
        message: err.message,
        code: err.code || 'UNKNOWN_ERROR'
      }
    });
  }

  // Database errors
  if (err.code === 'ER_DUP_ENTRY') {
    console.error('[ERROR] Database duplicate entry error');
    return res.status(409).json({
      error: {
        message: 'Duplicate entry found',
        code: 'DUPLICATE_ENTRY'
      }
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: {
        message: 'Invalid token',
        code: 'INVALID_TOKEN'
      }
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: {
        message: 'Token expired',
        code: 'TOKEN_EXPIRED'
      }
    });
  }

  // Default to 500 server error
  console.error('[ERROR] Sending 500 response for unhandled error');
  res.status(500).json({
    error: {
      message: process.env.NODE_ENV === 'production' 
        ? 'Internal server error' 
        : err.message || 'Internal server error',
      code: 'SERVER_ERROR'
    }
  });
};

module.exports = errorHandler;
