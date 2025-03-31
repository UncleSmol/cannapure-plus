/**
 * Auth CORS Troubleshooting Middleware
 * Special handling for authentication routes
 */

function authCorsMiddleware(req, res, next) {
  // Log request details for debugging
  console.log(`[AUTH CORS] Auth request: ${req.method} ${req.url}`);
  console.log(`[AUTH CORS] Origin: ${req.headers.origin}`);
  
  // Add CORS headers for all auth requests
  res.header('Access-Control-Allow-Origin', req.headers.origin || 'http://localhost:3000');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  // Handle preflight OPTIONS requests
  if (req.method === 'OPTIONS') {
    console.log('[AUTH CORS] Handling OPTIONS preflight request for auth');
    return res.status(204).end();
  }
  
  // For POST login/register requests, log some info (but not passwords)
  if ((req.url === '/login' || req.url === '/register') && req.method === 'POST') {
    console.log(`[AUTH CORS] Auth attempt: ${req.url} for ${req.body?.email || 'unknown'}`);
    
    // Fix potential issues with the body
    if (!req.body) {
      console.warn('[AUTH CORS] Request body is undefined - potential Content-Type issue');
    }
  }
  
  next();
}

module.exports = authCorsMiddleware;
