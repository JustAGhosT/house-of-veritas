import { describe, it, expect, vi, beforeEach } from "vitest"
import { GET, POST, PATCH } from "@/app/api/expenses/route"
import * as eventStore from "@/lib/realtime/event-store"
import * as workflows from "@/lib/workflows"

const adminHeaders = {
  "x-user-id": "hans",
  "x-user-role": "admin",
  "x-user-email": "hans@houseofv.com",
}

describe("GET /api/expenses", () => {
  it("returns 200 with expenses and summary", async () => {
    const request = new Request("http://localhost/api/expenses", {
      headers: adminHeaders,
    })
    const response = await GET(request)
    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data).toHaveProperty("expenses")
    expect(data).toHaveProperty("summary")
    expect(Array.isArray(data.expenses)).toBe(true)
  })
})

describe("POST /api/expenses", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

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

  it("emits approval_required to event store when expense is created (Inngest off)", async () => {
    const orig = process.env.USE_INNGEST_APPROVALS
    process.env.USE_INNGEST_APPROVALS = "false"
    const spy = vi.spyOn(eventStore, "emitApprovalRequired")
    const request = new Request("http://localhost/api/expenses", {
      method: "POST",
      headers: { ...adminHeaders, "Content-Type": "application/json" },
      body: JSON.stringify({
        requester: 1,
        category: "Supplies",
        amount: 200,
      }),
    })
    const response = await POST(request)
    expect(response.status).toBe(200)
    expect(spy).toHaveBeenCalledTimes(1)
    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "expense",
        amount: 200,
        category: "Supplies",
        approvalStatus: "Pending",
      }),
      "hans"
    )
    process.env.USE_INNGEST_APPROVALS = orig
    spy.mockRestore()
  })

  it("calls routeToInngest when USE_INNGEST_APPROVALS is true", async () => {
    const orig = process.env.USE_INNGEST_APPROVALS
    process.env.USE_INNGEST_APPROVALS = "true"
    const emitSpy = vi.spyOn(eventStore, "emitApprovalRequired")
    const routeSpy = vi.spyOn(workflows, "routeToInngest").mockResolvedValue()

    const request = new Request("http://localhost/api/expenses", {
      method: "POST",
      headers: { ...adminHeaders, "Content-Type": "application/json" },
      body: JSON.stringify({
        requester: 1,
        category: "Supplies",
        amount: 300,
      }),
    })
    const response = await POST(request)
    expect(response.status).toBe(200)
    expect(routeSpy).toHaveBeenCalledTimes(1)
    expect(routeSpy).toHaveBeenCalledWith({
      name: "house-of-veritas/expense.created",
      data: expect.objectContaining({
        amount: 300,
        category: "Supplies",
        approvalStatus: "Pending",
        submittedBy: "hans",
      }),
    })
    expect(emitSpy).not.toHaveBeenCalled()

    process.env.USE_INNGEST_APPROVALS = orig
    routeSpy.mockRestore()
    emitSpy.mockRestore()
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
