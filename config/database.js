const mysql = require('mysql2');
require('dotenv').config();

// Configuration
const DB_CONFIG = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    connectionLimit: process.env.DB_CONNECTION_LIMIT || 10,
    queueLimit: process.env.DB_QUEUE_LIMIT || 0,
    waitForConnections: process.env.DB_WAIT_FOR_CONNECTIONS === 'true',
    // Add query timeout configuration
    connectTimeout: process.env.DB_CONNECT_TIMEOUT || 10000, // 10 seconds
    acquireTimeout: process.env.DB_ACQUIRE_TIMEOUT || 10000, // 10 seconds
    timeout: process.env.DB_QUERY_TIMEOUT || 30000 // 30 seconds for queries
};

// Health check configuration
const HEALTH_CHECK_INTERVAL = process.env.DB_HEALTH_CHECK_INTERVAL || 60000; // 1 minute
const MAX_CONNECTION_AGE = process.env.DB_MAX_CONNECTION_AGE || 3600000; // 1 hour

// Create connection pool
const pool = mysql.createPool(DB_CONFIG);

// Create a promise wrapper for the pool
const db = pool.promise();

// Connection state tracking
let isConnected = false;
let lastConnectionCheck = Date.now();
let connectionAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;

// Simple query cache
const queryCache = {
    cache: new Map(),
    
    // Set a cached query result with TTL
    set: function(key, data, ttl = 60000) { // Default TTL: 1 minute
        this.cache.set(key, {
            data,
            timestamp: Date.now(),
            ttl
        });
        console.log(`[DB CACHE] Cached query result for key: ${key.substring(0, 50)}... (TTL: ${ttl}ms)`);
    },
    
    // Get a cached query result if not expired
    get: function(key) {
        if (!this.cache.has(key)) {
            return null;
        }
        
        const cached = this.cache.get(key);
        const age = Date.now() - cached.timestamp;
        
        if (age > cached.ttl) {
            console.log(`[DB CACHE] Cache expired for key: ${key.substring(0, 50)}... (Age: ${age}ms, TTL: ${cached.ttl}ms)`);
            this.cache.delete(key);
            return null;
        }
        
        console.log(`[DB CACHE] Cache hit for key: ${key.substring(0, 50)}... (Age: ${age}ms)`);
        return cached.data;
    },
    
    // Invalidate a specific cache entry
    invalidate: function(key) {
        if (this.cache.has(key)) {
            this.cache.delete(key);
            console.log(`[DB CACHE] Invalidated cache for key: ${key.substring(0, 50)}...`);
            return true;
        }
        return false;
    },
    
    // Invalidate all cache entries
    clear: function() {
        const count = this.cache.size;
        this.cache.clear();
        console.log(`[DB CACHE] Cleared entire cache (${count} entries)`);
    },
    
    // Get cache statistics
    stats: function() {
        return {
            size: this.cache.size,
            keys: Array.from(this.cache.keys())
        };
    }
};

// Test the database connection
function testConnection() {
    console.log(`[DB] Testing database connection...`);
    lastConnectionCheck = Date.now();
    
    return new Promise((resolve, reject) => {
        pool.getConnection((err, connection) => {
            if (err) {
                isConnected = false;
                connectionAttempts++;
                
                console.error(`[DB] Connection failed (attempt ${connectionAttempts}/${MAX_RECONNECT_ATTEMPTS}):`, err.message);
                
                // Specific error handling for common MySQL errors
                if (err.code === 'ECONNREFUSED') {
                    console.error('[DB] Cannot connect to MySQL server. Make sure it is running.');
                } else if (err.code === 'ER_ACCESS_DENIED_ERROR') {
                    console.error('[DB] Access denied: Check your MySQL username and password');
                } else if (err.code === 'ER_BAD_DB_ERROR') {
                    console.error('[DB] Database does not exist: Check your database name');
                }
                
                reject(err);
                return;
            }
            
            isConnected = true;
            connectionAttempts = 0;
            console.log('[DB] Successfully connected to MySQL Database');
            
            // Check connection age and refresh if needed
            const connectionId = connection.threadId;
            console.log(`[DB] Using connection ID: ${connectionId}`);
            
            connection.release(); // Always release the connection when done
            resolve(true);
        });
    });
}

