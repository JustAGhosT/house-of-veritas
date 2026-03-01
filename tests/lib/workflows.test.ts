import { describe, it, expect, vi, beforeEach } from "vitest"
import { routeToInngest } from "@/lib/workflows"
import * as inngestModule from "@/lib/inngest/client"

describe("lib/workflows", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("routeToInngest sends expense.created event to Inngest", async () => {
    const sendSpy = vi.spyOn(inngestModule.inngest, "send").mockResolvedValue({ ids: ["evt-1"] })
    await routeToInngest({
      name: "house-of-veritas/expense.created",
      data: {
        id: 1,
        requester: 1,
        type: "Request",
        category: "Supplies",
        amount: 100,
        approvalStatus: "Pending",
        submittedBy: "charl",
      },
    })
    expect(sendSpy).toHaveBeenCalledTimes(1)
    expect(sendSpy).toHaveBeenCalledWith({
      name: "house-of-veritas/expense.created",
      data: expect.objectContaining({ id: 1, amount: 100 }),
    })
  })

  it("routeToInngest sends kiosk.request.submitted event to Inngest", async () => {
    const sendSpy = vi.spyOn(inngestModule.inngest, "send").mockResolvedValue({ ids: ["evt-2"] })
    await routeToInngest({
      name: "house-of-veritas/kiosk.request.submitted",
      data: {
        requestId: "req-123",
        type: "stock_order",
        employeeId: "lucky",
        employeeName: "Lucky",
        data: { itemName: "Widget", quantity: 2 },
        timestamp: "2026-02-25T02:00:00Z",
      },
    })
    expect(sendSpy).toHaveBeenCalledTimes(1)
    expect(sendSpy).toHaveBeenCalledWith({
      name: "house-of-veritas/kiosk.request.submitted",
      data: expect.objectContaining({ requestId: "req-123", type: "stock_order" }),
    })
  })

  it("routeToInngest handles send failure gracefully", async () => {
    vi.spyOn(inngestModule.inngest, "send").mockRejectedValue(new Error("Inngest unavailable"))
    await expect(
      routeToInngest({
        name: "house-of-veritas/expense.created",
        data: { id: 1 },
      })
    ).resolves.toBeUndefined()
  })

  it("routeToInngest uses empty object when data undefined", async () => {
    const sendSpy = vi.spyOn(inngestModule.inngest, "send").mockResolvedValue({ ids: ["evt-3"] })
    await routeToInngest({
      name: "house-of-veritas/document.expiry.check",
    })
    expect(sendSpy).toHaveBeenCalledWith({
      name: "house-of-veritas/document.expiry.check",
      data: {},
    })
  })
})
