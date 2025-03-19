const db = require('../../database');

/**
 * Get all strains with filtering and pagination
 * @param {Object} options - Query options
 * @returns {Promise<Object>} - Strains with pagination info
 */
const getAllStrains = async (options = {}) => {
  try {
    console.log(`[STRAINS API] Getting all strains with options:`, options);
    
    const { 
      limit = 20, 
      offset = 0, 
      type, 
      thcMin, 
      thcMax, 
      cbdMin, 
      cbdMax, 
      sortBy = 'strain_name', 
      sortDir = 'ASC' 
    } = options;
    
    // Get all strain tables
    const tables = [
      'medical_strains',
      'normal_strains',
      'greenhouse_strains',
      'indoor_strains',
      'exotic_tunnel_strains'
    ];
    
    const result = {};
    
    // Query each table
    for (const table of tables) {
      try {
        // Build query
        let query = `SELECT * FROM ${table} WHERE 1=1`;
        const params = [];
        
        // Apply filters if provided
        if (type) {
          query += ' AND strain_type = ?';
          params.push(type);
        }
        
        // Apply sorting
        const allowedSortFields = ['strain_name', 'strain_type', 'price', 'created_at'];
        const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'strain_name';
        const direction = sortDir.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
        
        query += ` ORDER BY ${sortField} ${direction}`;
        
        // Apply pagination
        query += ' LIMIT ? OFFSET ?';
        params.push(Number(limit), Number(offset));
        
        console.log(`[STRAINS API] Querying ${table} with:`, query, params);
        
        // Execute query
        const [strains] = await db.query(query, params);
        
        // Get total count for pagination
        const [countResult] = await db.query(`SELECT COUNT(*) as total FROM ${table} WHERE 1=1`, 
          params.slice(0, params.length - 2)); // Remove limit and offset
        
        console.log(`[STRAINS API] Found ${strains.length} strains in ${table}`);
        
        // Add to result
        result[table] = {
          strains,
          pagination: {
            total: countResult[0].total,
            limit: Number(limit),
            offset: Number(offset),
            pages: Math.ceil(countResult[0].total / Number(limit))
          }
        };
      } catch (error) {
        console.error(`[STRAINS API] Error querying ${table}:`, error);
        result[table] = { error: error.message, strains: [] };
      }
    }
    
    return result;
  } catch (error) {
    console.error(`[STRAINS API] Error in getAllStrains:`, error);
    throw error;
  }
};

/**
 * Get strains of a specific type
 * @param {string} type - Strain type (medical, normal, etc.)
 * @param {Object} options - Query options
 * @returns {Promise<Object>} - Strains with pagination info
 */
const getStrains = async (type, options = {}) => {
  try {
    console.log(`[STRAINS API] Getting ${type} strains with options:`, options);
    
    const { 
      limit = 20, 
      offset = 0, 
      minPrice, 
      maxPrice, 
      location, 
      sortBy = 'strain_name', 
      sortDir = 'ASC' 
    } = options;
    
    // Map type to table name
    const tableMap = {
      'medical': 'medical_strains',
      'normal': 'normal_strains',
      'greenhouse': 'greenhouse_strains',
      'indoor': 'indoor_strains',
      'exotic': 'exotic_tunnel_strains',
      'edibles': 'edibles',
      'extracts': 'extracts_vapes',
      'preRolled': 'pre_rolled'
    };
    
    const tableName = tableMap[type];
    
    if (!tableName) {
      throw { status: 400, message: `Invalid strain type: ${type}`, code: 'INVALID_STRAIN_TYPE' };
    }
    
    // Build query
    let query = `SELECT * FROM ${tableName} WHERE 1=1`;
    const params = [];
    
    // Apply filters if provided
    if (minPrice !== undefined) {
      query += ' AND price >= ?';
      params.push(parseFloat(minPrice));
    }
    
    if (maxPrice !== undefined) {
      query += ' AND price <= ?';
      params.push(parseFloat(maxPrice));
    }
    
    if (location) {
      query += ' AND store_location = ?';
      params.push(location);
    }
    
    // Apply sorting
    const allowedSortFields = ['strain_name', 'strain_type', 'price', 'created_at'];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'strain_name';
    const direction = sortDir.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
    
    query += ` ORDER BY ${sortField} ${direction}`;
    
    // Apply pagination
    query += ' LIMIT ? OFFSET ?';
    params.push(Number(limit), Number(offset));
    
    console.log(`[STRAINS API] Executing query:`, query, params);
    
    // Execute query
    const [strains] = await db.query(query, params);
    
    // Get total count for pagination
    const [countResult] = await db.query(`SELECT COUNT(*) as total FROM ${tableName} WHERE 1=1`, 
      params.slice(0, params.length - 2)); // Remove limit and offset
    
    console.log(`[STRAINS API] Found ${strains.length} ${type} strains`);
    
    // Log each strain for debugging
    strains.forEach((strain, index) => {
      console.log(`[STRAINS API] ${type} Strain #${index + 1}:`, {
        id: strain.id,
        name: strain.strain_name,
        type: strain.strain_type,
        price: strain.price
      });
    });
    
    return {
      strains,
      pagination: {
        total: countResult[0].total,
        limit: Number(limit),
        offset: Number(offset),
        pages: Math.ceil(countResult[0].total / Number(limit))
      }
    };
  } catch (error) {
    console.error(`[STRAINS API] Error in getStrains:`, error);
    throw error;
  }
};

