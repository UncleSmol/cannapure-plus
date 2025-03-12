/**
 * Authentication Setup
 * Initializes the complete authentication system
 */

const passport = require('passport');
const configureJwtStrategy = require('./strategies/jwt.strategy');
const configureHelmet = require('./middleware/helmet.middleware');

/**
 * Initialize all authentication components
 * @param {Express} app - Express application instance
 */
const setupAuth = (app) => {
  // Initialize Passport
  app.use(passport.initialize());
  
  // Configure JWT strategy
  configureJwtStrategy();
  
  // Configure Helmet security headers
  app.use(configureHelmet());
  
  // Log initialization
  console.log('Authentication system initialized');
  
  return app;
};

module.exports = setupAuth;