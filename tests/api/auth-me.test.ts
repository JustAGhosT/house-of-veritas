import { describe, it, expect, vi } from "vitest"

vi.mock("next/headers", () => ({
  cookies: vi.fn(() =>
    Promise.resolve({
      get: vi.fn(() => undefined),
    })
  ),
}))

describe("GET /api/auth/me", () => {
  it("returns 401 when no cookie", async () => {
    const { GET } = await import("@/app/api/auth/me/route")
    const response = await GET()
    expect(response.status).toBe(401)
  })
})
