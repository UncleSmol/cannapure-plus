const express = require('express');
const strainsAPI = require('./index');

const router = express.Router();

// Helper function to log API responses
const logResponse = (req, data) => {
  console.log(`\n[API RESPONSE] ${req.method} ${req.originalUrl}`);
  
  if (Array.isArray(data)) {
    console.log(`[API RESPONSE] Returning array with ${data.length} items`);
    if (data.length > 0) {
      console.log(`[API RESPONSE] First item sample:`, JSON.stringify(data[0], null, 2).substring(0, 200) + '...');
    }
  } else if (data && typeof data === 'object') {
    if (data.strains) {
      console.log(`[API RESPONSE] Returning ${data.strains.length} strains with pagination`);
      console.log(`[API RESPONSE] Pagination:`, data.pagination);
      if (data.strains.length > 0) {
        console.log(`[API RESPONSE] First strain sample:`, JSON.stringify(data.strains[0], null, 2).substring(0, 200) + '...');
      }
    } else {
      console.log(`[API RESPONSE] Returning object:`, JSON.stringify(data, null, 2).substring(0, 200) + '...');
    }
  } else {
    console.log(`[API RESPONSE] Returning:`, data);
  }
};

/**
 * @route GET /api/strains
 * @desc Get all strains with filtering and pagination
 * @access Private
 */
