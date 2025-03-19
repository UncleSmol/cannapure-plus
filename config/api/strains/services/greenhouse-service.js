const BaseStrainService = require('./base-service');

/**
 * Service for greenhouse strains operations
 */
class GreenhouseStrainService extends BaseStrainService {
  constructor() {
    super('greenhouse_strains');
  }
}

module.exports = new GreenhouseStrainService();