import { describe, it, expect, beforeEach, vi } from "vitest"
import {
  isBaserowConfigured,
  getEmployees,
  getTasks,
  getExpenses,
} from "@/lib/services/baserow"

describe("baserow service", () => {
  const originalEnv = process.env

  beforeEach(() => {
    vi.resetModules()
    process.env = { ...originalEnv }
  })

  describe("isBaserowConfigured", () => {
    it("returns false when BASEROW_API_TOKEN and BASEROW_DATABASE_ID are unset", () => {
      delete process.env.BASEROW_API_TOKEN
      delete process.env.BASEROW_DATABASE_ID
      expect(isBaserowConfigured()).toBe(false)
    })

    it("returns false when only token is set", () => {
      process.env.BASEROW_API_TOKEN = "test-token"
      delete process.env.BASEROW_DATABASE_ID
      expect(isBaserowConfigured()).toBe(false)
    })

    it("returns true when token and database are set", () => {
      process.env.BASEROW_API_TOKEN = "test-token"
      process.env.BASEROW_DATABASE_ID = "db123"
      expect(isBaserowConfigured()).toBe(true)
    })
  })

  describe("getEmployees (mock fallback)", () => {
    it("returns mock employees when not configured", async () => {
      delete process.env.BASEROW_API_TOKEN
      const employees = await getEmployees()
      expect(Array.isArray(employees)).toBe(true)
      expect(employees.length).toBeGreaterThan(0)
      expect(employees[0]).toHaveProperty("id")
      expect(employees[0]).toHaveProperty("fullName")
      expect(employees[0]).toHaveProperty("role")
      expect(employees[0]).toHaveProperty("email")
    })
  })

  describe("getTasks (mock fallback)", () => {
    it("returns mock tasks when not configured", async () => {
      delete process.env.BASEROW_API_TOKEN
      const tasks = await getTasks()
      expect(Array.isArray(tasks)).toBe(true)
      expect(tasks.length).toBeGreaterThan(0)
      expect(tasks[0]).toHaveProperty("id")
      expect(tasks[0]).toHaveProperty("title")
      expect(tasks[0]).toHaveProperty("status")
      expect(tasks[0]).toHaveProperty("priority")
    })

    it("filters by assignedTo when using mock", async () => {
      delete process.env.BASEROW_API_TOKEN
      const tasks = await getTasks({ assignedTo: 1 })
      expect(Array.isArray(tasks)).toBe(true)
      tasks.forEach((t) => expect(t.assignedTo).toBe(1))
    })
  })

  describe("getExpenses (mock fallback)", () => {
    it("returns mock expenses when not configured", async () => {
      delete process.env.BASEROW_API_TOKEN
      const expenses = await getExpenses()
      expect(Array.isArray(expenses)).toBe(true)
      expect(expenses.length).toBeGreaterThan(0)
      expect(expenses[0]).toHaveProperty("id")
      expect(expenses[0]).toHaveProperty("amount")
      expect(expenses[0]).toHaveProperty("approvalStatus")
    })
  })
})