// Initial connection test
testConnection()
    .then(() => {
        console.log('[DB] Initial connection test successful');
    })
    .catch(err => {
        console.error('[DB] Initial connection test failed:', err.message);
    });

// Periodic health check
setInterval(() => {
    console.log(`[DB] Running periodic health check (${new Date().toISOString()})`);
    
    // Only run health check if we haven't checked recently
    const timeSinceLastCheck = Date.now() - lastConnectionCheck;
    if (timeSinceLastCheck < HEALTH_CHECK_INTERVAL / 2) {
        console.log(`[DB] Skipping health check, last check was ${timeSinceLastCheck}ms ago`);
        return;
    }
    
    // If we've exceeded max reconnection attempts, wait longer
    if (connectionAttempts >= MAX_RECONNECT_ATTEMPTS) {
        console.log(`[DB] Max reconnection attempts (${MAX_RECONNECT_ATTEMPTS}) reached, waiting longer before retry`);
        connectionAttempts = 0; // Reset counter to allow future attempts
        return;
    }
    
    testConnection()
        .then(() => {
            // If connection was previously down, clear cache on reconnect
            if (!isConnected) {
                console.log('[DB] Connection restored, clearing query cache');
                queryCache.clear();
            }
        })
        .catch(err => {
            console.error('[DB] Health check failed:', err.message);
        });
}, HEALTH_CHECK_INTERVAL);

// Handle pool errors to prevent app crashes
pool.on('error', (err) => {
    console.error('[DB] Pool error:', err.message);
    isConnected = false;
    
    // If the connection was refused, the server might be down
    if (err.code === 'ECONNREFUSED') {
        console.error('[DB] Lost connection to MySQL server. Will attempt reconnect on next health check.');
    }
});

// Log connection acquisition and release for debugging
pool.on('acquire', function (connection) {
    console.log(`[DB] Connection ${connection.threadId} acquired`);
});

pool.on('release', function (connection) {
    console.log(`[DB] Connection ${connection.threadId} released`);
});

// Enhanced query method with timeout handling
async function executeQuery(sql, params = []) {
    try {
        console.log(`[DB] Executing query: ${sql.substring(0, 100)}${sql.length > 100 ? '...' : ''}`);
        const startTime = Date.now();
        const [results] = await db.query(sql, params);
        const duration = Date.now() - startTime;
        
        console.log(`[DB] Query completed in ${duration}ms, returned ${results ? results.length : 0} rows`);
        return results;
    } catch (error) {
        console.error(`[DB] Query error:`, error);
        throw error;
    }
}

// Enhanced query method with caching support
async function queryWithCache(sql, params = [], options = {}) {
    const { 
        useCache = false, 
        ttl = 60000, // 1 minute default
        cacheKey = null 
    } = options;
    
    // Generate cache key if not provided
    const key = cacheKey || `${sql}-${JSON.stringify(params)}`;
    
    // Check cache if enabled
    if (useCache) {
        const cachedResult = queryCache.get(key);
        if (cachedResult) {
            return cachedResult;
        }
    }
    
    // Execute query
    try {
        console.log(`[DB] Executing query: ${sql.substring(0, 100)}${sql.length > 100 ? '...' : ''}`);
        const startTime = Date.now();
        const [results] = await db.query(sql, params);
        const duration = Date.now() - startTime;
        
        console.log(`[DB] Query completed in ${duration}ms, returned ${results ? results.length : 0} rows`);
        
        // Cache result if enabled
        if (useCache) {
            queryCache.set(key, results, ttl);
        }
        
        return results;
    } catch (error) {
        console.error(`[DB] Query error:`, error);
        throw error;
    }
}

// Export the promise-based pool
module.exports = db;

// Also export the original pool for backward compatibility
module.exports.pool = pool;

// Export enhanced functionality
module.exports.executeQuery = executeQuery;
module.exports.queryWithCache = queryWithCache;
module.exports.cache = queryCache;
module.exports.testConnection = testConnection;
module.exports.getConnectionStatus = () => ({
    isConnected,
    lastCheck: new Date(lastConnectionCheck).toISOString(),
    connectionAttempts,
    poolStats: {
        threadId: pool.threadId,
        config: { ...DB_CONFIG, password: '******' } // Hide password in logs
    }
});
