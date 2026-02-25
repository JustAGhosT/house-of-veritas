import { NextResponse } from "next/server"
import {
  getExpenses,
  createExpense,
  updateExpense,
  getBaserowEmployeeIdByAppId,
} from "@/lib/services/baserow"
import { withDataSource } from "@/lib/api/response"
import { withRole } from "@/lib/auth/rbac"
import { toISODateString } from "@/lib/utils"
import { logger } from "@/lib/logger"
import { emitApprovalRequired } from "@/lib/realtime/event-store"
import { routeToInngest } from "@/lib/workflows"
import { sendNotification } from "@/lib/services/notification-service"

const HIGH_VALUE_THRESHOLD = 5000

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
    const expenses = await getExpenses({
      requester,
      status: status || undefined,
    })

    const summary = {
      total: expenses.length,
      pending: expenses.filter((e) => e.approvalStatus === "Pending").length,
      approved: expenses.filter((e) => e.approvalStatus === "Approved").length,
      rejected: expenses.filter((e) => e.approvalStatus === "Rejected").length,
      totalAmount: expenses.reduce((sum, e) => sum + e.amount, 0),
      pendingAmount: expenses
        .filter((e) => e.approvalStatus === "Pending")
        .reduce((sum, e) => sum + e.amount, 0),
      approvedAmount: expenses
        .filter((e) => e.approvalStatus === "Approved")
        .reduce((sum, e) => sum + e.amount, 0),
    }

    return withDataSource({ expenses, summary })
  } catch (error) {
    logger.error("Error fetching expenses", {
      error: error instanceof Error ? error.message : String(error),
    })
    return NextResponse.json({ error: "Failed to fetch expenses" }, { status: 500 })
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
    const { requester, personaId, type, category, amount, vendor, date, project, notes } = body

    let resolvedRequester = requester
    if (!resolvedRequester && personaId) {
      resolvedRequester = (await getBaserowEmployeeIdByAppId(personaId)) ?? undefined
    }
    if (!resolvedRequester) {
      const auth = request.headers.get("x-user-id")
      if (auth) resolvedRequester = (await getBaserowEmployeeIdByAppId(auth)) ?? undefined
    }
    if (!resolvedRequester) resolvedRequester = 1

    if (!amount || !category) {
      return NextResponse.json({ error: "Amount and category are required" }, { status: 400 })
    }

    const expense = await createExpense({
      requester: resolvedRequester,
      type: type || "Request",
      category,
      amount,
      vendor,
      date: date || toISODateString(),
      approvalStatus: "Pending",
      project,
      notes,
    })

    const useInngest = process.env.USE_INNGEST_APPROVALS === "true"
    if (!useInngest) {
      emitApprovalRequired(
        { ...expense, type: "expense", submittedBy: request.headers.get("x-user-id") || "unknown" },
        "hans"
      )
    }
    if (useInngest) {
      await routeToInngest({
        name: "house-of-veritas/expense.created",
        data: {
          ...expense,
          submittedBy: request.headers.get("x-user-id") || "unknown",
        },
      })
    }

    return withDataSource({ expense })
  } catch (error) {
    logger.error("Error creating expense", {
      error: error instanceof Error ? error.message : String(error),
    })
    return NextResponse.json({ error: "Failed to create expense" }, { status: 500 })
  }
})

export const PATCH = withRole("admin")(async (request) => {
  try {
    const body = await request.json()
    const { id, status, secondaryApprover, ...rest } = body

    if (!id) {
      return NextResponse.json({ error: "Expense ID is required" }, { status: 400 })
    }

    const existing = (await getExpenses({ status: undefined })).find((e) => e.id === id)
    if (!existing) {
      return NextResponse.json({ error: "Expense not found" }, { status: 404 })
    }

    const updates: Record<string, unknown> = { ...rest }
    if (status) updates.approvalStatus = status
    if (secondaryApprover !== undefined) updates.secondaryApprover = secondaryApprover

    const isHighValue = existing.amount > HIGH_VALUE_THRESHOLD
    if (status === "Approved" && isHighValue && existing.approvalStatus === "Pending") {
      Object.assign(updates, {
        approvalStatus: "Pending Secondary",
        approver: 1,
        approvalDate: toISODateString(),
      })
      const expense = await updateExpense(id, updates as Parameters<typeof updateExpense>[1])
      if (expense) {
        await sendNotification({
          type: "approval_required",
          userId: "hans",
          title: "Secondary Approval Required",
          message: `Expense R${existing.amount.toLocaleString()} needs secondary approval`,
          channels: ["in_app"],
          data: { expenseId: id, amount: existing.amount },
          priority: "medium",
        })
      }
      return withDataSource({ expense })
    }

    if (
      status === "Approved" &&
      existing.approvalStatus === "Pending Secondary"
    ) {
      Object.assign(updates, {
        approvalStatus: "Approved",
        secondaryApprover: secondaryApprover ?? 1,
        secondaryApprovalDate: toISODateString(),
      })
    }

    const expense = await updateExpense(id, updates as Parameters<typeof updateExpense>[1])

    if (!expense) {
      return NextResponse.json({ error: "Expense not found" }, { status: 404 })
    }

    return withDataSource({ expense })
  } catch (error) {
    logger.error("Error updating expense", {
      error: error instanceof Error ? error.message : String(error),
    })
    return NextResponse.json({ error: "Failed to update expense" }, { status: 500 })
  }
})
