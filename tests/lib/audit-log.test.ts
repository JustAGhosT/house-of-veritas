import { describe, it, expect, beforeEach } from "vitest"
import {
  auditLog,
  logActivity,
  type AuditAction,
} from "@/lib/audit-log"

describe("audit-log", () => {
  beforeEach(() => {
    const logs = (auditLog as any).logs
    if (logs && Array.isArray(logs)) {
      logs.length = 0
    }
  })

  describe("logActivity / addLog", () => {
    it("adds an entry with required fields", () => {
      const entry = logActivity("hans", "Hans", "login", "auth")
      expect(entry).toHaveProperty("id")
      expect(entry.id).toMatch(/^audit_/)
      expect(entry.userId).toBe("hans")
      expect(entry.userName).toBe("Hans")
      expect(entry.action).toBe("login")
      expect(entry.resourceType).toBe("auth")
      expect(entry.success).toBe(true)
      expect(entry.timestamp).toBeInstanceOf(Date)
    })

    it("supports optional resourceId and resourceName", () => {
      const entry = logActivity("charl", "Charl", "task_completed", "task", {
        resourceId: "task_1",
        resourceName: "Fix irrigation",
      })
      expect(entry.resourceId).toBe("task_1")
      expect(entry.resourceName).toBe("Fix irrigation")
    })

    it("supports success false and errorMessage", () => {
      const entry = logActivity("lucky", "Lucky", "expense_submitted", "expense", {
        success: false,
        errorMessage: "Validation failed",
      })
      expect(entry.success).toBe(false)
      expect(entry.errorMessage).toBe("Validation failed")
    })
  })

  describe("getLogs", () => {
    beforeEach(() => {
      logActivity("hans", "Hans", "login", "auth")
      logActivity("hans", "Hans", "task_created", "task", { resourceId: "t1" })
      logActivity("charl", "Charl", "clock_in", "time")
      logActivity("hans", "Hans", "expense_approved", "expense")
    })

    it("returns all logs by default", () => {
      const logs = auditLog.getLogs()
      expect(logs.length).toBeGreaterThanOrEqual(4)
    })

    it("filters by userId", () => {
      const logs = auditLog.getLogs({ userId: "hans" })
      expect(logs.every((l) => l.userId === "hans")).toBe(true)
    })

    it("filters by action", () => {
      const logs = auditLog.getLogs({ action: "login" as AuditAction })
      expect(logs.every((l) => l.action === "login")).toBe(true)
    })

    it("respects limit", () => {
      const logs = auditLog.getLogs({ limit: 2 })
      expect(logs.length).toBeLessThanOrEqual(2)
    })
  })

  describe("getLogsByResource", () => {
    it("returns logs for a specific resource", () => {
      logActivity("hans", "Hans", "task_updated", "task", { resourceId: "task_99" })
      const logs = auditLog.getLogsByResource("task", "task_99")
      expect(logs.length).toBeGreaterThanOrEqual(1)
      expect(logs[0].resourceType).toBe("task")
      expect(logs[0].resourceId).toBe("task_99")
    })
  })

  describe("getActivitySummary", () => {
    it("returns counts per action", () => {
      logActivity("hans", "Hans", "login", "auth")
      logActivity("hans", "Hans", "login", "auth")
      const summary = auditLog.getActivitySummary("hans")
      expect(summary.login).toBeGreaterThanOrEqual(2)
    })
  })
})
