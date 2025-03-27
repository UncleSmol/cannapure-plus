/**
 * Configuration file for strain categories
 * Centralizes category definitions for easier maintenance
 */

const strainCategories = [
  {
    id: "normal_strains",
    title: "NORMAL STRAINS",
    description: "Feeling like kicking it back most of the time? our normal strains in stock are mostly Sativa and will give you that laid-back feel anytime you want it.",
  },
  {
    id: "greenhouse_strains",
    title: "GREENHOUSE STRAINS",
    description: "Our Greenhouse strains are all Citrus punch-packed and Loaded and they will knock you out if not smoked with caution hehe.",
  },
  {
    id: "exotic_tunnel_strains",
    title: "EXOTIC TUNNEL STRAINS",
    description: "Experience our premium selection of exotic strains, carefully cultivated in controlled environments for maximum potency and unique flavors.",
  },
  {
    id: "indoor_strains",
    title: "INDOOR STRAINS",
    description: "Premium indoor-grown strains, meticulously cultivated in controlled environments for consistent quality and superior potency.",
  },
  {
    id: "medical_strains",
    title: "MEDICAL STRAINS",
    description: "Specially selected strains with therapeutic properties, perfect for those seeking relief while maintaining clarity and wellness.",
  },
  {
    id: "pre_rolled",
    title: "PRE-ROLLED",
    description: "Your next Ahh... moment will come from our Ready-On-The-Counter conversation.",
  },
  {
    id: "extracts_vapes",
    title: "EXTRACTS & VAPES",
    description: "There are many ways to kill a cat, we do not know of any, however we do know of a way you could get higher...",
  },
  {
    id: "edibles",
    title: "EDIBLES",
    description: "There is no waiting for the happy hour...it shall find you ahead.",
  },
  {
    id: "weekly_special",
    title: "WEEKLY SPECIALS",
    description: "Our hand-picked selection of special offers this week. Limited time deals on premium strains you won't want to miss!",
  }
];

// Category ID mapping for easier lookup
const categoryMapping = {
  'normal': 'normal_strains',
  'greenhouse': 'greenhouse_strains',
  'exotic_tunnel': 'exotic_tunnel_strains',
  'indoor': 'indoor_strains',
  'medical': 'medical_strains',
  'pre_rolled': 'pre_rolled',
  'extracts_vapes': 'extracts_vapes',
  'edibles': 'edibles',
  'weekly_special': 'weekly_special',
  'special': 'weekly_special',
  'weekly': 'weekly_special'
};

export { strainCategories, categoryMapping };
