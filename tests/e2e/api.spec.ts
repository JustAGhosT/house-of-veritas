import { test, expect } from "@playwright/test"

test.describe("API Routes", () => {
  test("health check returns 200", async ({ request }) => {
    const res = await request.get("/api/health")
    expect(res.ok()).toBeTruthy()
    const body = await res.json()
    expect(body.status).toMatch(/healthy|degraded/)
    expect(body.services).toBeDefined()
  })

  test("protected routes return 401 without auth", async ({ request }) => {
    const protectedRoutes = [
      "/api/tasks",
      "/api/expenses",
      "/api/payroll",
      "/api/audit",
      "/api/reports",
      "/api/stats",
    ]

    for (const route of protectedRoutes) {
      const res = await request.get(route)
      expect(res.status()).toBe(401)
    }
  })

  test("login returns JWT cookie", async ({ request }) => {
    const res = await request.post("/api/auth/login", {
      data: { email: "hans@houseofv.com", password: "hans123" },
    })
    expect(res.ok()).toBeTruthy()
    const body = await res.json()
    expect(body.success).toBe(true)
    expect(body.user.id).toBe("hans")

    const cookies = await res.headersArray()
    const setCookie = cookies.find((h) => h.name.toLowerCase() === "set-cookie")
    expect(setCookie?.value).toContain("hov_session")
  })

  test("authenticated requests succeed", async ({ request }) => {
    const loginRes = await request.post("/api/auth/login", {
      data: { email: "hans@houseofv.com", password: "hans123" },
    })
    expect(loginRes.ok()).toBeTruthy()

    const statsRes = await request.get("/api/stats")
    expect(statsRes.ok()).toBeTruthy()
    const stats = await statsRes.json()
    expect(stats.tasks).toBeDefined()
  })

  test("rate limiting blocks excessive login attempts", async ({ request }) => {
    const attempts = []
    for (let i = 0; i < 7; i++) {
      attempts.push(
        request.post("/api/auth/login", {
          data: { email: "hans@houseofv.com", password: "wrong" },
        })
      )
    }
    const results = await Promise.all(attempts)
    const rateLimited = results.some((r) => r.status() === 429)
    expect(rateLimited).toBe(true)
  })
})
