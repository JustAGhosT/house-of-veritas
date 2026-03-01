import { describe, it, expect } from "vitest"
import {
  requireId,
  parseOptionalInt,
  requireFields,
} from "@/lib/api/validation"

describe("validation", () => {
  describe("requireId", () => {
    it("returns id when valid number", () => {
      expect(requireId({ id: 42 }, "id", "Item")).toEqual({ id: 42 })
    })

    it("parses string to number", () => {
      expect(requireId({ id: "99" }, "id", "Item")).toEqual({ id: 99 })
    })

    it("returns error when field is null", () => {
      const result = requireId({ id: null }, "id", "Item")
      expect(result.error).toBeDefined()
      expect(result.id).toBe(0)
    })

    it("returns error when field is undefined", () => {
      const result = requireId({}, "id", "Item")
      expect(result.error).toBeDefined()
    })

    it("returns error when value is NaN", () => {
      const result = requireId({ id: "abc" }, "id", "Item")
      expect(result.error).toBeDefined()
      expect(result.id).toBe(0)
    })
  })

  describe("parseOptionalInt", () => {
    it("parses valid string", () => {
      expect(parseOptionalInt("42")).toBe(42)
    })

    it("returns undefined for null", () => {
      expect(parseOptionalInt(null)).toBeUndefined()
    })

    it("returns undefined for invalid string", () => {
      expect(parseOptionalInt("abc")).toBeUndefined()
    })

    it("returns undefined for empty string", () => {
      expect(parseOptionalInt("")).toBeUndefined()
    })
  })

  describe("requireFields", () => {
    it("returns empty when all fields present", () => {
      expect(
        requireFields({ name: "x", email: "y" }, ["name", "email"], "Form")
      ).toEqual({})
    })

    it("returns error when field is missing", () => {
      const result = requireFields({ name: "x" }, ["name", "email"], "Form")
      expect(result.error).toBeDefined()
    })

    it("returns error when field is empty string", () => {
      const result = requireFields({ name: "", email: "y" }, ["name", "email"], "Form")
      expect(result.error).toBeDefined()
    })

    it("returns error when field is whitespace only", () => {
      const result = requireFields({ name: "   ", email: "y" }, ["name", "email"], "Form")
      expect(result.error).toBeDefined()
    })
  })
})
