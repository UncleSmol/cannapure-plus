import { TIER_THRESHOLDS, BADGE_IMAGES } from './constants';

/**
 * Determines membership tier based on active days
 * @param {number} days - Number of active days
 * @returns {string} Membership tier (basic, gold, diamond, emerald, tropez)
 */
export const determineTierFromDays = (days) => {
  if (days >= TIER_THRESHOLDS.tropez) return 'tropez';
  if (days >= TIER_THRESHOLDS.emerald) return 'emerald';
  if (days >= TIER_THRESHOLDS.diamond) return 'diamond';
  if (days >= TIER_THRESHOLDS.gold) return 'gold';
  return 'basic';
};

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
 * Determines CSS class for membership status
 * @param {string} status - Membership status from API
 * @param {number} activeDays - Number of active days
 * @returns {string} CSS class for status
 */
export const getStatusClass = (status, activeDays) => {
  if (status && status.toUpperCase() !== 'ACTIVE') return 'status-inactive';
  if (activeDays < 30) return 'status-expiring';
  return 'status-active';
};