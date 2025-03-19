const BaseStrainService = require('./base-service');

/**
 * Service for normal strains operations
 */
class NormalStrainService extends BaseStrainService {
  constructor() {
    super('normal_strains');
  }
}

module.exports = new NormalStrainService();