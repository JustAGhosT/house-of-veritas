import { describe, it, expect } from "vitest"
import { GET } from "@/app/api/health/route"

describe("GET /api/health", () => {
  it("returns 200 with health status", async () => {
    const request = new Request("http://localhost/api/health")
    const response = await GET(request, {})
    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data).toHaveProperty("status")
    expect(["healthy", "degraded"]).toContain(data.status)
    expect(data).toHaveProperty("dataMode")
    expect(data).toHaveProperty("services")
    expect(data).toHaveProperty("timestamp")
  })
})
