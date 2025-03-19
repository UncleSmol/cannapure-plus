const BaseStrainService = require('./base-service');

/**
 * Service for indoor strains operations
 */
class IndoorStrainService extends BaseStrainService {
  constructor() {
    super('indoor_strains');
  }
}

module.exports = new IndoorStrainService();