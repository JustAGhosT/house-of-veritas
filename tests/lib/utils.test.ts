import { describe, it, expect } from "vitest"
import { cn, toISODateString } from "@/lib/utils"

describe("utils", () => {
  describe("cn", () => {
    it("merges class names", () => {
      expect(cn("foo", "bar")).toBe("foo bar")
    })

    it("handles conditional classes", () => {
      expect(cn("base", false && "hidden", true && "visible")).toBe("base visible")
    })

    it("merges tailwind classes correctly", () => {
      expect(cn("p-4", "p-2")).toBe("p-2")
    })
  })

  describe("toISODateString", () => {
    it("formats date as YYYY-MM-DD", () => {
      const d = new Date("2026-03-15T12:00:00Z")
      expect(toISODateString(d)).toBe("2026-03-15")
    })

    it("uses current date when no arg", () => {
      const result = toISODateString()
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    })
  })
})
