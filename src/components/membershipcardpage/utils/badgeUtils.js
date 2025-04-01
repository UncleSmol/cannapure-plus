import { BADGE_IMAGES } from './constants';

/**
 * Gets the appropriate badge image based on membership tier
 * @param {string} tier - Membership tier
 * @returns {string} URL to the badge image
 */
export const getBadgeImage = (tier) => {
  if (!tier) return BADGE_IMAGES.basic;
  return BADGE_IMAGES[tier] || BADGE_IMAGES.basic;
};

/**
 * Determines if a badge should be displayed as active
 * @param {string} status - Membership status
 * @returns {boolean} Whether the badge should be active
 */
export const isBadgeActive = (status) => {
  return !status || status.toUpperCase() === 'ACTIVE';
};

/**
 * Gets badge alt text based on tier
 * @param {string} tier - Membership tier
 * @param {Object} tierInfo - Tier information object
 * @returns {string} Alt text for badge image
 */
export const getBadgeAltText = (tier, tierInfo) => {
  if (!tier || !tierInfo) return 'Membership badge';
  return `${tierInfo.name} membership badge`;
};