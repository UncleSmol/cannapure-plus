const BaseStrainService = require('./base-service');

/**
 * Service for exotic tunnel strains operations
 */
class ExoticStrainService extends BaseStrainService {
  constructor() {
    super('exotic_tunnel_strains');
  }
}

module.exports = new ExoticStrainService();