router.get('/', async (req, res, next) => {
  try {
    console.log(`[API REQUEST] GET /api/strains with query:`, req.query);
    
    const options = {
      limit: req.query.limit,
      offset: req.query.offset,
      type: req.query.type,
      thcMin: req.query.thcMin,
      thcMax: req.query.thcMax,
      cbdMin: req.query.cbdMin,
      cbdMax: req.query.cbdMax,
      sortBy: req.query.sortBy,
      sortDir: req.query.sortDir
    };
    
    const result = await strainsAPI.getAllStrains(options);
    
    // Log the response
    logResponse(req, result);
    
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * @route GET /api/strains/:type
 * @desc Get all strains of a specific type
 * @access Private
 */
router.get('/:type', async (req, res, next) => {
  try {
    console.log(`[API REQUEST] GET /api/strains/${req.params.type} with query:`, req.query);
    
    const options = {
      limit: req.query.limit,
      offset: req.query.offset,
      minPrice: req.query.minPrice,
      maxPrice: req.query.maxPrice,
      location: req.query.location,
      sortBy: req.query.sortBy,
      sortDir: req.query.sortDir
    };
    
    const result = await strainsAPI.getStrains(req.params.type, options);
    
    // Log the response
    logResponse(req, result);
    
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * @route GET /api/strains/:type/:id
 * @desc Get strain by ID
 * @access Private
 */
router.get('/:type/:id', async (req, res, next) => {
  try {
    console.log(`[API REQUEST] GET /api/strains/${req.params.type}/${req.params.id}`);
    
    const strain = await strainsAPI.getStrainById(req.params.type, req.params.id);
    
    // Log the response
    logResponse(req, strain);
    
    res.json(strain);
  } catch (error) {
    next(error);
  }
});

/**
 * @route GET /api/strains/:type/cannabis/:cannabisType
 * @desc Get strains by cannabis type (Indica, Sativa, Hybrid)
 * @access Private
 */
router.get('/:type/cannabis/:cannabisType', async (req, res, next) => {
  try {
    console.log(`[API REQUEST] GET /api/strains/${req.params.type}/cannabis/${req.params.cannabisType}`);
    
    const strains = await strainsAPI.getStrainsByType(req.params.type, req.params.cannabisType);
    
    // Log the response
    logResponse(req, strains);
    
    res.json(strains);
  } catch (error) {
    next(error);
  }
});

/**
 * @route GET /api/strains/:type/location/:location
 * @desc Get strains by location
 * @access Private
 */
router.get('/:type/location/:location', async (req, res, next) => {
  try {
    console.log(`[API REQUEST] GET /api/strains/${req.params.type}/location/${req.params.location}`);
    
    const strains = await strainsAPI.getStrainsByLocation(req.params.type, req.params.location);
    
    // Log the response
    logResponse(req, strains);
    
    res.json(strains);
  } catch (error) {
    next(error);
  }
});

/**
 * @route GET /api/strains/:type/specials
 * @desc Get special strains
 * @access Private
 */
router.get('/:type/specials', async (req, res, next) => {
  try {
    console.log(`[API REQUEST] GET /api/strains/${req.params.type}/specials`);
    
    const strains = await strainsAPI.getSpecialStrains(req.params.type);
    
    // Log the response
    logResponse(req, strains);
    
    res.json(strains);
  } catch (error) {
    next(error);
  }
});

/**
 * @route GET /api/strains/medical/cbd/:minCbd
 * @desc Get medical strains by minimum CBD content
 * @access Private
 */
router.get('/medical/cbd/:minCbd', async (req, res, next) => {
  try {
    console.log(`[API REQUEST] GET /api/strains/medical/cbd/${req.params.minCbd}`);
    
    const minCbd = parseFloat(req.params.minCbd);
    
    if (isNaN(minCbd)) {
      return res.status(400).json({ 
        error: { message: 'Invalid CBD percentage', code: 'INVALID_CBD_VALUE' } 
      });
    }
    
    const strains = await strainsAPI.getMedicalStrainsByCbd(minCbd);
    
    // Log the response
    logResponse(req, strains);
    
    res.json(strains);
  } catch (error) {
    next(error);
  }
});

/**
 * @route GET /api/strains/medical/condition/:condition
 * @desc Get medical strains by condition
 * @access Private
 */
router.get('/medical/condition/:condition', async (req, res, next) => {
  try {
    console.log(`[API REQUEST] GET /api/strains/medical/condition/${req.params.condition}`);
    
    const strains = await strainsAPI.getMedicalStrainsByCondition(req.params.condition);
    
    // Log the response
    logResponse(req, strains);
    
    res.json(strains);
  } catch (error) {
    next(error);
  }
});

/**
 * @route POST /api/strains
 * @desc Create a new strain
 * @access Private
 */
router.post('/', async (req, res, next) => {
  try {
    console.log(`[API REQUEST] POST /api/strains with body:`, req.body);
    
    // Check for admin role
    if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        error: { message: 'Only admins can create strains', code: 'PERMISSION_DENIED' } 
      });
    }
    
    const strain = await strainsAPI.createStrain(req.body);
    
    // Log the response
    logResponse(req, strain);
    
    res.status(201).json(strain);
  } catch (error) {
    next(error);
  }
});

/**
 * @route PUT /api/strains/:type/:id
 * @desc Update a strain
 * @access Private
 */
router.put('/:type/:id', async (req, res, next) => {
  try {
    console.log(`[API REQUEST] PUT /api/strains/${req.params.type}/${req.params.id} with body:`, req.body);
    
    // Check for admin role
    if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        error: { message: 'Only admins can update strains', code: 'PERMISSION_DENIED' } 
      });
    }
    
    const strain = await strainsAPI.updateStrain(req.params.type, req.params.id, req.body);
    
    // Log the response
    logResponse(req, strain);
    
    res.json(strain);
  } catch (error) {
    next(error);
  }
});

/**
 * @route DELETE /api/strains/:type/:id
 * @desc Delete a strain
 * @access Private
 */
router.delete('/:type/:id', async (req, res, next) => {
  try {
    console.log(`[API REQUEST] DELETE /api/strains/${req.params.type}/${req.params.id}`);
    
    // Check for admin role
    if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        error: { message: 'Only admins can delete strains', code: 'PERMISSION_DENIED' } 
      });
    }
    
    await strainsAPI.deleteStrain(req.params.type, req.params.id);
    
    console.log(`[API RESPONSE] Successfully deleted strain ${req.params.id}`);
    
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

module.exports = router;
