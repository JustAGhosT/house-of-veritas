import { describe, it, expect } from "vitest"
import {
  BASEROW_ID_TO_APP_ID,
  HIGH_VALUE_THRESHOLD,
  EXPIRY_WARNING_DAYS,
  OVERDUE_DAYS,
  STALE_DAYS,
  AGING_MONTHS,
  REMINDER_DAYS_AHEAD,
} from "@/lib/workflows/constants"

describe("workflows constants", () => {
  it("maps Baserow IDs to app IDs", () => {
    expect(BASEROW_ID_TO_APP_ID[1]).toBe("hans")
    expect(BASEROW_ID_TO_APP_ID[2]).toBe("charl")
    expect(BASEROW_ID_TO_APP_ID[3]).toBe("lucky")
    expect(BASEROW_ID_TO_APP_ID[4]).toBe("irma")
  })

  it("exports threshold constants", () => {
    expect(HIGH_VALUE_THRESHOLD).toBe(5000)
    expect(EXPIRY_WARNING_DAYS).toBe(14)
    expect(OVERDUE_DAYS).toBe(3)
    expect(STALE_DAYS).toBe(14)
    expect(AGING_MONTHS).toBe(12)
    expect(REMINDER_DAYS_AHEAD).toBe(7)
  })
})
