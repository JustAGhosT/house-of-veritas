export const ASSET_CATEGORIES = {
  vehicles: { responsible: "charl", color: "blue" },
  garden_equipment: { responsible: "lucky", color: "green" },
  workshop_tools: { responsible: "charl", color: "amber" },
  household_items: { responsible: "irma", color: "purple" },
  electronics: { responsible: "hans", color: "cyan" },
  furniture: { responsible: "irma", color: "pink" },
  outdoor_furniture: { responsible: "lucky", color: "teal" },
  safety_equipment: { responsible: "charl", color: "red" },
} as const

export type AssetCategory = keyof typeof ASSET_CATEGORIES
