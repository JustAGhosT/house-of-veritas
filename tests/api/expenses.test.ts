import { describe, it, expect } from "vitest"
import { GET, POST, PATCH } from "@/app/api/expenses/route"

const adminHeaders = {
  "x-user-id": "hans",
  "x-user-role": "admin",
  "x-user-email": "hans@houseofv.com",
}

describe("GET /api/expenses", () => {
  it("returns 200 with expenses and summary", async () => {
    const request = new Request("http://localhost/api/expenses")
    const response = await GET(request)
    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data).toHaveProperty("expenses")
    expect(data).toHaveProperty("summary")
    expect(Array.isArray(data.expenses)).toBe(true)
  })
})

describe("POST /api/expenses", () => {
  it("returns 400 when required fields missing", async () => {
    const request = new Request("http://localhost/api/expenses", {
      method: "POST",
      headers: { ...adminHeaders, "Content-Type": "application/json" },
      body: JSON.stringify({ amount: 100 }),
    })
    const response = await POST(request)
    expect(response.status).toBe(400)
  })

  it("returns 200 when creating expense", async () => {
    const request = new Request("http://localhost/api/expenses", {
      method: "POST",
      headers: { ...adminHeaders, "Content-Type": "application/json" },
      body: JSON.stringify({
        requester: 1,
        category: "Supplies",
        amount: 150,
      }),
    })
    const response = await POST(request)
    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data).toHaveProperty("expense")
    expect(data.expense).toHaveProperty("amount", 150)
  })
})

describe("PATCH /api/expenses", () => {
  it("returns 403 when non-admin", async () => {
    const request = new Request("http://localhost/api/expenses", {
      method: "PATCH",
      headers: {
        "x-user-id": "charl",
        "x-user-role": "operator",
        "x-user-email": "charl@houseofv.com",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id: 1, approvalStatus: "Approved" }),
    })
    const response = await PATCH(request)
    expect(response.status).toBe(403)
  })

  it("returns 200 when admin updates expense", async () => {
    const request = new Request("http://localhost/api/expenses", {
      method: "PATCH",
      headers: { ...adminHeaders, "Content-Type": "application/json" },
      body: JSON.stringify({ id: 1, approvalStatus: "Approved" }),
    })
    const response = await PATCH(request)
    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data).toHaveProperty("expense")
  })
})
