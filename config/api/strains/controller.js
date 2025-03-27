const strainService = require('./services/base-service');

/**
 * Get strains with filters
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next middleware function
 */
const getStrains = async (req, res, next) => {
  try {
    console.log(`[CONTROLLER] Getting strains with query:`, req.query);
    
    const filters = {
      category: req.query.category,
      thcMin: req.query.thc_min,
      thcMax: req.query.thc_max,
      cbdMin: req.query.cbd_min,
      cbdMax: req.query.cbd_max,
      strainType: req.query.strain_type,
      location: req.query.location,
      special: req.query.special === 'true',
      minPrice: req.query.min_price,
      maxPrice: req.query.max_price,
      limit: req.query.limit,
      offset: req.query.offset,
      sortBy: req.query.sort_by,
      sortDir: req.query.sort_dir
    };
    
    const result = await strainService.getStrains(filters);
    return res.json(result);
  } catch (error) {
    console.error(`[CONTROLLER] Error getting strains:`, error);
    next(error);
  }
};

/**
 * Get strain by ID
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next middleware function
 */
const getStrainById = async (req, res, next) => {
  try {
    console.log(`[CONTROLLER] Getting strain with ID: ${req.params.id}`);
    
    const strain = await strainService.getStrainById(req.params.id, req.query.category);
    
    if (!strain) {
      return res.status(404).json({ 
        error: { message: 'Strain not found', code: 'STRAIN_NOT_FOUND' } 
      });
    }
    
    return res.json(strain);
  } catch (error) {
    console.error(`[CONTROLLER] Error getting strain by ID:`, error);
    next(error);
  }
};

/**
 * Get medical strains by CBD content
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next middleware function
 */
const getMedicalStrainsByCbd = async (req, res, next) => {
  try {
    console.log(`[CONTROLLER] Getting medical strains with minimum CBD content: ${req.params.minCbd}%`);
    
    const minCbd = parseFloat(req.params.minCbd);
    
    if (isNaN(minCbd)) {
      return res.status(400).json({ 
        error: { message: 'Invalid CBD percentage', code: 'INVALID_CBD_VALUE' } 
      });
    }
    
    const result = await strainService.getStrains({
      category: 'medical',
      cbdMin: minCbd
    });
    
    return res.json(result.strains);
  } catch (error) {
    console.error(`[CONTROLLER] Error getting medical strains by CBD content:`, error);
    next(error);
  }
};

/**
 * Get medical strains by condition
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next middleware function
 */
const getMedicalStrainsByCondition = async (req, res, next) => {
  try {
    const condition = req.params.condition;
    console.log(`[CONTROLLER] Getting medical strains for condition: ${condition}`);
    
    const result = await strainService.getStrainsByCondition(condition);
    
    return res.json(result.strains);
  } catch (error) {
    console.error(`[CONTROLLER] Error getting medical strains by condition:`, error);
    next(error);
  }
};

/**
 * Create a new strain
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next middleware function
 */
const createStrain = async (req, res, next) => {
  try {
    console.log(`[CONTROLLER] Creating new strain:`, req.body);
    
    const strain = await strainService.createStrain(req.body);
    return res.status(201).json(strain);
  } catch (error) {
    console.error(`[CONTROLLER] Error creating strain:`, error);
    next(error);
  }
};

/**
 * Update a strain
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next middleware function
 */
const updateStrain = async (req, res, next) => {
  try {
    console.log(`[CONTROLLER] Updating strain with ID: ${req.params.id}`);
    
    const strain = await strainService.updateStrain(
      req.params.id, 
      req.body, 
      req.query.category
    );
    
    if (!strain) {
      return res.status(404).json({ 
        error: { message: 'Strain not found', code: 'STRAIN_NOT_FOUND' } 
      });
    }
    
    return res.json(strain);
  } catch (error) {
    console.error(`[CONTROLLER] Error updating strain:`, error);
    next(error);
  }
};

/**
 * Delete a strain
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next middleware function
 */
const deleteStrain = async (req, res, next) => {
  try {
    console.log(`[CONTROLLER] Deleting strain with ID: ${req.params.id}`);
    
    const success = await strainService.deleteStrain(
      req.params.id, 
      req.query.category
    );
    
    if (!success) {
      return res.status(404).json({ 
        error: { message: 'Strain not found', code: 'STRAIN_NOT_FOUND' } 
      });
    }
    
    return res.status(204).end();
  } catch (error) {
    console.error(`[CONTROLLER] Error deleting strain:`, error);
    next(error);
  }
};

module.exports = {
  getStrains,
  getStrainById,
  getMedicalStrainsByCbd,
  getMedicalStrainsByCondition,
  createStrain,
  updateStrain,
  deleteStrain
};
