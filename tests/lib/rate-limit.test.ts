import { describe, it, expect, vi } from "vitest"
import { rateLimit, rateLimitAsync, isRedisRateLimitConfigured } from "@/lib/auth/rate-limit"

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

describe("rateLimitAsync", () => {
  it("returns in-memory result when Redis not configured", async () => {
    const orig = process.env.REDIS_URL
    delete process.env.REDIS_URL
    const key = `async-${Date.now()}`
    const result = await rateLimitAsync(key, 3, 60_000)
    expect(result.allowed).toBe(true)
    expect(result.remaining).toBe(2)
    process.env.REDIS_URL = orig
  })
})

describe("isRedisRateLimitConfigured", () => {
  it("returns false when REDIS_URL unset", () => {
    const orig = process.env.REDIS_URL
    delete process.env.REDIS_URL
    expect(isRedisRateLimitConfigured()).toBe(false)
    process.env.REDIS_URL = orig
  })
})
