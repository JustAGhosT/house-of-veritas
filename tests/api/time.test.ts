import { describe, it, expect } from "vitest"
import { GET, POST } from "@/app/api/time/route"

const authHeaders = {
  "x-user-id": "charl",
  "x-user-role": "operator",
  "x-user-email": "charl@houseofv.com",
}

describe("GET /api/time", () => {
  it("returns 200 with entries and summary", async () => {
    const request = new Request("http://localhost/api/time")
    const response = await GET(request)
    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data).toHaveProperty("entries")
    expect(data).toHaveProperty("summary")
    expect(Array.isArray(data.entries)).toBe(true)
  })
})

describe("POST /api/time", () => {
  it("returns 400 for invalid action", async () => {
    const request = new Request("http://localhost/api/time", {
      method: "POST",
      headers: { ...authHeaders, "Content-Type": "application/json" },
      body: JSON.stringify({ action: "invalid" }),
    })
    const response = await POST(request)
    expect(response.status).toBe(400)
  })

  it("returns 400 when clockIn without employeeId", async () => {
    const request = new Request("http://localhost/api/time", {
      method: "POST",
      headers: { ...authHeaders, "Content-Type": "application/json" },
      body: JSON.stringify({ action: "clockIn" }),
    })
    const response = await POST(request)
    expect(response.status).toBe(400)
  })

  it("returns 200 when clockIn with employeeId", async () => {
    const request = new Request("http://localhost/api/time", {
      method: "POST",
      headers: { ...authHeaders, "Content-Type": "application/json" },
      body: JSON.stringify({ action: "clockIn", employeeId: "charl" }),
    })
    const response = await POST(request)
    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data).toHaveProperty("entry")
    expect(data).toHaveProperty("message")
  })
})
