/**
 * User Authentication Service
 * Handles user management and authentication functions
 */

const bcrypt = require('bcrypt');
const authConfig = require('../auth.config');
const db = require('../../database');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

/**
 * Find user by email
 */
const findUserByEmail = (email) => {
  return new Promise((resolve, reject) => {
    db.query(
      'SELECT * FROM users WHERE email = ?',
      [email],
      (err, results) => {
        if (err) {
          return reject(err);
        }
        
        if (!results || results.length === 0) {
          return resolve(null);
        }
        
        return resolve(results[0]);
      }
    );
  });
};

/**
 * Find user by ID
 */
const findUserById = (id) => {
  return new Promise((resolve, reject) => {
    db.query(
      'SELECT * FROM users WHERE id = ?',
      [id],
      (err, results) => {
        if (err) {
          return reject(err);
        }
        
        if (!results || results.length === 0) {
          return resolve(null);
        }
        
        return resolve(results[0]);
      }
    );
  });
};

/**
 * Validate password
 */
const validatePassword = async (plainPassword, hashedPassword) => {
  return await bcrypt.compare(plainPassword, hashedPassword);
};

/**
 * Hash password
 */
const hashPassword = async (password) => {
  return await bcrypt.hash(password, authConfig.password.saltRounds);
};

/**
 * Generate JWT tokens (access and refresh)
 */
const generateTokens = async (user) => {
  // Create session entry
  const sessionToken = crypto.randomBytes(64).toString('hex');
  const sessionExpiry = new Date();
  sessionExpiry.setSeconds(sessionExpiry.getSeconds() + authConfig.security.sessionDuration);
  
  // Store session in database
  await new Promise((resolve, reject) => {
    db.query(
      'INSERT INTO user_sessions (user_id, session_token, expires_at, ip_address, device_info) VALUES (?, ?, ?, ?, ?)',
      [user.id, sessionToken, sessionExpiry, 'unknown', 'unknown'],
      (err, results) => {
        if (err) {
          return reject(err);
        }
        resolve(results);
      }
    );
  });
  
  // Generate access token
  const accessToken = jwt.sign(
    {
      sub: user.id,
      email: user.email,
      role: user.account_status,
      sessionId: sessionToken
    },
    authConfig.jwt.secret,
    { expiresIn: authConfig.jwt.accessTokenExpiry }
  );
  
  // Generate refresh token
  const refreshToken = jwt.sign(
    {
      sub: user.id,
      type: 'refresh',
      sessionId: sessionToken
    },
    authConfig.jwt.secret,
    { expiresIn: authConfig.jwt.refreshTokenExpiry }
  );
  
  return {
    accessToken,
    refreshToken,
    sessionToken,
    expiresIn: authConfig.jwt.accessTokenExpiry
  };
};

/**
 * Validate refresh token and issue new access token
 */
const refreshAccessToken = async (refreshToken) => {
  try {
    // Verify the refresh token
    const decoded = jwt.verify(refreshToken, authConfig.jwt.secret);
    
    // Check if it's a refresh token
    if (decoded.type !== 'refresh') {
      throw new Error('Invalid token type');
    }
    
    // Check if session is valid
    const sessionValid = await new Promise((resolve, reject) => {
      db.query(
        'SELECT * FROM user_sessions WHERE user_id = ? AND session_token = ? AND is_valid = 1 AND expires_at > NOW()',
        [decoded.sub, decoded.sessionId],
        (err, results) => {
          if (err) {
            return reject(err);
          }
          
          if (!results || results.length === 0) {
            return resolve(false);
          }
          
          return resolve(true);
        }
      );
    });
    
    if (!sessionValid) {
      throw new Error('Invalid or expired session');
    }
    
    // Get user from database
    const user = await findUserById(decoded.sub);
    
    if (!user) {
      throw new Error('User not found');
    }
    
    // Generate new access token
    const accessToken = jwt.sign(
      {
        sub: user.id,
        email: user.email,
        role: user.account_status,
        sessionId: decoded.sessionId
      },
      authConfig.jwt.secret,
      { expiresIn: authConfig.jwt.accessTokenExpiry }
    );
    
    return {
      accessToken,
      expiresIn: authConfig.jwt.accessTokenExpiry
    };
    
  } catch (error) {
    throw error;
  }
};

/**
 * Invalidate a user session (logout)
 */
const invalidateSession = (userId, sessionToken) => {
  return new Promise((resolve, reject) => {
    db.query(
      'UPDATE user_sessions SET is_valid = 0 WHERE user_id = ? AND session_token = ?',
      [userId, sessionToken],
      (err, results) => {
        if (err) {
          return reject(err);
        }
        
        return resolve(results);
      }
    );
  });
};

/**
 * Update last login time for user
 */
const updateLastLogin = (userId, ipAddress) => {
  db.query(
    'UPDATE users SET last_login = NOW(), last_login_ip = ? WHERE id = ?',
    [ipAddress, userId],
    (err) => {
      if (err) {
        console.error('Error updating last login:', err);
      }
    }
  );
};

/**
 * Create user account
 */
const createUser = async (userData) => {
  try {
    const { firstName, lastName, email, phoneNumber, idNumber, address, password } = userData;
    
    // Generate a hashed password
    const hashedPassword = await hashPassword(password);
    
    // SQL query to insert new user
    const query = `
      INSERT INTO users (
        first_name, 
        last_name, 
        email, 
        phone_number, 
        id_number, 
        address, 
        password, 
        account_status, 
        membership_tier, 
        created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `;
    
    const params = [
      firstName,
      lastName,
      email,
      phoneNumber,
      idNumber,
      address,
      hashedPassword,
      'PENDING', // Default status for new registrations
      'BASIC',   // Default membership tier
    ];
    
    // Execute the query
    const result = await new Promise((resolve, reject) => {
      db.query(query, params, (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });
    
    // Return the created user
    return {
      id: result.insertId,
      firstName,
      lastName,
      email,
      accountStatus: 'PENDING',
      membershipTier: 'BASIC'
    };
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

module.exports = {
  findUserByEmail,
  findUserById,
  validatePassword,
  hashPassword,
  generateTokens,
  refreshAccessToken,
  invalidateSession,
  updateLastLogin,
  createUser
};
