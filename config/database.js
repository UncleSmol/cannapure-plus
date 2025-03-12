const mysql = require('mysql');
require('dotenv').config();

// Create connection pool instead of single connection
const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    connectionLimit: process.env.DB_CONNECTION_LIMIT || 10,
    queueLimit: process.env.DB_QUEUE_LIMIT || 0,
    waitForConnections: process.env.DB_WAIT_FOR_CONNECTIONS === 'true'
});

// Test the database connection
db.getConnection((err, connection) => {
    if (err) {
        console.error('Database connection failed:', err.message);
        
        // Specific error handling for common MySQL errors
        if (err.code === 'ECONNREFUSED') {
            console.error('Cannot connect to MySQL server. Make sure it is running.');
        } else if (err.code === 'ER_ACCESS_DENIED_ERROR') {
            console.error('Access denied: Check your MySQL username and password');
        } else if (err.code === 'ER_BAD_DB_ERROR') {
            console.error('Database does not exist: Check your database name');
        }
        
        return;
    }
    
    console.log('Successfully connected to MySQL Database');
    connection.release(); // Always release the connection when done
});

// Handle pool errors to prevent app crashes
db.on('error', (err) => {
    console.error('Database pool error:', err.message);
    
    // If the connection was refused, the server might be down
    if (err.code === 'ECONNREFUSED') {
        console.error('Lost connection to MySQL server. Attempting to reconnect...');
    }
});

module.exports = db;
