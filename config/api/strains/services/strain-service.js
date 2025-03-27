const mysql = require('mysql2/promise');
const config = require('../../../database/config');
const pool = mysql.createPool(config.mysql);

/**
 * Get strains with filters
 * @param {Object} filters - Filter parameters
 * @returns {Promise<Object>} - Strains and count
 */
const getStrains = async (filters = {}) => {
  console.log('[SERVICE] Getting strains with filters:', filters);
  
  let query = 'SELECT * FROM strains WHERE 1=1';
  const queryParams = [];
  
  // Apply category filter
  if (filters.category) {
    query += ' AND category = ?';
    queryParams.push(filters.category);
  }
  
  // Apply THC filters
  if (filters.thcMin) {
    query += ' AND thc_content >= ?';
    queryParams.push(parseFloat(filters.thcMin));
  }
  
  if (filters.thcMax) {
    query += ' AND thc_content <= ?';
    queryParams.push(parseFloat(filters.thcMax));
  }
  
  // Apply CBD filters
  if (filters.cbdMin) {
    query += ' AND cbd_content >= ?';
    queryParams.push(parseFloat(filters.cbdMin));
  }
  
  if (filters.cbdMax) {
    query += ' AND cbd_content <= ?';
    queryParams.push(parseFloat(filters.cbdMax));
  }
  
  // Apply strain type filter
  if (filters.strainType) {
    query += ' AND strain_type = ?';
    queryParams.push(filters.strainType);
  }
  
  // Apply location filter
  if (filters.location) {
    query += ' AND store_location = ?';
    queryParams.push(filters.location);
  }
  
  // Apply special filter
  if (filters.special === true) {
    query += ' AND is_special = 1';
  }
  
  // Apply price filters
  if (filters.minPrice) {
    query += ' AND price >= ?';
    queryParams.push(parseFloat(filters.minPrice));
  }
  
  if (filters.maxPrice) {
    query += ' AND price <= ?';
    queryParams.push(parseFloat(filters.maxPrice));
  }
  
  // Get total count for pagination
  const countQuery = query.replace('SELECT *', 'SELECT COUNT(*) as count');
  const [countResult] = await pool.execute(countQuery, queryParams);
  const totalCount = countResult[0].count;
  
  // Apply sorting
  if (filters.sortBy) {
    const validColumns = ['strain_name', 'thc_content', 'cbd_content', 'price', 'strain_type'];
    const validDirections = ['asc', 'desc'];
    
    const sortColumn = validColumns.includes(filters.sortBy) ? filters.sortBy : 'strain_name';
    const sortDirection = validDirections.includes(filters.sortDir) ? filters.sortDir : 'asc';
    
    query += ` ORDER BY ${sortColumn} ${sortDirection}`;
  } else {
    query += ' ORDER BY strain_name ASC';
  }
  
  // Apply pagination
  if (filters.limit) {
    query += ' LIMIT ?';
    queryParams.push(parseInt(filters.limit));
    
    if (filters.offset) {
      query += ' OFFSET ?';
      queryParams.push(parseInt(filters.offset));
    }
  }
  
  // Execute query
  const [rows] = await pool.execute(query, queryParams);
  
  return {
    strains: rows,
    count: totalCount,
    filters: filters
  };
};

/**
 * Get strain by ID
 * @param {string|number} id - Strain ID
 * @param {string} category - Strain category
 * @returns {Promise<Object>} - Strain object
 */
const getStrainById = async (id, category) => {
  console.log(`[SERVICE] Getting strain with ID: ${id}, category: ${category}`);
  
  let query = 'SELECT * FROM strains WHERE id = ?';
  const queryParams = [id];
  
  if (category) {
    query += ' AND category = ?';
    queryParams.push(category);
  }
  
  const [rows] = await pool.execute(query, queryParams);
  return rows.length > 0 ? rows[0] : null;
};

/**
 * Get strains by medical condition
 * @param {string} condition - Medical condition
 * @returns {Promise<Object>} - Strains and count
 */
const getStrainsByCondition = async (condition) => {
  console.log(`[SERVICE] Getting strains for condition: ${condition}`);
  
  // Using LIKE to find strains that mention this condition in their medical_uses field
  const query = `
    SELECT * FROM strains 
    WHERE category = 'medical' 
    AND medical_uses LIKE ?
    ORDER BY strain_name ASC
  `;
  
  const [rows] = await pool.execute(query, [`%${condition}%`]);
  
  return {
    strains: rows,
    count: rows.length,
    condition: condition
  };
};

/**
 * Create a new strain
 * @param {Object} data - Strain data
 * @returns {Promise<Object>} - Created strain
 */
const createStrain = async (data) => {
  console.log('[SERVICE] Creating new strain:', data);
  
  const columns = Object.keys(data).join(', ');
  const placeholders = Object.keys(data).map(() => '?').join(', ');
  const values = Object.values(data);
  
  const query = `INSERT INTO strains (${columns}) VALUES (${placeholders})`;
  
  const [result] = await pool.execute(query, values);
  
  return getStrainById(result.insertId, data.category);
};

/**
 * Update a strain
 * @param {string|number} id - Strain ID
 * @param {Object} data - Updated strain data
 * @param {string} category - Strain category
 * @returns {Promise<Object>} - Updated strain
 */
const updateStrain = async (id, data, category) => {
  console.log(`[SERVICE] Updating strain with ID: ${id}, category: ${category}`);
  
  // Check if strain exists
  const strain = await getStrainById(id, category);
  if (!strain) {
    return null;
  }
  
  // Build update query
  const updates = Object.keys(data).map(key => `${key} = ?`).join(', ');
  const values = [...Object.values(data), id];
  
  let query = `UPDATE strains SET ${updates} WHERE id = ?`;
  
  if (category) {
    query += ' AND category = ?';
    values.push(category);
  }
  
  await pool.execute(query, values);
  
  return getStrainById(id, data.category || category);
};

/**
 * Delete a strain
 * @param {string|number} id - Strain ID
 * @param {string} category - Strain category
 * @returns {Promise<boolean>} - Success status
 */
const deleteStrain = async (id, category) => {
  console.log(`[SERVICE] Deleting strain with ID: ${id}, category: ${category}`);
  
  // Check if strain exists
  const strain = await getStrainById(id, category);
  if (!strain) {
    return false;
  }
  
  let query = 'DELETE FROM strains WHERE id = ?';
  const queryParams = [id];
  
  if (category) {
    query += ' AND category = ?';
    queryParams.push(category);
  }
  
  const [result] = await pool.execute(query, queryParams);
  
  return result.affectedRows > 0;
};

module.exports = {
  getStrains,
  getStrainById,
  getStrainsByCondition,
  createStrain,
  updateStrain,
  deleteStrain
};