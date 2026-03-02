import { describe, it, expect, vi, beforeEach } from "vitest"

const mockCookiesGet = vi.fn()
const mockGetUserWithManagement = vi.fn()
const mockFindUserByIdAsync = vi.fn()
const mockSafeUser = vi.fn((u: unknown) => u)

vi.mock("next/headers", () => ({
  cookies: vi.fn(() =>
    Promise.resolve({
      get: vi.fn((...args: unknown[]) => mockCookiesGet(...args)),
    })
  ),
}))

vi.mock("@/lib/user-management", () => ({
  getUserWithManagement: vi.fn((...args: unknown[]) => mockGetUserWithManagement(...args)),
}))

vi.mock("@/lib/users", () => ({
  findUserByIdAsync: vi.fn((...args: unknown[]) => mockFindUserByIdAsync(...args)),
  safeUser: vi.fn((u: unknown) => mockSafeUser(u)),
}))

describe("GET /api/auth/me", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockCookiesGet.mockReturnValue(undefined)
  })

  it("returns 401 when no cookie", async () => {
    const { GET } = await import("@/app/api/auth/me/route")
    const response = await GET()
    expect(response.status).toBe(401)
  }, 10000)

  it("returns 401 when token invalid", async () => {
    mockCookiesGet.mockReturnValue({ value: "invalid-token" })
    const { GET } = await import("@/app/api/auth/me/route")
    const response = await GET()
    expect(response.status).toBe(401)
  }, 10000)

  it("returns user when getUserWithManagement returns", async () => {
    const { signToken } = await import("@/lib/auth/jwt")
    const token = await signToken({
      userId: "hans",
      role: "admin",
      email: "hans@houseofv.com",
    })
    mockCookiesGet.mockReturnValue({ value: token })
    mockGetUserWithManagement.mockResolvedValue({
      id: "hans",
      name: "Hans",
      role: "admin",
      email: "hans@houseofv.com",
    })
    const { GET } = await import("@/app/api/auth/me/route")
    const response = await GET()
    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.user).toMatchObject({ id: "hans", name: "Hans", role: "admin" })
  }, 10000)

  it("returns user from findUserByIdAsync when getUserWithManagement null", async () => {
    const { signToken } = await import("@/lib/auth/jwt")
    const token = await signToken({
      userId: "charl",
      role: "operator",
      email: "charl@houseofv.com",
    })
    mockCookiesGet.mockReturnValue({ value: token })
    mockGetUserWithManagement.mockResolvedValue(null)
    mockFindUserByIdAsync.mockResolvedValue({
      id: "charl",
      name: "Charl",
      role: "operator",
      email: "charl@houseofv.com",
      specialty: ["Projects"],
    })
    const { GET } = await import("@/app/api/auth/me/route")
    const response = await GET()
    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.user).toMatchObject({ id: "charl", name: "Charl" })
  }, 10000)
})
