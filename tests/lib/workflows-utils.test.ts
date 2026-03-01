import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import {
  formatCurrency,
} from "@/lib/workflows/utils/format-helpers"
import {
  getAlertLevel,
  buildSummaryMessage,
} from "@/lib/workflows/utils/alert-helpers"
import { runNotificationStep } from "@/lib/workflows/utils/notification-helpers"
import {
  normalizeDate,
  todayNormalized,
  daysUntil,
} from "@/lib/workflows/utils/date-helpers"

describe("workflows utils", () => {
  describe("format-helpers", () => {
    describe("formatCurrency", () => {
      it("formats amount with R prefix", () => {
        const result = formatCurrency(1000)
        expect(result).toMatch(/^R1[,\s]?000$/)
      })

      it("formats large amounts with locale separators", () => {
        const result = formatCurrency(1000000)
        expect(result).toMatch(/^R1[,\s]000[,\s]000/)
      })

      it("formats zero", () => {
        expect(formatCurrency(0)).toBe("R0")
      })
    })
  })

  describe("date-helpers", () => {
    describe("normalizeDate", () => {
      it("sets time to midnight", () => {
        const d = new Date("2026-03-15T14:30:00")
        const norm = normalizeDate(d)
        expect(norm.getHours()).toBe(0)
        expect(norm.getMinutes()).toBe(0)
        expect(norm.getSeconds()).toBe(0)
        expect(norm.getMilliseconds()).toBe(0)
      })

      it("does not mutate original", () => {
        const d = new Date("2026-03-15T14:30:00")
        normalizeDate(d)
        expect(d.getHours()).toBe(14)
      })
    })

    describe("todayNormalized", () => {
      it("returns today at midnight", () => {
        const t = todayNormalized()
        expect(t.getHours()).toBe(0)
        expect(t.getMinutes()).toBe(0)
      })
    })

    describe("daysUntil", () => {
      beforeEach(() => {
        vi.useFakeTimers()
        vi.setSystemTime(new Date("2026-03-15T12:00:00"))
      })

      afterEach(() => {
        vi.useRealTimers()
      })

      it("returns 0 for today", () => {
        expect(daysUntil("2026-03-15")).toBe(0)
      })

      it("returns positive for future date", () => {
        expect(daysUntil("2026-03-20")).toBe(5)
      })

      it("returns negative for past date", () => {
        expect(daysUntil("2026-03-10")).toBe(-5)
      })

      it("accepts Date object", () => {
        expect(daysUntil(new Date("2026-03-20"))).toBe(5)
      })

      it("returns fallback for undefined", () => {
        expect(daysUntil(undefined, 99)).toBe(99)
      })

      it("returns fallback for empty string", () => {
        expect(daysUntil("", 0)).toBe(0)
      })

      it("returns fallback for invalid date string", () => {
        expect(daysUntil("not-a-date", null)).toBeNull()
      })
    })
  })

  describe("alert-helpers", () => {
    describe("getAlertLevel", () => {
      it("returns URGENT for expired (days <= 0)", () => {
        expect(getAlertLevel(0)).toBe("URGENT")
        expect(getAlertLevel(-5)).toBe("URGENT")
      })

      it("returns URGENT when days <= threshold", () => {
        expect(getAlertLevel(7)).toBe("URGENT")
        expect(getAlertLevel(3)).toBe("URGENT")
      })

      it("returns WARNING when days <= WARNING threshold", () => {
        expect(getAlertLevel(15)).toBe("WARNING")
        expect(getAlertLevel(30)).toBe("WARNING")
      })

      it("returns NOTICE when days <= NOTICE threshold", () => {
        expect(getAlertLevel(45)).toBe("NOTICE")
        expect(getAlertLevel(60)).toBe("NOTICE")
      })

      it("returns OK when days > NOTICE threshold", () => {
        expect(getAlertLevel(61)).toBe("OK")
        expect(getAlertLevel(100)).toBe("OK")
      })

      it("accepts custom thresholds", () => {
        const custom = { URGENT: 3, WARNING: 14, NOTICE: 30 }
        expect(getAlertLevel(2, custom)).toBe("URGENT")
        expect(getAlertLevel(10, custom)).toBe("WARNING")
        expect(getAlertLevel(25, custom)).toBe("NOTICE")
        expect(getAlertLevel(50, custom)).toBe("OK")
      })
    })

    describe("buildSummaryMessage", () => {
      it("builds summary from alerts", () => {
        const alerts = [
          { level: "URGENT" },
          { level: "URGENT" },
          { level: "WARNING" },
          { level: "NOTICE" },
        ]
        expect(buildSummaryMessage(alerts)).toBe(
          "URGENT: 2, WARNING: 1, NOTICE: 1"
        )
      })

      it("adds prefix when provided", () => {
        const alerts = [{ level: "URGENT" }]
        expect(buildSummaryMessage(alerts, "Document Expiry:")).toBe(
          "Document Expiry: URGENT: 1, WARNING: 0, NOTICE: 0"
        )
      })
    })
  })

  describe("notification-helpers", () => {
    it("runNotificationStep calls step.run with fn", async () => {
      const fn = vi.fn().mockResolvedValue(undefined)
      const step = {
        run: vi.fn().mockImplementation(async (_id, f) => f()),
      }
      await runNotificationStep(step, fn, "custom-id")
      expect(step.run).toHaveBeenCalledWith("custom-id", expect.any(Function))
      expect(fn).toHaveBeenCalled()
    })

    it("uses default stepId when not provided", async () => {
      const fn = vi.fn().mockResolvedValue(undefined)
      const step = {
        run: vi.fn().mockImplementation(async (_id, f) => f()),
      }
      await runNotificationStep(step, fn)
      expect(step.run).toHaveBeenCalledWith("send-notification", expect.any(Function))
    })
  })
})
