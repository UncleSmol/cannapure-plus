/**
 * Authentication Routes
 * Handles login, registration, and other auth-related endpoints
 */

const express = require('express');
const router = express.Router();
const userService = require('./services/user.service');
const { loginRateLimiter, recordLoginAttempt } = require('./middleware/rate-limit.middleware');
const validator = require('validator');

/**
 * @route POST /api/auth/login
 * @desc Authenticate user and generate tokens
 * @access Public
 */
router.post('/login', loginRateLimiter, async (req, res) => {
  try {
    const { email, password, cpNumber } = req.body;
    const ipAddress = req.ip || req.headers['x-forwarded-for'] || 'unknown';
    
    // Validate email
    if (!email || !validator.isEmail(email)) {
      return res.status(400).json({ error: 'Valid email is required' });
    }
    
    // Validate password
    if (!password || password.length < 8) {
      return res.status(400).json({ error: 'Valid password is required' });
    }
    
    // Find user by email
    const user = await userService.findUserByEmail(email);
    
    // User not found
    if (!user) {
      // Record failed login attempt
      recordLoginAttempt(email, ipAddress, false, null, 'User not found');
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Check account status
    if (user.account_status !== 'ACTIVE') {
      recordLoginAttempt(email, ipAddress, false, user.id, 'Account not active');
      return res.status(403).json({ 
        error: 'Account not active', 
        status: user.account_status 
      });
    }
    
    // If CP number is required, validate it
    if (user.cp_number) {
      if (!cpNumber || cpNumber !== user.cp_number) {
        recordLoginAttempt(email, ipAddress, false, user.id, 'Invalid CP number');
        return res.status(401).json({ error: 'Invalid credentials' });
      }
    }
    
    // Validate password
    const isValidPassword = await userService.validatePassword(password, user.password);
    
    if (!isValidPassword) {
      recordLoginAttempt(email, ipAddress, false, user.id, 'Invalid password');
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Generate tokens
    const tokens = await userService.generateTokens(user);
    
    // Record successful login
    recordLoginAttempt(email, ipAddress, true, user.id, 'Login successful');
    
    // Update last login time
    userService.updateLastLogin(user.id, ipAddress);
    
    // Send response
    return res.status(200).json({
      message: 'Login successful',
      user: {
        id: user.id,
        firstName: user.first_name,
        email: user.email,
        membershipTier: user.membership_tier
      },
      tokens
    });
    
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'An error occurred during login' });
  }
});

/**
 * @route POST /api/auth/register
 * @desc Register a new user
 * @access Public
 */
router.post('/register', async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phoneNumber,
      idNumber,
      address,
      password
    } = req.body;
    
    // Validate email
    if (!email || !validator.isEmail(email)) {
      return res.status(400).json({ error: 'Valid email is required' });
    }
    
    // Check if email already exists
    const existingUser = await userService.findUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({ error: 'Email already in use' });
    }
    
    // Validate password
    if (!password || password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long' });
    }
    
    // Validate ID number (South African ID)
    if (!idNumber || !idNumber.match(/^[0-9]{13}$/)) {
      return res.status(400).json({ error: 'Valid South African ID number is required' });
    }
    
    // Create user
    const userData = {
      firstName,
      lastName,
      email,
      phoneNumber,
      idNumber,
      address,
      password
    };
    
    const newUser = await userService.createUser(userData);
    
    return res.status(201).json({
      message: 'Registration successful. Your account is pending approval.',
      user: {
        id: newUser.id,
        firstName: newUser.firstName,
        email: newUser.email
      }
    });
    
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ error: 'An error occurred during registration' });
  }
});

/**
 * @route POST /api/auth/refresh
 * @desc Refresh access token using refresh token
 * @access Public
 */
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token is required' });
    }
    
    // Refresh the access token
    const tokens = await userService.refreshAccessToken(refreshToken);
    
    return res.status(200).json({
      message: 'Token refreshed',
      ...tokens
    });
    
  } catch (error) {
    console.error('Token refresh error:', error);
    return res.status(401).json({ error: 'Invalid refresh token' });
  }
});

/**
 * @route POST /api/auth/logout
 * @desc Invalidate user session
 * @access Private
 */
router.post('/logout', async (req, res) => {
  try {
    const { userId, sessionToken } = req.body;
    
    if (!userId || !sessionToken) {
      return res.status(400).json({ error: 'User ID and session token are required' });
    }
    
    // Invalidate the session
    await userService.invalidateSession(userId, sessionToken);
    
    return res.status(200).json({ message: 'Logout successful' });
    
  } catch (error) {
    console.error('Logout error:', error);
    return res.status(500).json({ error: 'An error occurred during logout' });
  }
});

module.exports = router;