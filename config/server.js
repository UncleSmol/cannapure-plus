const express = require('express');
const cors = require('cors');
const path = require('path');
require("dotenv").config();
const db = require("./database");

// Import authentication setup
const setupAuth = require('./auth/auth.setup');
// Import authentication routes
const authRoutes = require('./auth/auth.routes');

const app = express();

// CORS configuration - Updated to include port 5000 as well
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:5000', 'http://127.0.0.1:5000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Request logging middleware - Add this BEFORE other middleware
app.use((req, res, next) => {
  const start = Date.now();
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} - Request received`);
  console.log('Request headers:', JSON.stringify(req.headers));
  
  // For POST requests, log the body
  if (req.method === 'POST' && req.headers['content-type']?.includes('application/json')) {
    const originalJson = res.json;
    res.json = function(body) {
      console.log(`[${new Date().toISOString()}] Response for ${req.method} ${req.url}:`, 
        JSON.stringify(body).substring(0, 200) + (JSON.stringify(body).length > 200 ? '...' : ''));
      return originalJson.call(this, body);
    };
  }
  
  // Log response status when request completes
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} - Response: ${res.statusCode} (${duration}ms)`);
  });
  
  next();
});

// Middleware
app.use(express.json());

// Setup authentication system (includes Helmet and Passport)
setupAuth(app);

// Register authentication routes
app.use('/api/auth', authRoutes);

// Import authentication middleware
const { isAuthenticated } = require('./auth/middleware/auth.middleware');

// Log all registered routes
console.log('=== REGISTERED ROUTES ===');
console.log('/api/auth/* routes:');
authRoutes.stack.forEach(r => {
  if (r.route && r.route.path) {
    console.log(`  ${Object.keys(r.route.methods).join(', ').toUpperCase()} /api/auth${r.route.path}`);
  }
});

// Error handler middleware
app.use((err, req, res, next) => {
  console.error(`[${new Date().toISOString()}] Server error:`, err.stack);
  res.status(500).json({ error: 'An internal server error occurred' });
});

// Public routes
app.get("/api/test", async (req, res) => {
  try {
    db.query("SELECT 'Server is Running' AS message", (err, results) => {
      if (err) {
        console.error('Database test error:', err);
        return res.status(500).json({ error: err.message });
      }
      res.json(results);
    });
  } catch (error) {
    console.error('Test route error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Protected routes - require authentication
app.get('/api/all-strains', isAuthenticated, (req, res) => {
    // Sanitize response immediately on error
    const handleError = (err) => {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Failed to fetch strains' });
    };
    
    const query = `
        SELECT id, 'weekly_special' as category, strain_name, strain_type, price, measurement, description, image_url, store_location, thc, specials_tag 
        FROM weekly_specials
        UNION ALL
        SELECT id, 'normal' as category, strain_name, strain_type, price, measurement, description, image_url, store_location, thc, specials_tag 
        FROM normal_strains
        UNION ALL
        SELECT id, 'greenhouse' as category, strain_name, strain_type, price, measurement, description, image_url, store_location, thc, specials_tag 
        FROM greenhouse_strains
        UNION ALL
        SELECT id, 'indoor' as category, strain_name, strain_type, price, measurement, description, image_url, store_location, thc, specials_tag 
        FROM indoor_strains
        UNION ALL
        SELECT id, 'exotic' as category, strain_name, strain_type, price, measurement, description, image_url, store_location, thc, specials_tag 
        FROM exotic_tunnel_strains
        UNION ALL
        SELECT id, 'medical' as category, strain_name, strain_type, price, measurement, description, image_url, store_location, thc, specials_tag 
        FROM medical_strains
        UNION ALL
        SELECT id, 'prerolled' as category, strain_name, strain_type, price, measurement, description, image_url, store_location, thc, specials_tag 
        FROM pre_rolled
        UNION ALL
        SELECT id, 'extracts' as category, strain_name, strain_type, price, measurement, description, image_url, store_location, thc, specials_tag 
        FROM extracts_vapes
        UNION ALL
        SELECT id, 'edibles' as category, strain_name, strain_type, price, measurement, description, image_url, store_location, thc, specials_tag 
        FROM edibles
    `;

    // Make sure we don't try to process a null DB connection
    if (!db || typeof db.query !== 'function') {
        return handleError(new Error('Database connection not available'));
    }

    try {
        db.query(query, (err, results) => {
            if (err) {
                return handleError(err);
            }
            
            // Convert MySQL boolean values to JavaScript booleans
            const processedResults = results.map(item => ({
                ...item,
                // Convert MySQL tinyint(1) to JavaScript boolean
                specials_tag: item.specials_tag === 1 || item.specials_tag === true
            }));
            
            // Log the first few results for debugging
            console.log('Strains fetched, sample:', JSON.stringify(processedResults.slice(0, 2)));
            
            // Set proper content type and send the JSON response
            res.setHeader('Content-Type', 'application/json');
            res.json(processedResults);
        });
    } catch (error) {
        handleError(error);
    }
});



// Placeholder for membership routes
app.get('/api/membership', isAuthenticated, (req, res) => {
  // The user object is available in req.user thanks to the isAuthenticated middleware
  res.json({
    message: 'Membership data accessed successfully',
    user: {
      id: req.user.id,
      firstName: req.user.first_name,
      membership: req.user.membership_tier
    }
  });
});

// Add a route to check API health and configuration
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    serverPort: process.env.PORT || 5000,
    apiRoutes: {
      auth: {
        register: '/api/auth/register',
        login: '/api/auth/login'
      },
      data: {
        strains: '/api/all-strains',
        membership: '/api/membership'
      }
    }
  });
});

// Add a direct test route for auth endpoints
app.post('/api/direct-register-test', (req, res) => {
  console.log('Direct register test hit with body:', req.body);
  res.json({ 
    message: 'Direct register test successful',
    receivedData: req.body
  });
});

// Serve static files from the build directory (one level up from config)
app.use(express.static(path.join(__dirname, '..', 'build')));

// 404 handler - Add this BEFORE the catch-all route
app.use('/api/*', (req, res, next) => {
  console.error(`[${new Date().toISOString()}] 404 NOT FOUND: ${req.method} ${req.url}`);
  res.status(404).json({ 
    error: 'API endpoint not found',
    requestedUrl: req.url,
    availableEndpoints: {
      auth: ['/api/auth/register', '/api/auth/login'],
      public: ['/api/test', '/api/health'],
      protected: ['/api/all-strains', '/api/membership']
    }
  });
});

// Important: This catch-all route should come AFTER all API routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'build', 'index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`\n=== SERVER STARTED ===`);
    console.log(`Authentication system initialized`);
    console.log(`Server running on port ${PORT}`);
    console.log(`\n=== API ENDPOINTS ===`);
    console.log(`- Authentication: http://localhost:${PORT}/api/auth/*`);
    console.log(`- Health check: http://localhost:${PORT}/api/health`);
    console.log(`- Strains data: http://localhost:${PORT}/api/all-strains`);
    console.log(`\n=== ENVIRONMENT ===`);
    console.log(`NODE_ENV: ${process.env.NODE_ENV}`);
    console.log(`API URL: ${process.env.REACT_APP_API_URL || 'Not set'}`);
    console.log(`\n=== READY ===`);
});
