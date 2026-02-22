import { describe, it, expect } from "vitest"
import { NextRequest } from "next/server"

describe("middleware", () => {
  it("exports middleware function", async () => {
    const { middleware } = await import("@/middleware")
    expect(typeof middleware).toBe("function")
  })

  it("allows public path /api/health without auth", async () => {
    const { middleware } = await import("@/middleware")
    const request = new NextRequest("http://localhost/api/health", { method: "GET" })
    const response = await middleware(request)
    expect(response.status).toBe(200)
  })

  it("returns 401 for /api/tasks without auth cookie", async () => {
    const { middleware } = await import("@/middleware")
    const request = new NextRequest("http://localhost/api/tasks", { method: "GET" })
    const response = await middleware(request)
    expect(response.status).toBe(401)
  })
})
