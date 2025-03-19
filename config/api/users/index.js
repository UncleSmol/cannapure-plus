const db = require('../../database');
const bcrypt = require('bcrypt');

/**
 * Get all users (admin only)
 * @param {Object} options - Query options (limit, offset)
 * @returns {Promise<Array>} - List of users
 */
const getAllUsers = async (options = {}) => {
  try {
    const { limit = 20, offset = 0, sortBy = 'created_at', sortDir = 'DESC' } = options;
    
    // Apply sorting
    const allowedSortFields = ['id', 'name', 'email', 'role', 'created_at'];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'created_at';
    const direction = sortDir.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
    
    // Execute query (exclude passwords)
    const [users] = await db.query(
      `SELECT id, name, email, role, created_at, updated_at FROM users ORDER BY ${sortField} ${direction} LIMIT ? OFFSET ?`,
      [Number(limit), Number(offset)]
    );
    
    // Get total count for pagination
    const [countResult] = await db.query('SELECT COUNT(*) as total FROM users');
    
    return {
      users,
      pagination: {
        total: countResult[0].total,
        limit: Number(limit),
        offset: Number(offset),
        pages: Math.ceil(countResult[0].total / limit)
      }
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Get user by ID
 * @param {number} id - User ID
 * @returns {Promise<Object>} - User data
 */
const getUserById = async (id) => {
  try {
    const [users] = await db.query(
      'SELECT id, name, email, role, created_at, updated_at FROM users WHERE id = ?',
      [id]
    );
    
    if (users.length === 0) {
      throw { status: 404, message: 'User not found', code: 'USER_NOT_FOUND' };
    }
    
    return users[0];
  } catch (error) {
    throw error;
  }
};

/**
 * Update user
 * @param {number} id - User ID
 * @param {Object} userData - Updated user data
 * @returns {Promise<Object>} - Updated user
 */
const updateUser = async (id, userData) => {
  try {
    // Check if user exists
    await getUserById(id);
    
    const { name, email, password, role } = userData;
    
    // Build update query
    let query = 'UPDATE users SET ';
    const updates = [];
    const params = [];
    
    if (name !== undefined) {
      updates.push('name = ?');
      params.push(name);
    }
    
    if (email !== undefined) {
      // Check if email is already taken by another user
      const [existingUsers] = await db.query('SELECT id FROM users WHERE email = ? AND id != ?', [email, id]);
      if (existingUsers.length > 0) {
        throw { status: 409, message: 'Email already in use', code: 'EMAIL_IN_USE' };
      }
      
      updates.push('email = ?');
      params.push(email);
    }
    
    if (password !== undefined) {
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      updates.push('password = ?');
      params.push(hashedPassword);
    }
    
    if (role !== undefined) {
      updates.push('role = ?');
      params.push(role);
    }
    
    // Add updated_at timestamp
    updates.push('updated_at = NOW()');
    
    // Finalize query
    query += updates.join(', ');
    query += ' WHERE id = ?';
    params.push(id);
    
    // Execute update
    await db.query(query, params);
    
    // Return updated user
    return await getUserById(id);
  } catch (error) {
    throw error;
  }
};

/**
 * Delete user
 * @param {number} id - User ID
 * @returns {Promise<boolean>} - Success status
 */
const deleteUser = async (id) => {
  try {
    // Check if user exists
    await getUserById(id);
    
    // Delete user
    await db.query('DELETE FROM users WHERE id = ?', [id]);
    
    return true;
  } catch (error) {
    throw error;
  }
};

/**
 * Get user preferences
 * @param {number} userId - User ID
 * @returns {Promise<Object>} - User preferences
 */
const getUserPreferences = async (userId) => {
  try {
    const [preferences] = await db.query(
      'SELECT * FROM user_preferences WHERE user_id = ?',
      [userId]
    );
    
    if (preferences.length === 0) {
      // Return default preferences if none found
      return {
        user_id: userId,
        favorite_strains: [],
        preferred_types: [],
        notification_settings: {
          email: true,
          push: true
        }
      };
    }
    
    // Parse JSON fields
    const result = preferences[0];
    if (result.favorite_strains) {
      result.favorite_strains = JSON.parse(result.favorite_strains);
    }
    
    if (result.preferred_types) {
      result.preferred_types = JSON.parse(result.preferred_types);
    }
    
    if (result.notification_settings) {
      result.notification_settings = JSON.parse(result.notification_settings);
    }
    
    return result;
  } catch (error) {
    throw error;
  }
};

/**
 * Update user preferences
 * @param {number} userId - User ID
 * @param {Object} preferencesData - Updated preferences
 * @returns {Promise<Object>} - Updated preferences
 */
const updateUserPreferences = async (userId, preferencesData) => {
  try {
    const { favorite_strains, preferred_types, notification_settings } = preferencesData;
    
    // Check if preferences exist
    const [existingPrefs] = await db.query(
      'SELECT * FROM user_preferences WHERE user_id = ?',
      [userId]
    );
    
    if (existingPrefs.length === 0) {
      // Create new preferences
      await db.query(
        'INSERT INTO user_preferences (user_id, favorite_strains, preferred_types, notification_settings, created_at) VALUES (?, ?, ?, ?, NOW())',
        [
          userId,
          JSON.stringify(favorite_strains || []),
          JSON.stringify(preferred_types || []),
          JSON.stringify(notification_settings || { email: true, push: true })
        ]
      );
    } else {
      // Update existing preferences
      let query = 'UPDATE user_preferences SET ';
      const updates = [];
      const params = [];
      
      if (favorite_strains !== undefined) {
        updates.push('favorite_strains = ?');
        params.push(JSON.stringify(favorite_strains));
      }
      
      if (preferred_types !== undefined) {
        updates.push('preferred_types = ?');
        params.push(JSON.stringify(preferred_types));
      }
      
      if (notification_settings !== undefined) {
        updates.push('notification_settings = ?');
        params.push(JSON.stringify(notification_settings));
      }
      
      // Add updated_at timestamp
      updates.push('updated_at = NOW()');
      
      // Finalize query
      query += updates.join(', ');
      query += ' WHERE user_id = ?';
      params.push(userId);
      
      // Execute update
      await db.query(query, params);
    }
    
    // Return updated preferences
    return await getUserPreferences(userId);
  } catch (error) {
    throw error;
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getUserPreferences,
  updateUserPreferences
};