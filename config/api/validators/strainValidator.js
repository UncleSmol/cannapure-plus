const { query, param, body } = require('express-validator');

/**
 * Validate query parameters for GET /strains
 */
exports.validateStrainFilters = [
  query('category').optional().isIn([
    'medical', 'edible', 'extract', 'pre_rolled', 'indoor', 'greenhouse', 'exotic', 'normal'
  ]).withMessage('Invalid category'),
  
  query('thc_min').optional().isFloat({ min: 0, max: 100 })
    .withMessage('THC minimum must be between 0 and 100'),
  
  query('thc_max').optional().isFloat({ min: 0, max: 100 })
    .withMessage('THC maximum must be between 0 and 100'),
  
  query('cbd_min').optional().isFloat({ min: 0, max: 100 })
    .withMessage('CBD minimum must be between 0 and 100'),
  
  query('cbd_max').optional().isFloat({ min: 0, max: 100 })
    .withMessage('CBD maximum must be between 0 and 100'),
  
  query('strain_type').optional().isIn(['Sativa', 'Indica', 'Hybrid'])
    .withMessage('Strain type must be Sativa, Indica, or Hybrid'),
  
  query('min_price').optional().isFloat({ min: 0 })
    .withMessage('Minimum price must be a positive number'),
  
  query('max_price').optional().isFloat({ min: 0 })
    .withMessage('Maximum price must be a positive number'),
  
  query('special').optional().isBoolean()
    .withMessage('Special must be true or false'),
  
  query('limit').optional().isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  query('offset').optional().isInt({ min: 0 })
    .withMessage('Offset must be a non-negative integer'),
  
  query('sort_by').optional().isIn([
    'strain_name', 'strain_type', 'price', 'thc', 'cbd', 'created_at'
  ]).withMessage('Invalid sort field'),
  
  query('sort_dir').optional().isIn(['ASC', 'DESC', 'asc', 'desc'])
    .withMessage('Sort direction must be ASC or DESC')
];

/**
 * Validate path parameters for strain ID
 */
exports.validateStrainId = [
  param('id').isInt({ min: 1 }).withMessage('Strain ID must be a positive integer')
];

/**
 * Validate CBD parameter for medical strains
 */
exports.validateCbdParam = [
  param('minCbd').isFloat({ min: 0, max: 100 })
    .withMessage('CBD percentage must be between 0 and 100')
];

/**
 * Validate condition parameter for medical strains
 */
exports.validateConditionParam = [
  param('condition').isLength({ min: 2, max: 50 })
    .withMessage('Condition must be between 2 and 50 characters')
];

/**
 * Validate strain creation/update body
 */
exports.validateStrainBody = [
  body('strain_name').isString().isLength({ min: 2, max: 255 })
    .withMessage('Strain name must be between 2 and 255 characters'),
  
  body('category').isIn([
    'medical', 'edible', 'extract', 'pre_rolled', 'indoor', 'greenhouse', 'exotic', 'normal'
  ]).withMessage('Invalid category'),
  
  body('strain_type').isIn(['Sativa', 'Indica', 'Hybrid'])
    .withMessage('Strain type must be Sativa, Indica, or Hybrid'),
  
  body('price').isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  
  body('measurement').optional().isString().isLength({ max: 50 })
    .withMessage('Measurement must be a string with max 50 characters'),
  
  body('thc').optional().custom(value => {
    // Allow numeric or formatted string
    if (typeof value === 'number') {
      return value >= 0 && value <= 100;
    } else if (typeof value === 'string') {
      // Check for valid THC string formats
      return /^THC: \d+(\.\d+)?%$/.test(value) || 
             /^THC: \d+-\d+%$/.test(value) ||
             /^THC: \d+(\.\d+)?mg$/.test(value);
    }
    return false;
  }).withMessage('THC must be a valid percentage (0-100) or formatted string'),
  
  body('cbd').optional().custom(value => {
    // Allow numeric or formatted string
    if (typeof value === 'number') {
      return value >= 0 && value <= 100;
    } else if (typeof value === 'string') {
      // Check for valid CBD string format
      return /^CBD: \d+(\.\d+)?%$/.test(value) || 
             /^CBD: \d+-\d+%$/.test(value);
    }
    return false;
  }).withMessage('CBD must be a valid percentage (0-100) or formatted string'),
  
  body('store_location').optional().isString().isLength({ max: 255 })
    .withMessage('Store location must be a string with max 255 characters'),
  
  body('special').optional().isBoolean()
    .withMessage('Special must be true or false')
];