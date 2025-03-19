const BaseStrainService = require('./base-service');

/**
 * Service for pre-rolled products operations
 */
class PreRolledService extends BaseStrainService {
  constructor() {
    super('pre_rolled');
  }
}

module.exports = new PreRolledService();