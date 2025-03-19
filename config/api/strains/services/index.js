/**
 * Export all strain services
 */
module.exports = {
  medical: require('./medical-service'),
  normal: require('./normal-service'),
  indoor: require('./indoor-service'),
  greenhouse: require('./greenhouse-service'),
  exotic: require('./exotic-service'),
  
  // Add these services if needed
  edibles: require('./edibles-service'),
  extracts: require('./extracts-service'),
  preRolled: require('./pre-rolled-service')
};