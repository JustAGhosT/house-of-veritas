import { describe, it, expect } from "vitest"
import { NextRequest } from "next/server"

describe("proxy", () => {
  it("exports proxy function", async () => {
    const { proxy } = await import("@/proxy")
    expect(typeof proxy).toBe("function")
  })

  it("allows public path /api/health without auth", async () => {
    const { proxy } = await import("@/proxy")
    const request = new NextRequest("http://localhost/api/health", { method: "GET" })
    const response = await proxy(request)
    expect(response.status).toBe(200)
  })

  it("returns 401 for /api/tasks without auth cookie", async () => {
    const { proxy } = await import("@/proxy")
    const request = new NextRequest("http://localhost/api/tasks", { method: "GET" })
    const response = await proxy(request)
    expect(response.status).toBe(401)
  })
})
