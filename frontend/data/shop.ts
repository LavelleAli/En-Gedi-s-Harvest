// Shop items. PLACEHOLDERS for now: the gear the book's guides call for, with no prices and no
// checkout yet. To add a real product later, give it a price and a Stripe price ID (see the README).
//
// Each item's photo comes from Wikimedia Commons: "shop-<id>" in frontend/data/photo-queries.json,
// downloaded by `npm run photos`. Until then the page shows a drawn icon for the category.
export type ShopCategory = "bees" | "water" | "garden";
export type ShopItem = { id: string; category: ShopCategory; name: string; blurb: string };

export const SHOP_CATEGORIES: { id: ShopCategory; title: string; blurb: string; guide: string }[] = [
  { id: "bees", title: "Beekeeping", blurb: "What a first-year beekeeper needs, from the Bees guide.", guide: "/bees/" },
  { id: "water", title: "Water filtration", blurb: "Filtering, purifying and storing water, from the Water guide.", guide: "/water/" },
  { id: "garden", title: "Garden supplies", blurb: "Standard tools and supplies for beds, planting and watering.", guide: "/planner/" },
];

export const SHOP_ITEMS: ShopItem[] = [
  // Beekeeping
  { id: "hive-kit", category: "bees", name: "Langstroth hive kit", blurb: "Bottom board, two deep boxes, frames with foundation, inner and outer covers." },
  { id: "bee-suit", category: "bees", name: "Ventilated bee jacket and veil", blurb: "Mesh jacket with attached veil; cooler than a full suit in Southern summers." },
  { id: "smoker", category: "bees", name: "Bee smoker", blurb: "Stainless smoker with heat shield. Calms bees during inspections." },
  { id: "hive-tool", category: "bees", name: "Hive tool", blurb: "Pries apart boxes and frames that bees glue together." },
  { id: "bee-gloves", category: "bees", name: "Beekeeping gloves", blurb: "Leather gloves with long canvas sleeves." },
  { id: "hive-beetle-trap", category: "bees", name: "Small hive beetle traps", blurb: "Oil traps that sit between frames." },

  // Water filtration
  { id: "gravity-filter", category: "water", name: "Gravity water filter", blurb: "Countertop filter rated to 0.3 microns or smaller for bacteria." },
  { id: "portable-filter", category: "water", name: "Portable water filter", blurb: "Hand pump or squeeze filter for camping and emergencies." },
  { id: "water-tablets", category: "water", name: "Chlorine dioxide tablets", blurb: "Disinfects filtered water, including against Cryptosporidium." },
  { id: "water-jugs", category: "water", name: "Food-grade water storage jugs", blurb: "Stackable containers for a 3-day supply: 1 gallon per person per day." },
  { id: "uv-pen", category: "water", name: "UV water purifier pen", blurb: "Treats small amounts of clear water with ultraviolet light." },
  { id: "charcoal", category: "water", name: "Activated charcoal", blurb: "Filter media for a homemade sediment filter." },

  // Garden supplies
  { id: "raised-bed", category: "garden", name: "Raised bed kit", blurb: "4 × 8 ft cedar bed, about 11 in deep." },
  { id: "soil-test", category: "garden", name: "Soil test kit", blurb: "Checks pH and nutrients before you plant." },
  { id: "hand-trowel", category: "garden", name: "Hand trowel and cultivator", blurb: "For planting transplants and weeding beds." },
  { id: "pruners", category: "garden", name: "Bypass pruners", blurb: "Clean cuts for berries, figs and herbs." },
  { id: "drip-kit", category: "garden", name: "Drip irrigation kit", blurb: "Waters the soil, not the leaves, to prevent leaf disease." },
  { id: "row-cover", category: "garden", name: "Floating row cover", blurb: "Keeps pests off young greens and protects from light frost." },
];
