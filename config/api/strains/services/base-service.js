const db = require('../../../database');

/**
 * Base service for strain operations
 * Provides reusable methods for all strain types
 */
class BaseStrainService {
  /**
   * Create a new strain service
   * @param {string} tableName - Database table name for this strain type
   */
  constructor(tableName) {
    this.tableName = tableName;
  }

  /**
   * Get all strains with filtering, pagination and sorting
   * @param {Object} options - Query options
   * @returns {Promise<Object>} - Strains with pagination info
   */
  async getAll(options = {}) {
    try {
      console.log(`[${this.tableName.toUpperCase()}] Fetching strains with options:`, options);
      
      const { 
        limit = 20, 
        offset = 0, 
        type, 
        minPrice, 
        maxPrice, 
        location,
        sortBy = 'strain_name', 
        sortDir = 'ASC' 
      } = options;
      
      // Build query
      let query = `SELECT * FROM ${this.tableName} WHERE 1=1`;
      const params = [];
      
      // Apply filters
      if (type) {
        query += ' AND strain_type = ?';
        params.push(type);
      }
      
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
      
      console.log(`[${this.tableName.toUpperCase()}] Executing query:`, query);
      console.log(`[${this.tableName.toUpperCase()}] Query parameters:`, params);
      
      // Execute query
      const [strains] = await db.query(query, params);
      
      console.log(`[${this.tableName.toUpperCase()}] Found ${strains.length} strains`);
      
      // Get total count for pagination
      const [countResult] = await db.query(`SELECT COUNT(*) as total FROM ${this.tableName} WHERE 1=1`, 
        params.slice(0, params.length - 2)); // Remove limit and offset
      
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
      console.error(`[${this.tableName.toUpperCase()}] Error in getAll:`, error);
      throw error;
    }
  }

  /**
   * Get strain by ID
   * @param {number} id - Strain ID
   * @returns {Promise<Object>} - Strain data
   */
  async getById(id) {
    try {
      console.log(`[${this.tableName.toUpperCase()}] Fetching strain with ID: ${id}`);
      
      const [strains] = await db.query(`SELECT * FROM ${this.tableName} WHERE id = ?`, [id]);
      
      if (strains.length === 0) {
        const error = { 
          status: 404, 
          message: `Strain not found in ${this.tableName}`, 
          code: 'STRAIN_NOT_FOUND' 
        };
        console.error(`[${this.tableName.toUpperCase()}] ${error.message}`);
        throw error;
      }
      
      console.log(`[${this.tableName.toUpperCase()}] Found strain:`, strains[0].strain_name);
      return strains[0];
    } catch (error) {
      console.error(`[${this.tableName.toUpperCase()}] Error in getById:`, error);
      throw error;
    }
  }

  /**
   * Get strains by type
   * @param {string} type - Strain type (Indica, Sativa, Hybrid)
   * @returns {Promise<Array>} - List of strains
   */
  async getByType(type) {
    try {
      console.log(`[${this.tableName.toUpperCase()}] Fetching strains with type: ${type}`);
      
      const [strains] = await db.query(
        `SELECT * FROM ${this.tableName} WHERE strain_type = ?`, 
        [type]
      );
      
      console.log(`[${this.tableName.toUpperCase()}] Found ${strains.length} strains of type ${type}`);
      return strains;
    } catch (error) {
      console.error(`[${this.tableName.toUpperCase()}] Error in getByType:`, error);
      throw error;
    }
  }

  /**
   * Get strains by location
   * @param {string} location - Store location
   * @returns {Promise<Array>} - List of strains
   */
  async getByLocation(location) {
    try {
      console.log(`[${this.tableName.toUpperCase()}] Fetching strains for location: ${location}`);
      
      const [strains] = await db.query(
        `SELECT * FROM ${this.tableName} WHERE store_location = ?`, 
        [location]
      );
      
      console.log(`[${this.tableName.toUpperCase()}] Found ${strains.length} strains at location ${location}`);
      return strains;
    } catch (error) {
      console.error(`[${this.tableName.toUpperCase()}] Error in getByLocation:`, error);
      throw error;
    }
  }

  /**
   * Get special strains
   * @returns {Promise<Array>} - List of special strains
   */
  async getSpecials() {
    try {
      console.log(`[${this.tableName.toUpperCase()}] Fetching special strains`);
      
      const [strains] = await db.query(
        `SELECT * FROM ${this.tableName} WHERE special = 1 OR specials_tag IS NOT NULL`
      );
      
      console.log(`[${this.tableName.toUpperCase()}] Found ${strains.length} special strains`);
      return strains;
    } catch (error) {
      console.error(`[${this.tableName.toUpperCase()}] Error in getSpecials:`, error);
      throw error;
    }
  }
}

module.exports = BaseStrainService;