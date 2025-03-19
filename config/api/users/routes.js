const express = require('express');
const usersAPI = require('./index');

const router = express.Router();

/**
 * @route GET /api/users
 * @desc Get all users (admin only)
 * @access Private/Admin
 */
router.get('/', async (req, res, next) => {
  try {
    // Check for admin role
    if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        error: { message: 'Admin access required', code: 'PERMISSION_DENIED' } 
      });
    }
    
    const options = {
      limit: req.query.limit,
      offset: req.query.offset,
      sortBy: req.query.sortBy,
      sortDir: req.query.sortDir
    };
    
    const result = await usersAPI.getAllUsers(options);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * @route GET /api/users/:id
 * @desc Get user by ID
 * @access Private
 */
router.get('/:id', async (req, res, next) => {
  try {
    const userId = parseInt(req.params.id);
    
    // Users can only access their own data unless they're an admin
    if (req.user.id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ 
        error: { message: 'Access denied', code: 'PERMISSION_DENIED' } 
      });
    }
    
    const user = await usersAPI.getUserById(userId);
    res.json(user);
  } catch (error) {
    next(error);
  }
});

/**
 * @route PUT /api/users/:id
 * @desc Update user
 * @access Private
 */
router.put('/:id', async (req, res, next) => {
  try {
    const userId = parseInt(req.params.id);
    
    // Users can only update their own data unless they're an admin
    if (req.user.id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ 
        error: { message: 'Access denied', code: 'PERMISSION_DENIED' } 
      });
    }
    
    // Only admins can update roles
    if (req.body.role && req.user.role !== 'admin') {
      return res.status(403).json({ 
        error: { message: 'Only admins can update roles', code: 'PERMISSION_DENIED' } 
      });
    }
    
    const user = await usersAPI.updateUser(userId, req.body);
    res.json(user);
  } catch (error) {
    next(error);
  }
});

/**
 * @route DELETE /api/users/:id
 * @desc Delete user
 * @access Private
 */
router.delete('/:id', async (req, res, next) => {
  try {
    const userId = parseInt(req.params.id);
    
    // Users can only delete their own account unless they're an admin
    if (req.user.id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ 
        error: { message: 'Access denied', code: 'PERMISSION_DENIED' } 
      });
    }
    
    await usersAPI.deleteUser(userId);
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

/**
 * @route GET /api/users/:id/preferences
 * @desc Get user preferences
 * @access Private
 */
router.get('/:id/preferences', async (req, res, next) => {
  try {
    const userId = parseInt(req.params.id);
    
    // Users can only access their own preferences unless they're an admin
    if (req.user.id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ 
        error: { message: 'Access denied', code: 'PERMISSION_DENIED' } 
      });
    }
    
    const preferences = await usersAPI.getUserPreferences(userId);
    res.json(preferences);
  } catch (error) {
    next(error);
  }
});

/**
 * @route PUT /api/users/:id/preferences
 * @desc Update user preferences
 * @access Private
 */
router.put('/:id/preferences', async (req, res, next) => {
  try {
    const userId = parseInt(req.params.id);
    
    // Users can only update their own preferences unless they're an admin
    if (req.user.id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ 
        error: { message: 'Access denied', code: 'PERMISSION_DENIED' } 
      });
    }
    
    const preferences = await usersAPI.updateUserPreferences(userId, req.body);
    res.json(preferences);
  } catch (error) {
    next(error);
  }
});

module.exports = router;