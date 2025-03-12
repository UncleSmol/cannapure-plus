/**
 * Helmet Security Configuration
 * Sets secure HTTP headers to protect against common web vulnerabilities
 */

const helmet = require('helmet');

/**
 * Configure and apply Helmet middleware with custom settings
 */
const configureHelmet = () => {
  return helmet({
    // Set strict Content Security Policy
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"], // Adjust based on your needs
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        imgSrc: ["'self'", 'data:', 'https://res.cloudinary.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        connectSrc: ["'self'", 'https://api.example.com'], // Adjust for your APIs
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
        formAction: ["'self'"],
        upgradeInsecureRequests: [],
      },
    },
    
    // Enable Cross-Origin-Embedder-Policy
    crossOriginEmbedderPolicy: false, // Set to true in production
    
    // Enable Cross-Origin-Opener-Policy
    crossOriginOpenerPolicy: true,
    
    // Enable Cross-Origin-Resource-Policy
    crossOriginResourcePolicy: { policy: 'same-site' },
    
    // DNS Prefetch Control
    dnsPrefetchControl: { allow: false },
    
    // Frameguard - Prevents clickjacking
    frameguard: { action: 'deny' },
    
    // Hide Powered-By
    hidePoweredBy: true,
    
    // HSTS - HTTP Strict Transport Security
    hsts: {
      maxAge: 15552000, // 180 days
      includeSubDomains: true,
      preload: true,
    },
    
    // IE No Open - Prevent IE from opening untrusted HTML
    ieNoOpen: true,
    
    // No Sniff - Prevents MIME type sniffing
    noSniff: true,
    
    // Origin Agent Cluster
    originAgentCluster: true,
    
    // Permitted Cross-Domain Policies
    permittedCrossDomainPolicies: { permittedPolicies: 'none' },
    
    // Referrer Policy
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    
    // XSS Protection
    xssFilter: true,
  });
};

module.exports = configureHelmet;