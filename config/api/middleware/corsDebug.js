/**
 * CORS Debug Middleware
 * Logs CORS-related information and ensures CORS headers are properly set
 */

function corsDebugMiddleware(req, res, next) {
  // Log request information
  console.log(`[CORS DEBUG] ${req.method} ${req.url}`);
  console.log('[CORS DEBUG] Origin:', req.headers.origin);
  console.log('[CORS DEBUG] Headers:', JSON.stringify(req.headers));

  // Manually set CORS headers for extra safety
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS,PATCH');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, X-Force-Refresh, Cache-Control, Accept, Origin, Access-Control-Allow-Origin');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Expose-Headers', 'X-API-Version, X-Response-Time, ETag, Last-Modified');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    console.log('[CORS DEBUG] Handling OPTIONS preflight request');
    return res.status(200).end();
  }

  next();
}

module.exports = corsDebugMiddleware;
