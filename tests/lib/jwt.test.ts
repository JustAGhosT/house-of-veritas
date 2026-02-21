import { describe, it, expect } from "vitest"
import { signToken, verifyToken } from "@/lib/auth/jwt"

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
})
