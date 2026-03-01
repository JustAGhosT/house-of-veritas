import { describe, it, expect } from "vitest"
import {
  signToken,
  verifyToken,
  getSessionCookieConfig,
  getClearSessionCookieConfig,
  COOKIE_NAME,
} from "@/lib/auth/jwt"

describe("JWT", () => {
  const payload = { userId: "hans", role: "admin" as const, email: "hans@houseofv.com" }

  it("should sign and verify a token", async () => {
    const token = await signToken(payload)
    expect(token).toBeTruthy()
    expect(typeof token).toBe("string")

    const verified = await verifyToken(token)
    expect(verified).not.toBeNull()
    expect(verified?.userId).toBe("hans")
    expect(verified?.role).toBe("admin")
    expect(verified?.email).toBe("hans@houseofv.com")
  })

  it("should reject tampered tokens", async () => {
    const token = await signToken(payload)
    const tampered = token.slice(0, -5) + "XXXXX"
    const result = await verifyToken(tampered)
    expect(result).toBeNull()
  })

  it("should reject empty strings", async () => {
    const result = await verifyToken("")
    expect(result).toBeNull()
  })

  it("should reject garbage input", async () => {
    const result = await verifyToken("not.a.jwt")
    expect(result).toBeNull()
  })

  describe("getSessionCookieConfig", () => {
    it("returns cookie config with token", async () => {
      const token = await signToken(payload)
      const config = getSessionCookieConfig(token)
      expect(config.name).toBe(COOKIE_NAME)
      expect(config.value).toBe(token)
      expect(config.httpOnly).toBe(true)
      expect(config.path).toBe("/")
      expect(config.maxAge).toBe(8 * 60 * 60)
    })
  })

  describe("getClearSessionCookieConfig", () => {
    it("returns cookie config to clear session", () => {
      const config = getClearSessionCookieConfig()
      expect(config.name).toBe(COOKIE_NAME)
      expect(config.value).toBe("")
      expect(config.maxAge).toBe(0)
    })
  })
})
