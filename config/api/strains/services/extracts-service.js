const BaseStrainService = require('./base-service');
const db = require('../../../../database');

/**
 * Service for extracts and vapes operations
 */
class ExtractsService extends BaseStrainService {
  constructor() {
    super('extracts_vapes');
  }
  
  /**
   * Get extracts by potency
   * @param {number} minPotency - Minimum THC percentage
   * @returns {Promise<Array>} - List of extracts
   */
  async getByPotency(minPotency) {
    try {
      console.log(`[EXTRACTS] Fetching extracts with minimum potency of ${minPotency}%`);
      
      // Extract potency from the THC field
      const [extracts] = await db.query(
        `SELECT * FROM ${this.tableName} WHERE thc LIKE ?`,
        [`%THC: ${minPotency}%%`]
      );
      
      console.log(`[EXTRACTS] Found ${extracts.length} extracts with minimum potency of ${minPotency}%`);
      return extracts;
    } catch (error) {
      console.error(`[EXTRACTS] Error in getByPotency:`, error);
      throw error;
    }
  }
}

module.exports = new ExtractsService();
