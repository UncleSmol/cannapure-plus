/**
 * Strain API Routes
 * Handles all strain-related API endpoints
 */
const express = require('express');
const router = express.Router();
const db = require('../database/connection');
const cacheService = require('../services/cacheService');
const { authenticateToken } = require('../middleware/authMiddleware');

/**
 * GET /api/all-strains
 * Returns all strains from the database
 */
router.get('/all-strains', authenticateToken, async (req, res) => {
  try {
    // Use cache with a key based on the endpoint
    const cacheKey = 'api:strains:all';
    
    // Try to get from cache first
    const cachedData = await cacheService.get(cacheKey);
    if (cachedData) {
      console.log('[API] Returning cached strain data');
      return res.json(cachedData);
    }
    
    // If not in cache, query the database
    console.log('[DB] Querying all strains from database');
    
    // Query the single strains table instead of separate tables
    const [rows] = await db.promise().query(`
      SELECT * FROM strains 
      ORDER BY category, strain_name
      LIMIT 1000
    `);
    
    console.log(`[DB] Found ${rows.length} strains`);
    
    // Store in cache for future requests (expires in 1 hour)
    await cacheService.set(cacheKey, rows, 3600);
    
    // Return the data
    return res.json(rows);
  } catch (error) {
    console.error('[API] Error fetching strains:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch strain data',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * GET /api/strains/:category
 * Returns strains filtered by category
 */
router.get('/strains/:category', authenticateToken, async (req, res) => {
  try {
    const { category } = req.params;
    
    // Validate category parameter
    if (!category) {
      return res.status(400).json({ error: 'Category parameter is required' });
    }
    
    // Use cache with a key based on the category
    const cacheKey = `api:strains:${category}:list`;
    
    // Try to get from cache first
    const cachedData = await cacheService.get(cacheKey);
    if (cachedData) {
      console.log(`[API] Returning cached strain data for category: ${category}`);
      return res.json(cachedData);
    }
    
    // If not in cache, query the database
    console.log(`[DB] Querying strains for category: ${category}`);
    
    // Query the single strains table with category filter
    const [rows] = await db.promise().query(`
      SELECT * FROM strains 
      WHERE category = ?
      ORDER BY strain_name
      LIMIT 100
    `, [category]);
    
    console.log(`[DB] Found ${rows.length} strains for category: ${category}`);
    
    // Store in cache for future requests (expires in 1 hour)
    await cacheService.set(cacheKey, rows, 3600);
    
    // Return the data
    return res.json(rows);
  } catch (error) {
    console.error(`[API] Error fetching strains for category:`, error);
    return res.status(500).json({ 
      error: 'Failed to fetch strain data',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * GET /api/strain/:id
 * Returns a single strain by ID
 */
router.get('/strain/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate ID parameter
    if (!id) {
      return res.status(400).json({ error: 'Strain ID is required' });
    }
    
    // Use cache with a key based on the strain ID
    const cacheKey = `api:strain:${id}`;
    
    // Try to get from cache first
    const cachedData = await cacheService.get(cacheKey);
    if (cachedData) {
      console.log(`[API] Returning cached strain data for ID: ${id}`);
      return res.json(cachedData);
    }
    
    // If not in cache, query the database
    console.log(`[DB] Querying strain with ID: ${id}`);
    
    // Query the single strains table with ID filter
    const [rows] = await db.promise().query(`
      SELECT * FROM strains 
      WHERE id = ?
      LIMIT 1
    `, [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Strain not found' });
    }
    
    // Store in cache for future requests (expires in 1 hour)
    await cacheService.set(cacheKey, rows[0], 3600);
    
    // Return the data
    return res.json(rows[0]);
  } catch (error) {
    console.error(`[API] Error fetching strain by ID:`, error);
    return res.status(500).json({ 
      error: 'Failed to fetch strain data',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;