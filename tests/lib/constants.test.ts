import { describe, it, expect } from "vitest"
import { ASSET_CATEGORIES, type AssetCategory } from "@/lib/constants/asset-categories"

describe("asset-categories", () => {
  it("exports ASSET_CATEGORIES with expected structure", () => {
    expect(ASSET_CATEGORIES.vehicles).toEqual({ responsible: "charl", color: "blue" })
    expect(ASSET_CATEGORIES.garden_equipment).toEqual({ responsible: "lucky", color: "green" })
    expect(ASSET_CATEGORIES.workshop_tools).toEqual({ responsible: "charl", color: "amber" })
  })

  it("has all expected category keys", () => {
    const keys: AssetCategory[] = [
      "vehicles",
      "garden_equipment",
      "workshop_tools",
      "household_items",
      "electronics",
      "furniture",
      "outdoor_furniture",
      "safety_equipment",
    ]
    for (const k of keys) {
      expect(ASSET_CATEGORIES[k]).toBeDefined()
      expect(ASSET_CATEGORIES[k].responsible).toBeDefined()
      expect(ASSET_CATEGORIES[k].color).toBeDefined()
    }
  })
})