/**
 * Get strain by ID
 * @param {string} type - Strain type (medical, normal, etc.)
 * @param {number} id - Strain ID
 * @returns {Promise<Object>} - Strain data
 */
const getStrainById = async (type, id) => {
  try {
    console.log(`[STRAINS API] Getting ${type} strain with ID: ${id}`);
    
    // Map type to table name
    const tableMap = {
      'medical': 'medical_strains',
      'normal': 'normal_strains',
      'greenhouse': 'greenhouse_strains',
      'indoor': 'indoor_strains',
      'exotic': 'exotic_tunnel_strains',
      'edibles': 'edibles',
      'extracts': 'extracts_vapes',
      'preRolled': 'pre_rolled'
    };
    
    const tableName = tableMap[type];
    
    if (!tableName) {
      throw { status: 400, message: `Invalid strain type: ${type}`, code: 'INVALID_STRAIN_TYPE' };
    }
    
    const [strains] = await db.query(`SELECT * FROM ${tableName} WHERE id = ?`, [id]);
    
    if (strains.length === 0) {
      throw { status: 404, message: `Strain not found`, code: 'STRAIN_NOT_FOUND' };
    }
    
    console.log(`[STRAINS API] Found strain:`, strains[0]);
    
    return strains[0];
  } catch (error) {
    console.error(`[STRAINS API] Error in getStrainById:`, error);
    throw error;
  }
};

/**
 * Get strains by cannabis type (Indica, Sativa, Hybrid)
 * @param {string} type - Strain type (medical, normal, etc.)
 * @param {string} cannabisType - Cannabis type (Indica, Sativa, Hybrid)
 * @returns {Promise<Array>} - List of strains
 */
const getStrainsByType = async (type, cannabisType) => {
  try {
    console.log(`[STRAINS API] Getting ${type} strains with cannabis type: ${cannabisType}`);
    
    // Map type to table name
    const tableMap = {
      'medical': 'medical_strains',
      'normal': 'normal_strains',
      'greenhouse': 'greenhouse_strains',
      'indoor': 'indoor_strains',
      'exotic': 'exotic_tunnel_strains'
    };
    
    const tableName = tableMap[type];
    
    if (!tableName) {
      throw { status: 400, message: `Invalid strain type: ${type}`, code: 'INVALID_STRAIN_TYPE' };
    }
    
    const [strains] = await db.query(
      `SELECT * FROM ${tableName} WHERE strain_type = ?`, 
      [cannabisType]
    );
    
    console.log(`[STRAINS API] Found ${strains.length} ${type} strains of cannabis type ${cannabisType}`);
    
    // Log each strain for debugging
    strains.forEach((strain, index) => {
      console.log(`[STRAINS API] ${type} ${cannabisType} Strain #${index + 1}:`, {
        id: strain.id,
        name: strain.strain_name,
        price: strain.price
      });
    });
    
    return strains;
  } catch (error) {
    console.error(`[STRAINS API] Error in getStrainsByType:`, error);
    throw error;
  }
};

/**
 * Get strains by location
 * @param {string} type - Strain type (medical, normal, etc.)
 * @param {string} location - Store location
 * @returns {Promise<Array>} - List of strains
 */
const getStrainsByLocation = async (type, location) => {
  try {
    console.log(`[STRAINS API] Getting ${type} strains at location: ${location}`);
    
    // Map type to table name
    const tableMap = {
      'medical': 'medical_strains',
      'normal': 'normal_strains',
      'greenhouse': 'greenhouse_strains',
      'indoor': 'indoor_strains',
      'exotic': 'exotic_tunnel_strains',
      'edibles': 'edibles',
      'extracts': 'extracts_vapes',
      'preRolled': 'pre_rolled'
    };
    
    const tableName = tableMap[type];
    
    if (!tableName) {
      throw { status: 400, message: `Invalid strain type: ${type}`, code: 'INVALID_STRAIN_TYPE' };
    }
    
    const [strains] = await db.query(
      `SELECT * FROM ${tableName} WHERE store_location = ?`, 
      [location]
    );
    
    console.log(`[STRAINS API] Found ${strains.length} ${type} strains at location ${location}`);
    
    return strains;
  } catch (error) {
    console.error(`[STRAINS API] Error in getStrainsByLocation:`, error);
    throw error;
  }
};

