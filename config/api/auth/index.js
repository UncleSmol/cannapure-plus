const db = require('../../database');
const bcrypt = require('bcrypt');
const { generateToken } = require('../middleware/auth');

/**
 * User login
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<Object>} - User data and token
 */
const login = async (email, password) => {
  try {
    // Get user from database
    const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    
    if (users.length === 0) {
      throw { status: 401, message: 'Invalid email or password', code: 'INVALID_CREDENTIALS' };
    }

    const user = users[0];
    
    // Check password
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      throw { status: 401, message: 'Invalid email or password', code: 'INVALID_CREDENTIALS' };
    }

    // Generate token
    const token = generateToken(user);
    
    // Return user data (excluding password) and token
    const { password: _, ...userData } = user;
    return {
      user: userData,
      token
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Register new user
 * @param {Object} userData - User registration data
 * @returns {Promise<Object>} - Created user data and token
 */
const register = async (userData) => {
  try {
    // Check if user already exists
    const [existingUsers] = await db.query('SELECT * FROM users WHERE email = ?', [userData.email]);
    
    if (existingUsers.length > 0) {
      throw { status: 409, message: 'User with this email already exists', code: 'USER_EXISTS' };
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(userData.password, saltRounds);
    
    // Insert user into database
    const [result] = await db.query(
      'INSERT INTO users (email, password, name, role, created_at) VALUES (?, ?, ?, ?, NOW())',
      [userData.email, hashedPassword, userData.name, userData.role || 'user']
    );

    // Get created user
    const [users] = await db.query('SELECT * FROM users WHERE id = ?', [result.insertId]);
    const newUser = users[0];
    
    // Generate token
    const token = generateToken(newUser);
    
    // Return user data (excluding password) and token
    const { password: _, ...newUserData } = newUser;
    return {
      user: newUserData,
      token
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Refresh user token
 * @param {number} userId - User ID
 * @returns {Promise<Object>} - New token
 */
const refreshToken = async (userId) => {
  try {
    // Get user from database
    const [users] = await db.query('SELECT * FROM users WHERE id = ?', [userId]);
    
    if (users.length === 0) {
      throw { status: 404, message: 'User not found', code: 'USER_NOT_FOUND' };
    }

    // Generate new token
    const token = generateToken(users[0]);
    
    return { token };
  } catch (error) {
    throw error;
  }
};

module.exports = {
  login,
  register,
  refreshToken
};