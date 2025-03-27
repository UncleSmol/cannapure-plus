/**
 * Export unified strain service
 * 
 * This replaces the previous multiple category-specific services 
 * with a single unified service that works with the universal strains table.
 */

// Export the base service as the single point of access for all strain operations
module.exports = require('./base-service');
