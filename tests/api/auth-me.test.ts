import { describe, it, expect, vi } from "vitest"

vi.mock("next/headers", () => ({
  cookies: vi.fn(() =>
    Promise.resolve({
      get: vi.fn(() => undefined),
    })
  ),
}))

vi.mock("@/lib/user-management", () => ({
  getUserWithManagement: vi.fn(),
}))

vi.mock("@/lib/users", () => ({
  findUserByIdAsync: vi.fn(),
  safeUser: vi.fn((u: unknown) => u),
}))

describe("GET /api/auth/me", () => {
  it("returns 401 when no cookie", async () => {
    const { GET } = await import("@/app/api/auth/me/route")
    const response = await GET()
    expect(response.status).toBe(401)
  }, 10000)
})
