// Import images
import logoPlaceholder from "../../../assets/images/badges/basic-badge.png";
import goldBadge from "../../../assets/images/badges/gold-badge.png";
import diamondBadge from "../../../assets/images/badges/diamond-badge.png";
import emeraldBadge from "../../../assets/images/badges/emerald-badge.png";
import tropezBadge from "../../../assets/images/badges/tropez-badge.png";

// API URL configuration
export const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Tier information for display
export const TIER_INFO = {
  basic: {
    name: "Basic",
    description: "Welcome to Cannapure"
  },
  gold: {
    name: "Gold",
    description: "Premium member"
  },
  diamond: {
    name: "Diamond",
    description: "Elite member"
  },
  emerald: {
    name: "Emerald",
    description: "VIP member"
  },
  tropez: {
    name: "Tropez",
    description: "Exclusive member"
  }
};

// Tier thresholds based on active days
export const TIER_THRESHOLDS = {
  basic: 0,      // 0-59 days
  gold: 60,      // 60-119 days
  diamond: 120,  // 120-239 days
  emerald: 240,  // 240-479 days
  tropez: 480    // 480+ days
};

// Badge images for each tier
export const BADGE_IMAGES = {
  basic: logoPlaceholder,
  gold: goldBadge,
  diamond: diamondBadge,
  emerald: emeraldBadge,
  tropez: tropezBadge
};