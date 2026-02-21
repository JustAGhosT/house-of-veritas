import { describe, it, expect } from "vitest"
import { rateLimit } from "@/lib/auth/rate-limit"

describe("rateLimit", () => {
  it("should allow requests within limit", () => {
    const key = `test-${Date.now()}-allow`
    const result = rateLimit(key, 5, 60_000)
    expect(result.allowed).toBe(true)
    expect(result.remaining).toBe(4)
  })

  it("should block requests exceeding limit", () => {
    const key = `test-${Date.now()}-block`
    for (let i = 0; i < 5; i++) {
      rateLimit(key, 5, 60_000)
    }
    const result = rateLimit(key, 5, 60_000)
    expect(result.allowed).toBe(false)
    expect(result.remaining).toBe(0)
  })

  it("should reset after window expires", () => {
    const key = `test-${Date.now()}-reset`
    for (let i = 0; i < 5; i++) {
      rateLimit(key, 5, 1) // 1ms window
    }
    // Wait for window to expire
    const start = Date.now()
    while (Date.now() - start < 5) {
      // busy wait
    }
    const result = rateLimit(key, 5, 1)
    expect(result.allowed).toBe(true)
  })
})
