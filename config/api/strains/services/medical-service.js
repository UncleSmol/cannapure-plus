const BaseStrainService = require('./base-service');
const db = require('../../../../database'); // Fixed import path

/**
 * Service for medical strains operations
 * Extends the base strain service with medical-specific functionality
 */
class MedicalStrainService extends BaseStrainService {
  constructor() {
    super('medical_strains');
  }

  /**
   * Get medical strains by CBD content
   * @param {number} minCbd - Minimum CBD percentage
   * @returns {Promise<Array>} - List of medical strains
   */
  async getByCbdContent(minCbd) {
    try {
      console.log(`[MEDICAL_STRAINS] Fetching strains with minimum CBD content: ${minCbd}%`);
      
      // Extract CBD percentage from the THC field which contains CBD info for medical strains
      const [strains] = await db.query(
        `SELECT * FROM ${this.tableName} WHERE thc LIKE ?`,
        [`%CBD: ${minCbd}%`]
      );
      
      console.log(`[MEDICAL_STRAINS] Found ${strains.length} strains with minimum CBD content of ${minCbd}%`);
      
      // Log each strain's CBD content
      strains.forEach((strain, index) => {
        const cbdMatch = strain.thc ? strain.thc.match(/CBD:\s*(\d+)%/) : null;
        const cbdContent = cbdMatch ? cbdMatch[1] : 'unknown';
        console.log(`[MEDICAL_STRAINS] Strain #${index + 1}: ${strain.strain_name}, CBD: ${cbdContent}%`);
      });
      
      return strains;
    } catch (error) {
      console.error(`[MEDICAL_STRAINS] Error in getByCbdContent:`, error);
      throw error;
    }
  }

  /**
   * Get medical strains for specific conditions
   * @param {string} condition - Medical condition
   * @returns {Promise<Array>} - List of medical strains
   */
  async getByCondition(condition) {
    try {
      console.log(`[MEDICAL_STRAINS] Fetching strains for condition: ${condition}`);
      
      // Search in description for the condition
      const [strains] = await db.query(
        `SELECT * FROM ${this.tableName} WHERE description LIKE ?`,
        [`%${condition}%`]
      );
      
      console.log(`[MEDICAL_STRAINS] Found ${strains.length} strains for condition: ${condition}`);
      
      // Log each strain
      strains.forEach((strain, index) => {
        console.log(`[MEDICAL_STRAINS] Strain #${index + 1}:`, {
          id: strain.id,
          name: strain.strain_name,
          type: strain.strain_type,
          price: strain.price,
          description: strain.description ? strain.description.substring(0, 50) + '...' : 'No description'
        });
      });
      
      return strains;
    } catch (error) {
      console.error(`[MEDICAL_STRAINS] Error in getByCondition:`, error);
      throw error;
    }
  }

  /**
   * Get low THC strains (specifically for medical use)
   * @param {number} maxThc - Maximum THC percentage
   * @returns {Promise<Array>} - List of low THC strains
   */
  async getLowThcStrains(maxThc = 5) {
    try {
      console.log(`[MEDICAL_STRAINS] Fetching low THC strains (max ${maxThc}%)`);
      
      // Extract THC percentage from the THC field
      const [strains] = await db.query(
        `SELECT * FROM ${this.tableName} WHERE thc LIKE ?`,
        [`%THC: ${maxThc}% OR LOWER%`]
      );
      
      console.log(`[MEDICAL_STRAINS] Found ${strains.length} low THC strains`);
      
      // Log each strain
      strains.forEach((strain, index) => {
        console.log(`[MEDICAL_STRAINS] Low THC Strain #${index + 1}:`, {
          id: strain.id,
          name: strain.strain_name,
          thc: strain.thc
        });
      });
      
      return strains;
    } catch (error) {
      console.error(`[MEDICAL_STRAINS] Error in getLowThcStrains:`, error);
      throw error;
    }
  }
}

module.exports = new MedicalStrainService();
