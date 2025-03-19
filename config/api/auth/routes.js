const express = require('express');
const authAPI = require('./index');
const { authenticateJWT } = require('../middleware/auth');

const router = express.Router();

/**
 * @route POST /api/auth/login
 * @desc Login user and get token
 * @access Public
 */
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ 
        error: { message: 'Email and password are required', code: 'MISSING_FIELDS' } 
      });
    }
    
    const result = await authAPI.login(email, password);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * @route POST /api/auth/register
 * @desc Register a new user
 * @access Public
 */
router.post('/register', async (req, res, next) => {
  try {
    const { email, password, name, role } = req.body;
    
    if (!email || !password || !name) {
      return res.status(400).json({ 
        error: { message: 'Email, password, and name are required', code: 'MISSING_FIELDS' } 
      });
    }
    
    const result = await authAPI.register({ email, password, name, role });
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * @route POST /api/auth/refresh
 * @desc Refresh authentication token
 * @access Private
 */
router.post('/refresh', authenticateJWT, async (req, res, next) => {
  try {
    const result = await authAPI.refreshToken(req.user.id);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

module.exports = router;