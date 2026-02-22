import { describe, it, expect } from "vitest"
import { getAuthContext } from "@/lib/auth/rbac"

function makeRequest(headers: Record<string, string> = {}): Request {
  const h = new Headers()
  for (const [k, v] of Object.entries(headers)) {
    h.set(k, v)
  }
  return new Request("http://localhost/api/test", { headers: h })
}

describe("RBAC", () => {
  describe("getAuthContext", () => {
    it("should extract auth context from headers", () => {
      const req = makeRequest({
        "x-user-id": "hans",
        "x-user-role": "admin",
        "x-user-email": "hans@houseofv.com",
      })
      const ctx = getAuthContext(req)
      expect(ctx).toMatchObject({
        userId: "hans",
        role: "admin",
        email: "hans@houseofv.com",
      })
      expect(Array.isArray(ctx?.responsibilities)).toBe(true)
    })

    it("should return null when headers are missing", () => {
      expect(getAuthContext(makeRequest())).toBeNull()
      expect(getAuthContext(makeRequest({ "x-user-id": "hans" }))).toBeNull()
    })
  })
})
