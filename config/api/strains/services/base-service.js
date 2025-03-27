// Updated base-service.js to work with the universal strains table
const db = require('../../../../database');

/**
 * Base class for strain-related services
 * Works with the unified strains table
 */
class BaseStrainService {
  constructor() {
    this.tableName = 'strains';
  }

  /**
   * Get strains with filters
   * @param {Object} filters - Filter options
   * @param {string} filters.category - Strain category (medical, edible, etc.)
   * @param {number} filters.thcMin - Minimum THC percentage
   * @param {number} filters.thcMax - Maximum THC percentage
   * @param {number} filters.cbdMin - Minimum CBD percentage
   * @param {number} filters.cbdMax - Maximum CBD percentage
   * @param {string} filters.strainType - Strain type (Indica, Sativa, Hybrid)
   * @param {string} filters.location - Store location
   * @param {boolean} filters.special - Special strains only
   * @param {number} filters.limit - Maximum results
   * @param {number} filters.offset - Results offset
   * @param {string} filters.sortBy - Sort field
   * @param {string} filters.sortDir - Sort direction
   * @returns {Promise<Object>} - Strains with pagination info
   */
  async getStrains(filters = {}) {
    try {
      const {
        category,
        thcMin,
        thcMax,
        cbdMin,
        cbdMax,
        strainType,
        location,
        special,
        minPrice,
        maxPrice,
        limit = 20,
        offset = 0,
        sortBy = 'strain_name',
        sortDir = 'ASC'
      } = filters;

      console.log(`[STRAINS] Fetching strains with filters:`, filters);

      // Build query
      let query = `SELECT * FROM ${this.tableName} WHERE 1=1`;
      const params = [];

      // Apply filters if provided
      if (category) {
        query += ' AND category = ?';
        params.push(category);
      }

      if (thcMin !== undefined) {
        query += ' AND thc >= ?';
        params.push(parseFloat(thcMin));
      }

      if (thcMax !== undefined) {
        query += ' AND thc <= ?';
        params.push(parseFloat(thcMax));
      }

      if (cbdMin !== undefined) {
        query += ' AND cbd >= ?';
        params.push(parseFloat(cbdMin));
      }

      if (cbdMax !== undefined) {
        query += ' AND cbd <= ?';
        params.push(parseFloat(cbdMax));
      }

      if (strainType) {
        query += ' AND strain_type = ?';
        params.push(strainType);
      }

      if (location) {
        query += ' AND store_location = ?';
        params.push(location);
      }

      if (special !== undefined) {
        query += ' AND special = ?';
        params.push(special ? 1 : 0);
      }

      if (minPrice !== undefined) {
        query += ' AND price >= ?';
        params.push(parseFloat(minPrice));
      }

      if (maxPrice !== undefined) {
        query += ' AND price <= ?';
        params.push(parseFloat(maxPrice));
      }

      // Apply sorting
      const allowedSortFields = ['strain_name', 'strain_type', 'price', 'thc', 'cbd', 'created_at'];
      const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'strain_name';
      const direction = sortDir.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

      query += ` ORDER BY ${sortField} ${direction}`;

      // Apply pagination
      query += ' LIMIT ? OFFSET ?';
      params.push(Number(limit), Number(offset));

      console.log(`[STRAINS] Executing query:`, query, params);

      // Execute query
      const [strains] = await db.query(query, params);

      // Get count for pagination (without limit/offset)
      const countQuery = query.split(' LIMIT ')[0].replace('SELECT *', 'SELECT COUNT(*) as total');
      const [countResult] = await db.query(countQuery, params.slice(0, -2));

      console.log(`[STRAINS] Found ${strains.length} strains`);

      // Format strains for backward compatibility
      const formattedStrains = this._formatStrainsForLegacyCode(strains);

      return {
        strains: formattedStrains,
        pagination: {
          total: countResult[0].total,
          limit: Number(limit),
          offset: Number(offset),
          pages: Math.ceil(countResult[0].total / Number(limit))
        }
      };
    } catch (error) {
      console.error(`[STRAINS] Error in getStrains:`, error);
      throw error;
    }
  }

  /**
   * Get a strain by ID
   * @param {number} id - Strain ID
   * @param {string} category - Optional category filter
   * @returns {Promise<Object>} - Strain data
   */
  async getStrainById(id, category = null) {
    try {
      console.log(`[STRAINS] Fetching strain with ID: ${id}${category ? `, category: ${category}` : ''}`);

      let query = `SELECT * FROM ${this.tableName} WHERE id = ?`;
      const params = [id];

      if (category) {
        query += ' AND category = ?';
        params.push(category);
      }

      const [strains] = await db.query(query, params);

      if (strains.length === 0) {
        console.log(`[STRAINS] No strain found with ID: ${id}`);
        return null;
      }

      console.log(`[STRAINS] Found strain with ID: ${id}`);

      // Format strain for backward compatibility
      return this._formatStrainsForLegacyCode([strains[0]])[0];
    } catch (error) {
      console.error(`[STRAINS] Error in getStrainById:`, error);
      throw error;
    }
  }

