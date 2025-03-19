/**
 * Strain API routes with data freshness support
 */
const express = require('express');
const router = express.Router();
const db = require('../db');
const { executeQuery } = require('../utils/db-utils');

// Cache TTL configuration (in milliseconds)
const CACHE_TTL = {
  DEFAULT: 300000, // 5 minutes
  STRAIN_LIST: 600000, // 10 minutes
  STRAIN_DETAIL: 1800000, // 30 minutes
  MEDICAL: 3600000 // 1 hour for medical data
};

/**
 * Get all strains from all categories
 * @route GET /api/strains
 */
router.get('/', async (req, res, next) => {
  try {
    const { limit = 50, offset = 0, sortBy = 'strain_name', sortDir = 'asc' } = req.query;
    
    const sql = `
      SELECT * FROM medical_strains
      UNION ALL
      SELECT * FROM normal_strains
      UNION ALL
      SELECT * FROM greenhouse_strains
      UNION ALL
      SELECT * FROM indoor_strains
      UNION ALL
      SELECT * FROM exotic_tunnel_strains
      ORDER BY ${sortBy} ${sortDir === 'desc' ? 'DESC' : 'ASC'}
      LIMIT ? OFFSET ?
    `;
    
    const result = await executeQuery(db, sql, [parseInt(limit), parseInt(offset)], {
      useCache: true,
      ttl: CACHE_TTL.STRAIN_LIST,
      forceRefresh: req.forceRefresh
    });
    
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * Get strains of a specific type
 * @route GET /api/strains/:type
 */
router.get('/:type', async (req, res, next) => {
  try {
    const { type } = req.params;
    const { 
      limit = 50, 
      offset = 0, 
      minPrice, 
      maxPrice, 
      location, 
      sortBy = 'strain_name', 
      sortDir = 'asc' 
    } = req.query;
    
    // Validate strain type
    const validTypes = ['medical', 'normal', 'greenhouse', 'indoor', 'exotic_tunnel'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ 
        error: 'Invalid strain type',
        validTypes
      });
    }
    
    // Build query with filters
    let sql = `SELECT * FROM ${type}_strains WHERE 1=1`;
    const params = [];
    
    if (minPrice) {
      sql += ' AND price >= ?';
      params.push(parseFloat(minPrice));
    }
    
    if (maxPrice) {
      sql += ' AND price <= ?';
      params.push(parseFloat(maxPrice));
    }
    
    if (location) {
      sql += ' AND location = ?';
      params.push(location);
    }
    
    sql += ` ORDER BY ${sortBy} ${sortDir === 'desc' ? 'DESC' : 'ASC'} LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), parseInt(offset));
    
    const result = await executeQuery(db, sql, params, {
      useCache: true,
      ttl: type === 'medical' ? CACHE_TTL.MEDICAL : CACHE_TTL.STRAIN_LIST,
      forceRefresh: req.forceRefresh
    });
    
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * Get a specific strain by ID
 * @route GET /api/strains/:type/:id
 */
router.get('/:type/:id', async (req, res, next) => {
  try {
    const { type, id } = req.params;
    
    // Validate strain type
    const validTypes = ['medical', 'normal', 'greenhouse', 'indoor', 'exotic_tunnel'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ 
        error: 'Invalid strain type',
        validTypes
      });
    }
    
    const sql = `SELECT * FROM ${type}_strains WHERE id = ?`;
    
    const result = await executeQuery(db, sql, [id], {
      useCache: true,
      ttl: CACHE_TTL.STRAIN_DETAIL,
      forceRefresh: req.forceRefresh
    });
    
    if (result.data.length === 0) {
      return res.status(404).json({
        error: 'Strain not found',
        type,
        id
      });
    }
    
    res.json({
      data: result.data[0],
      metadata: result.metadata
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Get strains by cannabis type (Indica, Sativa, Hybrid)
 * @route GET /api/strains/:type/cannabis/:cannabisType
 */
router.get('/:type/cannabis/:cannabisType', async (req, res, next) => {
  try {
    const { type, cannabisType } = req.params;
    const { limit = 50, offset = 0 } = req.query;
    
    // Validate strain type
    const validTypes = ['medical', 'normal', 'greenhouse', 'indoor', 'exotic_tunnel'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ 
        error: 'Invalid strain type',
        validTypes
      });
    }
    
    // Validate cannabis type
    const validCannabisTypes = ['indica', 'sativa', 'hybrid'];
    if (!validCannabisTypes.includes(cannabisType.toLowerCase())) {
      return res.status(400).json({ 
        error: 'Invalid cannabis type',
        validCannabisTypes
      });
    }
    
    const sql = `
      SELECT * FROM ${type}_strains 
      WHERE LOWER(strain_type) = ? 
      ORDER BY strain_name ASC
      LIMIT ? OFFSET ?
    `;
    
    const result = await executeQuery(db, sql, [
      cannabisType.toLowerCase(), 
      parseInt(limit), 
      parseInt(offset)
    ], {
      useCache: true,
      ttl: CACHE_TTL.DEFAULT,
      forceRefresh: req.forceRefresh
    });
    
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// Additional routes would follow the same pattern...

module.exports = router;