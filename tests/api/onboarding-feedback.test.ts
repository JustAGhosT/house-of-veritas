import { describe, it, expect, vi, beforeEach } from "vitest"

vi.mock("@/lib/user-management", () => ({
  getUserWithManagement: vi.fn(),
  updateUserManagement: vi.fn(),
}))

const authHeaders = {
  "x-user-id": "charl",
  "x-user-role": "operator",
  "x-user-email": "charl@houseofv.com",
}

describe("POST /api/users/me/onboarding-feedback", () => {
  beforeEach(async () => {
    vi.resetModules()
    const { getUserWithManagement, updateUserManagement } = await import(
      "@/lib/user-management"
    )
    vi.mocked(getUserWithManagement).mockResolvedValue({
      id: "charl",
      name: "Charl",
      email: "charl@houseofv.com",
      role: "operator",
      responsibilities: [],
      onboardingStatus: "in_progress",
    } as never)
    vi.mocked(updateUserManagement).mockResolvedValue(null)
  })

  it("returns 401 when no auth headers", async () => {
    const { POST } = await import("@/app/api/users/me/onboarding-feedback/route")
    const request = new Request("http://localhost/api/users/me/onboarding-feedback", {
      method: "POST",
      body: JSON.stringify({}),
    })
    const response = await POST(request)
    expect(response.status).toBe(401)
  })

  it("returns 404 when user not found", async () => {
    const { getUserWithManagement } = await import("@/lib/user-management")
    vi.mocked(getUserWithManagement).mockResolvedValue(null)
    const { POST } = await import("@/app/api/users/me/onboarding-feedback/route")
    const request = new Request("http://localhost/api/users/me/onboarding-feedback", {
      method: "POST",
      headers: { ...authHeaders, "content-type": "application/json" },
      body: JSON.stringify({}),
    })
    const response = await POST(request)
    expect(response.status).toBe(404)
  })

  it("returns 200 and logs role change request", async () => {
    const { POST } = await import("@/app/api/users/me/onboarding-feedback/route")
    const request = new Request("http://localhost/api/users/me/onboarding-feedback", {
      method: "POST",
      headers: { ...authHeaders, "content-type": "application/json" },
      body: JSON.stringify({ roleChangeRequest: "resident" }),
    })
    const response = await POST(request)
    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data).toEqual({ success: true })
  })

  it("returns 200 and persists responsibilities", async () => {
    const { updateUserManagement } = await import("@/lib/user-management")
    const { POST } = await import("@/app/api/users/me/onboarding-feedback/route")
    const request = new Request("http://localhost/api/users/me/onboarding-feedback", {
      method: "POST",
      headers: { ...authHeaders, "content-type": "application/json" },
      body: JSON.stringify({ responsibilities: ["Tinkerer", "Electrician"] }),
    })
    const response = await POST(request)
    expect(response.status).toBe(200)
    expect(updateUserManagement).toHaveBeenCalledWith("charl", {
      responsibilities: ["Tinkerer", "Electrician"],
    })
  })

  it("persists empty responsibilities when user denies all", async () => {
    const { updateUserManagement } = await import("@/lib/user-management")
    const { POST } = await import("@/app/api/users/me/onboarding-feedback/route")
    const request = new Request("http://localhost/api/users/me/onboarding-feedback", {
      method: "POST",
      headers: { ...authHeaders, "content-type": "application/json" },
      body: JSON.stringify({ responsibilities: [] }),
    })
    const response = await POST(request)
    expect(response.status).toBe(200)
    expect(updateUserManagement).toHaveBeenCalledWith("charl", {
      responsibilities: [],
    })
  })
})
