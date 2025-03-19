const BaseStrainService = require('./base-service');
const db = require('../../../../database');

/**
 * Service for edibles operations
 */
class EdiblesService extends BaseStrainService {
  constructor() {
    super('edibles');
  }
  
  /**
   * Get edibles by potency
   * @param {number} minPotency - Minimum THC potency in mg
   * @param {number} maxPotency - Maximum THC potency in mg
   * @returns {Promise<Array>} - List of edibles
   */
  async getByPotency(minPotency, maxPotency) {
    try {
      console.log(`[EDIBLES] Fetching edibles with potency between ${minPotency}mg and ${maxPotency}mg`);
      
      // Extract potency from the THC field
      const [edibles] = await db.query(
        `SELECT * FROM ${this.tableName} WHERE thc LIKE ?`,
        [`%THC: ${minPotency}-${maxPotency}mg%`]
      );
      
      console.log(`[EDIBLES] Found ${edibles.length} edibles in the specified potency range`);
      return edibles;
    } catch (error) {
      console.error(`[EDIBLES] Error in getByPotency:`, error);
      throw error;
    }
  }
}

module.exports = new EdiblesService();
