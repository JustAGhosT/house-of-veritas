import { describe, it, expect } from "vitest"
import { GET } from "@/app/api/reports/route"

const adminHeaders = {
  "x-user-id": "hans",
  "x-user-role": "admin",
  "x-user-email": "hans@houseofv.com",
}

const operatorHeaders = {
  "x-user-id": "charl",
  "x-user-role": "operator",
  "x-user-email": "charl@houseofv.com",
}

describe("GET /api/reports", () => {
  it("returns 401 without auth headers", async () => {
    const request = new Request("http://localhost/api/reports")
    const response = await GET(request)
    expect(response.status).toBe(401)
  })

  it("returns 403 when non-admin", async () => {
    const request = new Request("http://localhost/api/reports", {
      headers: operatorHeaders,
    })
    const response = await GET(request)
    expect(response.status).toBe(403)
  })

  it("returns 200 when admin with expenses report", async () => {
    const request = new Request("http://localhost/api/reports?type=expenses", {
      headers: adminHeaders,
    })
    const response = await GET(request)
    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data).toHaveProperty("reportType", "expenses")
    expect(data).toHaveProperty("data")
    expect(data).toHaveProperty("dataSource")
  })

  it("returns 200 for tasks report", async () => {
    const request = new Request("http://localhost/api/reports?type=tasks", {
      headers: adminHeaders,
    })
    const response = await GET(request)
    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.reportType).toBe("tasks")
  })

  it("returns 400 for invalid report type", async () => {
    const request = new Request("http://localhost/api/reports?type=invalid", {
      headers: adminHeaders,
    })
    const response = await GET(request)
    expect(response.status).toBe(400)
  })
})
