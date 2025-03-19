/**
 * Authentication Routes
 * Exposes authentication service as API endpoints
 */
const express = require('express');
const router = express.Router();
const authService = require('../services/authService');
const authMiddleware = require('../middleware/auth');
const { rateLimit } = require('express-rate-limit');

// Rate limiting for login attempts
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 requests per windowMs
  message: {
    error: {
      message: 'Too many login attempts, please try again later',
      code: 'RATE_LIMIT_EXCEEDED'
    }
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Rate limiting for registration
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 requests per windowMs
  message: {
    error: {
      message: 'Too many registration attempts, please try again later',
      code: 'RATE_LIMIT_EXCEEDED'
    }
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Rate limiting for password reset
const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 requests per windowMs
  message: {
    error: {
      message: 'Too many password reset attempts, please try again later',
      code: 'RATE_LIMIT_EXCEEDED'
    }
  },
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * Register a new user
 * @route POST /api/auth/register
 */
router.post('/register', registerLimiter, async (req, res) => {
  try {
    // Extract request info for logging
    const requestInfo = {
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      referrer: req.headers.referer || req.headers.referrer
    };
    
    // Add request info to user data
    const userData = {
      ...req.body,
      ...requestInfo
    };
    
    // Register user
    const result = await authService.registerUser(userData);
    
    res.status(201).json({
      data: {
        user: result.user,
        message: result.message
      },
      metadata: {
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('[AUTH ROUTES] Registration error:', error.message);
    
    // Handle specific errors
    if (error.message.includes('already registered')) {
      return res.status(409).json({
        error: {
          message: error.message,
          code: 'DUPLICATE_ENTRY'
        }
      });
    }
    
    if (error.message.includes('Missing required field')) {
      return res.status(400).json({
        error: {
          message: error.message,
          code: 'MISSING_FIELD'
        }
      });
    }
    
    res.status(500).json({
      error: {
        message: 'Registration failed',
        details: error.message,
        code: 'REGISTRATION_FAILED'
      }
    });
  }
});

/**
 * Login user
 * @route POST /api/auth/login
 */
router.post('/login', loginLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        error: {
          message: 'Email and password are required',
          code: 'MISSING_CREDENTIALS'
        }
      });
    }
    
    // Extract request info for logging
    const requestInfo = {
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      referrer: req.headers.referer || req.headers.referrer
    };
    
    // Login user
    const result = await authService.loginUser(email, password, requestInfo);
    
    // Set refresh token as HTTP-only cookie for better security
    if (process.env.USE_COOKIE_FOR_REFRESH === 'true') {
      res.cookie('refreshToken', result.tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });
    }
    
    res.json({
      data: {
        user: result.user,
        accessToken: result.tokens.accessToken,
        refreshToken: process.env.USE_COOKIE_FOR_REFRESH === 'true' ? undefined : result.tokens.refreshToken,
        message: result.message
      },
      metadata: {
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('[AUTH ROUTES] Login error:', error.message);
    
    // Handle specific errors
    if (error.message.includes('locked')) {
      return res.status(403).json({
        error: {
          message: error.message,
          code: 'ACCOUNT_LOCKED'
        }
      });
    }
    
    if (error.message.includes('Invalid email or password')) {
      return res.status(401).json({
        error: {
          message: 'Invalid email or password',
          code: 'INVALID_CREDENTIALS'
        }
      });
    }
    
    if (error.message.includes('account is')) {
      return res.status(403).json({
        error: {
          message: error.message,
          code: 'ACCOUNT_INACTIVE'
        }
      });
    }
    
    res.status(500).json({
      error: {
        message: 'Login failed',
        details: error.message,
        code: 'LOGIN_FAILED'
      }
    });
  }
});

/**
 * Refresh token
 * @route POST /api/auth/refresh
 */
router.post('/refresh', async (req, res) => {
  try {
    // Get refresh token from request body or cookie
    let refreshToken = req.body.refreshToken;
    
    if (!refreshToken && process.env.USE_COOKIE_FOR_REFRESH === 'true') {
      refreshToken = req.cookies.refreshToken;
    }
    
    if (!refreshToken) {
      return res.status(400).json({
        error: {
          message: 'Refresh token is required',
          code: 'MISSING_REFRESH_TOKEN'
        }
      });
    }
    
    // Extract request info for logging
    const requestInfo = {
      ip: req.ip,
      userAgent: req.headers['user-agent']
    };
    
    // Refresh token
    const result = await authService.refreshToken(refreshToken, requestInfo);
    
    // Update refresh token cookie if using cookies
    if (process.env.USE_COOKIE_FOR_REFRESH === 'true') {
      res.cookie('refreshToken', result.tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });
    }
    
    res.json({
      data: {
        accessToken: result.tokens.accessToken,
        refreshToken: process.env.USE_COOKIE_FOR_REFRESH === 'true' ? undefined : result.tokens.refreshToken,
        message: result.message
      },
      metadata: {
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('[AUTH ROUTES] Token refresh error:', error.message);
    
    // Handle specific errors
    if (error.message.includes('Invalid refresh token') || 
        error.message.includes('Refresh token not found') ||
        error.message.includes('has been revoked')) {
      return res.status(401).json({
        error: {
          message: error.message,
          code: 'INVALID_REFRESH_TOKEN'
        }
      });
    }
    
    res.status(500).json({
      error: {
        message: 'Token refresh failed',
        details: error.message,
        code: 'REFRESH_FAILED'
      }
    });
  }
});

/**
 * Logout user
 * @route POST /api/auth/logout
 */
router.post('/logout', async (req, res) => {
  try {
    // Get refresh token from request body or cookie
    let refreshToken = req.body.refreshToken;
    
    if (!refreshToken && process.env.USE_COOKIE_FOR_REFRESH === 'true') {
      refreshToken = req.cookies.refreshToken;
    }
    
    if (!refreshToken) {
      return res.status(400).json({
        error: {
          message: 'Refresh token is required',
          code: 'MISSING_REFRESH_TOKEN'
        }
      });
    }
    
    // Extract request info for logging
    const requestInfo = {
      ip: req.ip,
      userAgent: req.headers['user-agent']
    };
    
    // Logout user
    const result = await authService.logoutUser(refreshToken, requestInfo);
    
    // Clear refresh token cookie if using cookies
    if (process.env.USE_COOKIE_FOR_REFRESH === 'true') {
      res.clearCookie('refreshToken');
    }
    
    res.json({
      data: {
        message: result.message
      },
      metadata: {
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('[AUTH ROUTES] Logout error:', error.message);
    
    // Even if there's an error, clear the cookie
    if (process.env.USE_COOKIE_FOR_REFRESH === 'true') {
      res.clearCookie('refreshToken');
    }
    
    // Handle specific errors
    if (error.message.includes('Refresh token is required')) {
      return res.status(400).json({
        error: {
          message: error.message,
          code: 'MISSING_REFRESH_TOKEN'
        }
      });
    }
    
    if (error.message.includes('Invalid refresh token') || 
        error.message.includes('Refresh token not found')) {
      return res.status(401).json({
        error: {
          message: error.message,
          code: 'INVALID_REFRESH_TOKEN'
        }
      });
    }
    
    res.status(500).json({
      error: {
        message: 'Logout failed',
        details: error.message,
        code: 'LOGOUT_FAILED'
      }
    });
  }
});

/**
 * Get user profile
 * @route GET /api/auth/profile
 */
router.get('/profile', authMiddleware.verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get user profile
    const result = await authService.getUserProfile(userId);
    
    res.json({
      data: {
        user: result.user,
        message: result.message
      },
      metadata: {
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('[AUTH ROUTES] Get profile error:', error.message);
    
    // Handle specific errors
    if (error.message.includes('User not found')) {
      return res.status(404).json({
        error: {
          message: error.message,
          code: 'USER_NOT_FOUND'
        }
      });
    }
    
    res.status(500).json({
      error: {
        message: 'Failed to retrieve profile',
        details: error.message,
        code: 'PROFILE_RETRIEVAL_FAILED'
      }
    });
  }
});

/**
 * Update user profile
 * @route PUT /api/auth/profile
 */
router.put('/profile', authMiddleware.verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const userData = req.body;
    
    // Update user profile
    const result = await authService.updateUserProfile(userId, userData);
    
    res.json({
      data: {
        user: result.user,
        message: result.message
      },
      metadata: {
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('[AUTH ROUTES] Update profile error:', error.message);
    
    // Handle specific errors
    if (error.message.includes('No valid fields to update')) {
      return res.status(400).json({
        error: {
          message: error.message,
          code: 'NO_FIELDS_TO_UPDATE'
        }
      });
    }
    
    if (error.message.includes('User not found')) {
      return res.status(404).json({
        error: {
          message: error.message,
          code: 'USER_NOT_FOUND'
        }
      });
    }
    
    res.status(500).json({
      error: {
        message: 'Failed to update profile',
        details: error.message,
        code: 'PROFILE_UPDATE_FAILED'
      }
    });
  }
});

/**
 * Request password reset
 * @route POST /api/auth/reset-password
 */
router.post('/reset-password', passwordResetLimiter, async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        error: {
          message: 'Email is required',
          code: 'MISSING_EMAIL'
        }
      });
    }
    
    // Request password reset
    const result = await authService.requestPasswordReset(email);
    
    res.json({
      data: {
        message: result.message
      },
      metadata: {
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('[AUTH ROUTES] Password reset request error:', error.message);
    
    res.status(500).json({
      error: {
        message: 'Failed to request password reset',
        details: error.message,
        code: 'PASSWORD_RESET_REQUEST_FAILED'
      }
    });
  }
});

/**
 * Reset password with token
 * @route PUT /api/auth/reset-password/:token
 */
router.put('/reset-password/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const { password, confirmPassword } = req.body;
    
    // Validate required fields
    if (!password) {
      return res.status(400).json({
        error: {
          message: 'Password is required',
          code: 'MISSING_PASSWORD'
        }
      });
    }
    
    // Validate password confirmation
    if (password !== confirmPassword) {
      return res.status(400).json({
        error: {
          message: 'Passwords do not match',
          code: 'PASSWORD_MISMATCH'
        }
      });
    }
    
    // Reset password
    const result = await authService.resetPassword(token, password);
    
    res.json({
      data: {
        message: result.message
      },
      metadata: {
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('[AUTH ROUTES] Password reset error:', error.message);
    
    // Handle specific errors
    if (error.message.includes('Invalid or expired reset token')) {
      return res.status(400).json({
        error: {
          message: error.message,
          code: 'INVALID_RESET_TOKEN'
        }
      });
    }
    
    if (error.message.includes('Reset token has expired')) {
      return res.status(400).json({
        error: {
          message: error.message,
          code: 'EXPIRED_RESET_TOKEN'
        }
      });
    }
    
    res.status(500).json({
      error: {
        message: 'Failed to reset password',
        details: error.message,
        code: 'PASSWORD_RESET_FAILED'
      }
    });
  }
});

/**
 * Change password
 * @route PUT /api/auth/change-password
 */
router.put('/change-password', authMiddleware.verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword, confirmPassword } = req.body;
    
    // Validate required fields
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        error: {
          message: 'Current password and new password are required',
          code: 'MISSING_PASSWORD'
        }
      });
    }
    
    // Validate password confirmation
    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        error: {
          message: 'Passwords do not match',
          code: 'PASSWORD_MISMATCH'
        }
      });
    }
    
    // Change password
    const result = await authService.changePassword(userId, currentPassword, newPassword);
    
    res.json({
      data: {
        message: result.message
      },
      metadata: {
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('[AUTH ROUTES] Password change error:', error.message);
    
    // Handle specific errors
    if (error.message.includes('Current password is incorrect')) {
      return res.status(400).json({
        error: {
          message: error.message,
          code: 'INCORRECT_PASSWORD'
        }
      });
    }
    
    if (error.message.includes('User not found')) {
      return res.status(404).json({
        error: {
          message: error.message,
          code: 'USER_NOT_FOUND'
        }
      });
    }
    
    res.status(500).json({
      error: {
        message: 'Failed to change password',
        details: error.message,
        code: 'PASSWORD_CHANGE_FAILED'
      }
    });
  }
});

module.exports = router;