  /**
   * Create a new strain
   * @param {Object} strainData - Strain data
   * @returns {Promise<Object>} - Created strain
   */
  async createStrain(strainData) {
    try {
      console.log(`[STRAINS] Creating new strain:`, strainData.strain_name);

      // Handle THC/CBD values if they're provided as strings
      const data = { ...strainData };

      if (typeof data.thc === 'string') {
        data.thc = this._extractPercentageFromString(data.thc);
      }

      if (typeof data.cbd === 'string') {
        data.cbd = this._extractPercentageFromString(data.cbd);
      }

      const [result] = await db.query(
        `INSERT INTO ${this.tableName} SET ?`,
        [data]
      );

      console.log(`[STRAINS] Created strain with ID: ${result.insertId}`);

      return this.getStrainById(result.insertId);
    } catch (error) {
      console.error(`[STRAINS] Error in createStrain:`, error);
      throw error;
    }
  }

  /**
   * Update a strain
   * @param {number} id - Strain ID
   * @param {Object} strainData - Updated strain data
   * @param {string} category - Optional category filter
   * @returns {Promise<Object>} - Updated strain
   */
  async updateStrain(id, strainData, category = null) {
    try {
      console.log(`[STRAINS] Updating strain with ID: ${id}`);

      // Handle THC/CBD values if they're provided as strings
      const data = { ...strainData };

      if (typeof data.thc === 'string') {
        data.thc = this._extractPercentageFromString(data.thc);
      }

      if (typeof data.cbd === 'string') {
        data.cbd = this._extractPercentageFromString(data.cbd);
      }

      let query = `UPDATE ${this.tableName} SET ? WHERE id = ?`;
      const params = [data, id];

      if (category) {
        query += ' AND category = ?';
        params.push(category);
      }

      const [result] = await db.query(query, params);

      if (result.affectedRows === 0) {
        console.log(`[STRAINS] No strain found with ID: ${id}`);
        return null;
      }

      console.log(`[STRAINS] Updated strain with ID: ${id}`);

      return this.getStrainById(id);
    } catch (error) {
      console.error(`[STRAINS] Error in updateStrain:`, error);
      throw error;
    }
  }

  /**
   * Delete a strain
   * @param {number} id - Strain ID
   * @param {string} category - Optional category filter
   * @returns {Promise<boolean>} - Success status
   */
  async deleteStrain(id, category = null) {
    try {
      console.log(`[STRAINS] Deleting strain with ID: ${id}`);

      let query = `DELETE FROM ${this.tableName} WHERE id = ?`;
      const params = [id];

      if (category) {
        query += ' AND category = ?';
        params.push(category);
      }

      const [result] = await db.query(query, params);

      if (result.affectedRows === 0) {
        console.log(`[STRAINS] No strain found with ID: ${id}`);
        return false;
      }

      console.log(`[STRAINS] Deleted strain with ID: ${id}`);

      return true;
    } catch (error) {
      console.error(`[STRAINS] Error in deleteStrain:`, error);
      throw error;
    }
  }

  /**
   * Format strains data for backward compatibility with existing frontend code
   * @private
   * @param {Array} strains - Strains data from database
   * @returns {Array} - Formatted strains data
   */
  _formatStrainsForLegacyCode(strains) {
    return strains.map(strain => {
      const formattedStrain = { ...strain };
      
      // Format THC and CBD as strings to maintain backward compatibility
      if (typeof formattedStrain.thc === 'number') {
        if (formattedStrain.category === 'edible') {
          // For edibles, convert percentage back to mg (×10)
          formattedStrain.thc = `THC: ${(formattedStrain.thc * 10).toFixed(0)}mg`;
        } else {
          formattedStrain.thc = `THC: ${formattedStrain.thc}%`;
        }
      }
      
      if (typeof formattedStrain.cbd === 'number' && formattedStrain.cbd > 0) {
        // Add CBD info to THC string for backward compatibility
        formattedStrain.thc = `${formattedStrain.thc}, CBD: ${formattedStrain.cbd}%`;
      }
      
      return formattedStrain;
    });
  }

  /**
   * Extract percentage value from string
   * @private
   * @param {string} str - String containing percentage (e.g., "THC: 20%")
   * @returns {number|null} - Extracted percentage as number
   */
  _extractPercentageFromString(str) {
    if (!str) return null;
    
    // Handle ranges like "THC: 20-25%"
    if (str.includes('-')) {
      const matches = str.match(/(\d+)-(\d+)/);
      if (matches && matches.length >= 3) {
        const min = parseFloat(matches[1]);
        const max = parseFloat(matches[2]);
        return (min + max) / 2; // Return the average of the range
      }
    }
    
    // Handle "mg" units for edibles
    if (str.includes('mg')) {
      const matches = str.match(/(\d+)mg/);
      if (matches && matches.length >= 2) {
        return parseFloat(matches[1]) / 10; // Convert mg to percentage equivalent
      }
    }
    
    // Handle standard percentage format
    const matches = str.match(/(\d+(\.\d+)?)%/);
    if (matches && matches.length >= 2) {
      return parseFloat(matches[1]);
    }
    
    return null;
  }
}

module.exports = new BaseStrainService();