/**
 * Get special strains
 * @param {string} type - Strain type (medical, normal, etc.)
 * @returns {Promise<Array>} - List of special strains
 */
const getSpecialStrains = async (type) => {
  try {
    console.log(`[STRAINS API] Getting special ${type} strains`);
    
    // Map type to table name
    const tableMap = {
      'medical': 'medical_strains',
      'normal': 'normal_strains',
      'greenhouse': 'greenhouse_strains',
      'indoor': 'indoor_strains',
      'exotic': 'exotic_tunnel_strains',
      'edibles': 'edibles',
      'extracts': 'extracts_vapes',
      'preRolled': 'pre_rolled'
    };
    
    const tableName = tableMap[type];
    
    if (!tableName) {
      throw { status: 400, message: `Invalid strain type: ${type}`, code: 'INVALID_STRAIN_TYPE' };
    }
    
    const [strains] = await db.query(
      `SELECT * FROM ${tableName} WHERE special = 1 OR specials_tag IS NOT NULL`
    );
    
    console.log(`[STRAINS API] Found ${strains.length} special ${type} strains`);
    
    return strains;
  } catch (error) {
    console.error(`[STRAINS API] Error in getSpecialStrains:`, error);
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
    console.log(`[STRAINS API] Getting medical strains with minimum CBD content: ${minCbd}%`);
    
    // For demonstration, we'll just query all medical strains
    // In a real implementation, you would filter by CBD content
    const [strains] = await db.query(
      `SELECT * FROM medical_strains`
    );
    
    console.log(`[STRAINS API] Found ${strains.length} medical strains`);
    
    // Log each strain for debugging
    strains.forEach((strain, index) => {
      console.log(`[STRAINS API] Medical Strain #${index + 1}:`, {
        id: strain.id,
        name: strain.strain_name,
        type: strain.strain_type,
        price: strain.price,
        thc: strain.thc
      });
    });
    
    return strains;
  } catch (error) {
    console.error(`[STRAINS API] Error in getMedicalStrainsByCbd:`, error);
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
    console.log(`[STRAINS API] Getting medical strains for condition: ${condition}`);
    
    // Search in description for the condition
    const [strains] = await db.query(
      `SELECT * FROM medical_strains WHERE description LIKE ?`,
      [`%${condition}%`]
    );
    
    console.log(`[STRAINS API] Found ${strains.length} medical strains for condition: ${condition}`);
    
    // Log each strain for debugging
    strains.forEach((strain, index) => {
      console.log(`[STRAINS API] Medical Strain for ${condition} #${index + 1}:`, {
        id: strain.id,
        name: strain.strain_name,
        type: strain.strain_type,
        price: strain.price,
        description: strain.description ? strain.description.substring(0, 50) + '...' : 'No description'
      });
    });
    
    return strains;
  } catch (error) {
    console.error(`[STRAINS API] Error in getMedicalStrainsByCondition:`, error);
    throw error;
  }
};

/**
 * Create a new strain
 * @param {Object} strainData - Strain data
 * @returns {Promise<Object>} - Created strain
 */
const createStrain = async (strainData) => {
  try {
    console.log(`[STRAINS API] Creating new strain:`, strainData);
    
    // Implementation would go here
    throw { status: 501, message: 'Not implemented', code: 'NOT_IMPLEMENTED' };
  } catch (error) {
    console.error(`[STRAINS API] Error in createStrain:`, error);
    throw error;
  }
};

/**
 * Update a strain
 * @param {string} type - Strain type
 * @param {number} id - Strain ID
 * @param {Object} strainData - Updated strain data
 * @returns {Promise<Object>} - Updated strain
 */
const updateStrain = async (type, id, strainData) => {
  try {
    console.log(`[STRAINS API] Updating ${type} strain ${id}:`, strainData);
    
    // Implementation would go here
    throw { status: 501, message: 'Not implemented', code: 'NOT_IMPLEMENTED' };
  } catch (error) {
    console.error(`[STRAINS API] Error in updateStrain:`, error);
    throw error;
  }
};

/**
 * Delete a strain
 * @param {string} type - Strain type
 * @param {number} id - Strain ID
 * @returns {Promise<void>}
 */
const deleteStrain = async (type, id) => {
  try {
    console.log(`[STRAINS API] Deleting ${type} strain ${id}`);
    
    // Implementation would go here
    throw { status: 501, message: 'Not implemented', code: 'NOT_IMPLEMENTED' };
  } catch (error) {
    console.error(`[STRAINS API] Error in deleteStrain:`, error);
    throw error;
  }
};

module.exports = {
  getAllStrains,
  getStrains,
  getStrainById,
  getStrainsByType,
  getStrainsByLocation,
  getSpecialStrains,
  getMedicalStrainsByCbd,
  getMedicalStrainsByCondition,
  createStrain,
  updateStrain,
  deleteStrain
};