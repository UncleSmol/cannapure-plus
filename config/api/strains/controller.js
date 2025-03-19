const strainServices = require('./services');

/**
 * Get all strains of a specific type
 * @param {string} strainType - Type of strain (medical, normal, etc.)
 * @param {Object} options - Query options
 * @returns {Promise<Object>} - Strains with pagination info
 */
const getStrains = async (strainType, options = {}) => {
  try {
    console.log(`[CONTROLLER] Getting ${strainType} strains with options:`, options);
    
    if (!strainServices[strainType]) {
      throw { status: 400, message: `Invalid strain type: ${strainType}`, code: 'INVALID_STRAIN_TYPE' };
    }
    
    const result = await strainServices[strainType].getAll(options);
    return result;
  } catch (error) {
    console.error(`[CONTROLLER] Error getting ${strainType} strains:`, error);
    throw error;
  }
};

/**
 * Get strain by ID
 * @param {string} strainType - Type of strain (medical, normal, etc.)
 * @param {number} id - Strain ID
 * @returns {Promise<Object>} - Strain data
 */
const getStrainById = async (strainType, id) => {
  try {
    console.log(`[CONTROLLER] Getting ${strainType} strain with ID: ${id}`);
    
    if (!strainServices[strainType]) {
      throw { status: 400, message: `Invalid strain type: ${strainType}`, code: 'INVALID_STRAIN_TYPE' };
    }
    
    const strain = await strainServices[strainType].getById(id);
    return strain;
  } catch (error) {
    console.error(`[CONTROLLER] Error getting ${strainType} strain by ID:`, error);
    throw error;
  }
};

/**
 * Get strains by type (Indica, Sativa, Hybrid)
 * @param {string} strainType - Type of strain (medical, normal, etc.)
 * @param {string} cannabisType - Cannabis type (Indica, Sativa, Hybrid)
 * @returns {Promise<Array>} - List of strains
 */
const getStrainsByType = async (strainType, cannabisType) => {
  try {
    console.log(`[CONTROLLER] Getting ${strainType} strains of type: ${cannabisType}`);
    
    if (!strainServices[strainType]) {
      throw { status: 400, message: `Invalid strain type: ${strainType}`, code: 'INVALID_STRAIN_TYPE' };
    }
    
    const strains = await strainServices[strainType].getByType(cannabisType);
    return strains;
  } catch (error) {
    console.error(`[CONTROLLER] Error getting ${strainType} strains by cannabis type:`, error);
    throw error;
  }
};

/**
 * Get strains by location
 * @param {string} strainType - Type of strain (medical, normal, etc.)
 * @param {string} location - Store location
 * @returns {Promise<Array>} - List of strains
 */
const getStrainsByLocation = async (strainType, location) => {
  try {
    console.log(`[CONTROLLER] Getting ${strainType} strains at location: ${location}`);
    
    if (!strainServices[strainType]) {
      throw { status: 400, message: `Invalid strain type: ${strainType}`, code: 'INVALID_STRAIN_TYPE' };
    }
    
    const strains = await strainServices[strainType].getByLocation(location);
    return strains;
  } catch (error) {
    console.error(`[CONTROLLER] Error getting ${strainType} strains by location:`, error);
    throw error;
  }
};

/**
 * Get special strains
 * @param {string} strainType - Type of strain (medical, normal, etc.)
 * @returns {Promise<Array>} - List of special strains
 */
const getSpecialStrains = async (strainType) => {
  try {
    console.log(`[CONTROLLER] Getting special ${strainType} strains`);
    
    if (!strainServices[strainType]) {
      throw { status: 400, message: `Invalid strain type: ${strainType}`, code: 'INVALID_STRAIN_TYPE' };
    }
    
    const strains = await strainServices[strainType].getSpecials();
    return strains;
  } catch (error) {
    console.error(`[CONTROLLER] Error getting special ${strainType} strains:`, error);
    throw error;
  }
};

/**
 * Get medical strains by CBD content
 * @param {number} minCbd - Minimum CBD percentage
 * @returns {Promise<Array>} - List of medical strains
 */
const getMedicalStrainsByCbd = async (minCbd) => {
  try {
    console.log(`[CONTROLLER] Getting medical strains with minimum CBD content: ${minCbd}%`);
    
    const strains = await strainServices.medical.getByCbdContent(minCbd);
    return strains;
  } catch (error) {
    console.error(`[CONTROLLER] Error getting medical strains by CBD content:`, error);
    throw error;
  }
};

/**
 * Get medical strains by condition
 * @param {string} condition - Medical condition
 * @returns {Promise<Array>} - List of medical strains
 */
const getMedicalStrainsByCondition = async (condition) => {
  try {
    console.log(`[CONTROLLER] Getting medical strains for condition: ${condition}`);
    
    const strains = await strainServices.medical.getByCondition(condition);
    return strains;
  } catch (error) {
    console.error(`[CONTROLLER] Error getting medical strains by condition:`, error);
    throw error;
  }
};

/**
 * Get all strains from all categories
 * @param {Object} options - Query options
 * @returns {Promise<Object>} - All strains grouped by category
 */
const getAllStrains = async (options = {}) => {
  try {
    console.log(`[CONTROLLER] Getting all strains with options:`, options);
    
    const result = {};
    const strainTypes = Object.keys(strainServices);
    
    // Process each strain type in parallel
    await Promise.all(strainTypes.map(async (type) => {
      try {
        const data = await strainServices[type].getAll(options);
        result[type] = data;
      } catch (error) {
        console.error(`[CONTROLLER] Error getting ${type} strains:`, error);
        result[type] = { error: error.message, strains: [] };
      }
    }));
    
    return result;
  } catch (error) {
    console.error(`[CONTROLLER] Error getting all strains:`, error);
    throw error;
  }
};

module.exports = {
  getStrains,
  getStrainById,
  getStrainsByType,
  getStrainsByLocation,
  getSpecialStrains,
  getMedicalStrainsByCbd,
  getMedicalStrainsByCondition,
  getAllStrains
};