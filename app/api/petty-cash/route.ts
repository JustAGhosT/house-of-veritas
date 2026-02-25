import { NextResponse } from "next/server"
import {
  getPettyCashRequests,
  createPettyCashRequest,
  updatePettyCashRequest,
  getBaserowEmployeeIdByAppId,
} from "@/lib/services/baserow"
import { withDataSource } from "@/lib/api/response"
import { withRole } from "@/lib/auth/rbac"
import { toISODateString } from "@/lib/utils"
import { logger } from "@/lib/logger"
import { routeToInngest } from "@/lib/workflows"

const MAX_SINGLE_AMOUNT = 5000
const MAX_MONTHLY_PER_USER = 20000

export const GET = withRole(
  "admin",
  "operator",
  "employee",
  "resident"
)(async (request) => {
  const { searchParams } = new URL(request.url)
  const requesterParam = searchParams.get("requester")
  const personaId = searchParams.get("personaId")
  const status = searchParams.get("status")

  let requester: number | undefined
  if (requesterParam) {
    requester = parseInt(requesterParam, 10)
    if (Number.isNaN(requester)) requester = undefined
  } else if (personaId) {
    requester = (await getBaserowEmployeeIdByAppId(personaId)) ?? undefined
  }

  try {
    const requests = await getPettyCashRequests({
      requester,
      status: status || undefined,
    })
    return withDataSource({ requests })
  } catch (error) {
    logger.error("Error fetching petty cash requests", {
      error: error instanceof Error ? error.message : String(error),
    })
    return NextResponse.json(
      { error: "Failed to fetch petty cash requests" },
      { status: 500 }
    )
  }
})

export const POST = withRole(
  "admin",
  "operator",
  "employee",
  "resident"
)(async (request) => {
  try {
    const body = await request.json()
    const { requester: reqParam, personaId, amount, purpose, receipt, notes } = body

    let requesterId = reqParam
    if (!requesterId && personaId) {
      requesterId = (await getBaserowEmployeeIdByAppId(personaId)) ?? undefined
    }
    if (!requesterId) {
      const auth = request.headers.get("x-user-id")
      requesterId = (await getBaserowEmployeeIdByAppId(auth || "")) ?? undefined
    }
    if (!requesterId) {
      return NextResponse.json({ error: "Requester is required" }, { status: 400 })
    }

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Valid amount is required" }, { status: 400 })
    }

    if (amount > MAX_SINGLE_AMOUNT) {
      await routeToInngest({
        name: "house-of-veritas/petty.cash.policy.violation",
        data: {
          requesterId,
          amount,
          purpose: purpose || "",
          reason: "Amount exceeds single-request limit",
        },
      })
      return NextResponse.json(
        { error: "Amount exceeds policy limit", max: MAX_SINGLE_AMOUNT },
        { status: 400 }
      )
    }

    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const monthStartStr = toISODateString(monthStart)
    const existing = await getPettyCashRequests({ requester: requesterId })
    const thisMonth = existing.filter((r) => {
      const created = r.createdAt || ""
      return created >= monthStartStr && (r.status === "Issued" || r.status === "Approved")
    })
    const monthlyTotal = thisMonth.reduce((s, r) => s + r.amount, 0)
    if (monthlyTotal + amount > MAX_MONTHLY_PER_USER) {
      await routeToInngest({
        name: "house-of-veritas/petty.cash.policy.violation",
        data: {
          requesterId,
          amount,
          purpose: purpose || "",
          reason: "Monthly limit exceeded",
        },
      })
      return NextResponse.json(
        {
          error: "Monthly petty cash limit exceeded",
          used: monthlyTotal,
          limit: MAX_MONTHLY_PER_USER,
        },
        { status: 400 }
      )
    }

    const pc = await createPettyCashRequest({
      requester: requesterId,
      amount,
      purpose: purpose || "",
      receipt,
      status: "Pending",
      createdAt: toISODateString(),
      notes,
    })

    if (!pc) {
      return NextResponse.json(
        { error: "Failed to create petty cash request" },
        { status: 500 }
      )
    }

    await routeToInngest({
      name: "house-of-veritas/petty.cash.request.submitted",
      data: {
        id: pc.id,
        requesterId,
        amount,
        purpose: pc.purpose,
      },
    })

    return withDataSource({ pettyCash: pc })
  } catch (error) {
    logger.error("Error creating petty cash request", {
      error: error instanceof Error ? error.message : String(error),
    })
    return NextResponse.json(
      { error: "Failed to create petty cash request" },
      { status: 500 }
    )
  }
})

export const PATCH = withRole("admin")(async (request) => {
  try {
    const body = await request.json()
    const { id, status, issuedBy, ...rest } = body

    if (!id) {
      return NextResponse.json({ error: "Petty cash ID is required" }, { status: 400 })
    }

    const updates: Record<string, unknown> = { ...rest }
    if (status) updates.status = status
    if (issuedBy !== undefined) updates.issuedBy = issuedBy
    if (status === "Issued") {
      updates.issuedAt = toISODateString()
    }

    const pc = await updatePettyCashRequest(
      id,
      updates as Parameters<typeof updatePettyCashRequest>[1]
    )

    if (!pc) {
      return NextResponse.json({ error: "Petty cash request not found" }, { status: 404 })
    }

    return withDataSource({ pettyCash: pc })
  } catch (error) {
    logger.error("Error updating petty cash request", {
      error: error instanceof Error ? error.message : String(error),
    })
    return NextResponse.json(
      { error: "Failed to update petty cash request" },
      { status: 500 }
    )
  }
})
