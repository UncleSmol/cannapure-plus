const express = require('express');
const strainController = require('./controller');
const { validateStrainFilters, validateStrainId, validateCbdParam, 
        validateConditionParam, validateStrainBody } = require('../validators/strainValidator');
const { validateResults } = require('../middleware/validation');
const { verifyToken, requireRole } = require('../middleware/auth');

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
 * Middleware to log and forward response
 */
const withLogging = (handler) => async (req, res, next) => {
  try {
    // Store the original res.json function
    const originalJson = res.json;
    
    // Override res.json to log the response
    res.json = function(data) {
      logResponse(req, data);
      return originalJson.call(this, data);
    };
    
    await handler(req, res, next);
  } catch (error) {
    next(error);
  }
};

// Public routes
/**
 * @route GET /api/strains
 * @desc Get all strains with filtering and pagination
 * @access Public
 */
router.get('/', 
  validateStrainFilters, 
  validateResults,
  withLogging(strainController.getStrains)
);

/**
 * @route GET /api/strains/medical/cbd/:minCbd
 * @desc Get medical strains by minimum CBD content
 * @access Public
 */
router.get('/medical/cbd/:minCbd', 
  validateCbdParam, 
  validateResults,
  withLogging(strainController.getMedicalStrainsByCbd)
);

/**
 * @route GET /api/strains/medical/condition/:condition
 * @desc Get medical strains by condition
 * @access Public
 */
router.get('/medical/condition/:condition', 
  validateConditionParam, 
  validateResults,
  withLogging(strainController.getMedicalStrainsByCondition)
);

/**
 * @route GET /api/strains/:id
 * @desc Get strain by ID
 * @access Public
 */
router.get('/:id', 
  validateStrainId, 
  validateResults,
  withLogging(strainController.getStrainById)
);

// Protected routes (Admin only)
/**
 * @route POST /api/strains
 * @desc Create a new strain
 * @access Private (Admin only)
 */
router.post('/', 
  verifyToken, 
  requireRole('admin'),
  validateStrainBody,
  validateResults,
  withLogging(strainController.createStrain)
);

/**
 * @route PUT /api/strains/:id
 * @desc Update a strain
 * @access Private (Admin only)
 */
router.put('/:id', 
  verifyToken, 
  requireRole('admin'),
  validateStrainId, 
  validateStrainBody,
  validateResults,
  withLogging(strainController.updateStrain)
);

/**
 * @route DELETE /api/strains/:id
 * @desc Delete a strain
 * @access Private (Admin only)
 */
router.delete('/:id', 
  verifyToken, 
  requireRole('admin'),
  validateStrainId, 
  validateResults,
  withLogging(strainController.deleteStrain)
);

module.exports = router;
