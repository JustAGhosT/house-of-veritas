import { describe, it, expect } from "vitest"
import {
  RESPONSIBILITIES,
  getDefaultResponsibilities,
  hasResponsibility,
} from "@/lib/access-config"

describe("access-config", () => {
  describe("RESPONSIBILITIES", () => {
    it("includes expected responsibilities", () => {
      expect(RESPONSIBILITIES).toContain("Projects")
      expect(RESPONSIBILITIES).toContain("Expenses")
      expect(RESPONSIBILITIES).toContain("Inventory")
    })
  })

  describe("getDefaultResponsibilities", () => {
    it("returns admin all responsibilities", () => {
      const r = getDefaultResponsibilities("admin")
      expect(r).toEqual([...RESPONSIBILITIES])
    })

    it("returns operator subset", () => {
      const r = getDefaultResponsibilities("operator")
      expect(r).toContain("Projects")
      expect(r).toContain("Assets")
      expect(r).not.toContain("Household")
    })

    it("returns resident subset", () => {
      const r = getDefaultResponsibilities("resident")
      expect(r).toContain("Household")
      expect(r).toContain("Documents")
    })
  })

  describe("hasResponsibility", () => {
    it("returns true when user has responsibility", () => {
      expect(hasResponsibility(["Projects", "Expenses"], "Projects")).toBe(true)
    })

    it("returns false when user lacks responsibility", () => {
      expect(hasResponsibility(["Projects"], "Expenses")).toBe(false)
    })

    it("returns false for empty responsibilities", () => {
      expect(hasResponsibility([], "Projects")).toBe(false)
    })
  })
})
