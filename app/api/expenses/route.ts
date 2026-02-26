import { resolveEmployeeForGet, resolveEmployeeForPost } from "@/lib/api/employee-resolver"
import { withErrorHandling } from "@/lib/api/error-handler"
import { withDataSource } from "@/lib/api/response"
import { withRole } from "@/lib/auth/rbac"
import { logger } from "@/lib/logger"
import { emitApprovalRequired } from "@/lib/realtime/event-store"
import {
  createExpense,
  getBaserowEmployeeIdByAppId,
  getExpense,
  getExpenses,
  updateExpense,
} from "@/lib/services/baserow"
import { sendNotification } from "@/lib/services/notification-service"
import { toISODateString } from "@/lib/utils"
import { routeToInngest } from "@/lib/workflows"
import { NextResponse } from "next/server"

const HIGH_VALUE_THRESHOLD = 5000

// Default requester ID fallback when employee resolution fails
// In production, this should be configured via environment variable
function getDefaultRequesterId(): number {
  if (process.env.DEFAULT_EXPENSE_REQUESTER_ID) {
    const parsed = parseInt(process.env.DEFAULT_EXPENSE_REQUESTER_ID, 10)
    if (Number.isInteger(parsed) && parsed > 0) {
      return parsed
    }
    // Log warning for invalid env value but continue with fallback
    console.warn(`Invalid DEFAULT_EXPENSE_REQUESTER_ID: ${process.env.DEFAULT_EXPENSE_REQUESTER_ID}, using fallback`)
  }
  return 1
}
const DEFAULT_REQUESTER_ID = getDefaultRequesterId()

export const GET = withRole(
  "admin",
  "operator",
  "employee",
  "resident"
)(
  withErrorHandling(
    async (request, context) => {
      const { searchParams } = new URL(request.url)
      const status = searchParams.get("status")

      const { employeeId: requester, error } = await resolveEmployeeForGet(
        context,
        searchParams,
        { paramName: "requester" }
      )
      if (error) return error

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
    },
    { operation: "Error fetching expenses", fallbackMessage: "Failed to fetch expenses" }
  )
)

export const POST = withRole(
  "admin",
  "operator",
  "employee",
  "resident"
)(async (request, context) => {
  try {
    const body = await request.json()
    const { type, category, amount, vendor, date, project, notes } = body

    const { employeeId: resolvedRequester, error } = await resolveEmployeeForPost(
      body,
      request,
      context,
      { paramName: "requester", required: false, fallbackToCaller: true }
    )
    if (error) return error
    const finalRequester = resolvedRequester ?? DEFAULT_REQUESTER_ID

    if (!amount || !category) {
      return NextResponse.json({ error: "Amount and category are required" }, { status: 400 })
    }

    const expense = await createExpense({
      requester: finalRequester,
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
      // Resolve approver dynamically from env or request context - no hardcoded fallback
      const approverId = process.env.EXPENSE_APPROVER_ID || request.headers.get("x-user-id")
      if (!approverId) {
        return NextResponse.json(
          { error: "Unable to determine approver: EXPENSE_APPROVER_ID env var or x-user-id header required" },
          { status: 400 }
        )
      }
      emitApprovalRequired(
        { ...expense, type: "expense", submittedBy: request.headers.get("x-user-id") || "unknown" },
        approverId
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

    // Normalize and validate id once
    const numericId = Number(id)
    if (!Number.isFinite(numericId) || numericId <= 0) {
      return NextResponse.json({ error: "Invalid expense ID" }, { status: 400 })
    }

    const existing = await getExpense(numericId)
    if (!existing) {
      return NextResponse.json({ error: "Expense not found" }, { status: 404 })
    }

    const updates: Record<string, unknown> = { ...rest }
    if (status) updates.approvalStatus = status
    if (secondaryApprover !== undefined) updates.secondaryApprover = secondaryApprover

    const isHighValue = existing.amount >= HIGH_VALUE_THRESHOLD
    if (status === "Approved" && isHighValue && existing.approvalStatus === "Pending") {
      // Validate x-user-id header before mutating updates
      const currentUserId = request.headers.get("x-user-id")
      if (!currentUserId) {
        return NextResponse.json(
          { error: "x-user-id header is required for approval" },
          { status: 400 }
        )
      }

      const approverId = await getBaserowEmployeeIdByAppId(currentUserId)
      if (!approverId) {
        return NextResponse.json(
          { error: "Could not resolve approver from x-user-id" },
          { status: 400 }
        )
      }

      Object.assign(updates, {
        approvalStatus: "Pending Secondary",
        approver: approverId,
        approvalDate: toISODateString(),
      })
      const expense = await updateExpense(numericId, updates as Parameters<typeof updateExpense>[1])
      if (expense) {
        // Derive userId dynamically from request headers - no hardcoded fallback
        const notificationUserId = request.headers.get("x-user-id") || process.env.EXPENSE_APPROVER_ID
        if (!notificationUserId) {
          return NextResponse.json(
            { error: "Unable to determine notification recipient: x-user-id header or EXPENSE_APPROVER_ID env var required" },
            { status: 400 }
          )
        }
        // Format amount using locale-aware formatter
        const currencySymbol = process.env.CURRENCY_SYMBOL || "R"
        const formattedAmount = new Intl.NumberFormat("en-ZA", {
          style: "currency",
          currency: process.env.CURRENCY_CODE || "ZAR",
        }).format(existing.amount)

        await sendNotification({
          type: "approval_required",
          userId: notificationUserId,
          title: "Secondary Approval Required",
          message: `Expense ${formattedAmount} needs secondary approval`,
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

    const expense = await updateExpense(numericId, updates as Parameters<typeof updateExpense>[1])

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
