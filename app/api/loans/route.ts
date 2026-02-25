import { NextResponse } from "next/server"
import {
  getLoans,
  createLoan,
  updateLoan,
  getEmployee,
  getBaserowEmployeeIdByAppId,
} from "@/lib/services/baserow"
import { submitPayment } from "@/lib/integrations/bank"
import { withDataSource } from "@/lib/api/response"
import { withRole } from "@/lib/auth/rbac"
import { toISODateString } from "@/lib/utils"
import { logger } from "@/lib/logger"
import { routeToInngest } from "@/lib/workflows"

const MAX_LOAN_AMOUNT = 50000
const MAX_OUTSTANDING = 20000

export const GET = withRole(
  "admin",
  "operator",
  "employee",
  "resident"
)(async (request) => {
  const { searchParams } = new URL(request.url)
  const employeeParam = searchParams.get("employee")
  const personaId = searchParams.get("personaId")
  const status = searchParams.get("status")

  let employee: number | undefined
  if (employeeParam) {
    employee = parseInt(employeeParam, 10)
    if (Number.isNaN(employee)) employee = undefined
  } else if (personaId) {
    employee = (await getBaserowEmployeeIdByAppId(personaId)) ?? undefined
  }

  try {
    const loans = await getLoans({
      employee,
      status: status || undefined,
    })
    return withDataSource({ loans })
  } catch (error) {
    logger.error("Error fetching loans", {
      error: error instanceof Error ? error.message : String(error),
    })
    return NextResponse.json({ error: "Failed to fetch loans" }, { status: 500 })
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
    const { employee: empParam, personaId, amount, purpose, repaymentSchedule } = body

    let employeeId = empParam
    if (!employeeId && personaId) {
      employeeId = (await getBaserowEmployeeIdByAppId(personaId)) ?? undefined
    }
    if (!employeeId) {
      const auth = request.headers.get("x-user-id")
      employeeId = (await getBaserowEmployeeIdByAppId(auth || "")) ?? undefined
    }
    if (!employeeId) {
      return NextResponse.json({ error: "Employee is required" }, { status: 400 })
    }

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Valid amount is required" }, { status: 400 })
    }

    const existingLoans = await getLoans({ employee: employeeId, status: "Active" })
    const totalOutstanding = existingLoans.reduce((s, l) => s + l.outstandingBalance, 0)
    if (totalOutstanding >= MAX_OUTSTANDING) {
      return NextResponse.json(
        {
          error: "Outstanding loan limit reached",
          outstanding: totalOutstanding,
          limit: MAX_OUTSTANDING,
        },
        { status: 400 }
      )
    }

    const overdue = existingLoans.filter((l) => {
      if (!l.nextRepaymentDate) return false
      return new Date(l.nextRepaymentDate) < new Date()
    })
    if (overdue.length > 0) {
      return NextResponse.json(
        { error: "Cannot request new loan while repayments are overdue" },
        { status: 400 }
      )
    }

    if (amount > MAX_LOAN_AMOUNT) {
      return NextResponse.json(
        { error: "Amount exceeds maximum", max: MAX_LOAN_AMOUNT },
        { status: 400 }
      )
    }

    const loan = await createLoan({
      employee: employeeId,
      amount,
      purpose: purpose || "",
      repaymentSchedule: repaymentSchedule || "",
      status: "Pending",
      outstandingBalance: amount,
      createdAt: toISODateString(),
      notes: body.notes,
    })

    if (!loan) {
      return NextResponse.json({ error: "Failed to create loan" }, { status: 500 })
    }

    await routeToInngest({
      name: "house-of-veritas/loan.request.submitted",
      data: {
        id: loan.id,
        employeeId,
        amount,
        purpose: loan.purpose,
      },
    })

    return withDataSource({ loan })
  } catch (error) {
    logger.error("Error creating loan", {
      error: error instanceof Error ? error.message : String(error),
    })
    return NextResponse.json({ error: "Failed to create loan" }, { status: 500 })
  }
})

export const PATCH = withRole("admin")(async (request) => {
  try {
    const body = await request.json()
    const { id, status, approver, outstandingBalance, nextRepaymentDate, ...rest } = body

    if (!id) {
      return NextResponse.json({ error: "Loan ID is required" }, { status: 400 })
    }

    const updates: Record<string, unknown> = { ...rest }
    if (status) updates.status = status
    if (approver !== undefined) updates.approvedBy = approver
    if (outstandingBalance !== undefined) updates.outstandingBalance = outstandingBalance
    if (nextRepaymentDate !== undefined) updates.nextRepaymentDate = nextRepaymentDate

    if (status === "Approved") {
      updates.approvedAt = toISODateString()
      updates.disbursedAt = toISODateString()
      if (!updates.nextRepaymentDate) {
        const d = new Date()
        d.setDate(d.getDate() + 30)
        updates.nextRepaymentDate = toISODateString(d)
      }
    }

    const loan = await updateLoan(id, updates as Parameters<typeof updateLoan>[1])

    if (!loan) {
      return NextResponse.json({ error: "Loan not found" }, { status: 404 })
    }

    if (status === "Approved") {
      const emp = await getEmployee(loan.employee)
      const result = await submitPayment({
        recipientId: String(loan.employee),
        recipientName: emp?.fullName ?? "Employee",
        amount: loan.amount,
        currency: "ZAR",
        reference: `LOAN-${loan.id}`,
        type: "loan",
      })
      if (!result.success) {
        logger.warn("Bank payment failed for loan", { loanId: loan.id, result })
      }
    }

    if (updates.outstandingBalance === 0) {
      await updateLoan(id, { status: "Repaid" })
    }

    return withDataSource({ loan })
  } catch (error) {
    logger.error("Error updating loan", {
      error: error instanceof Error ? error.message : String(error),
    })
    return NextResponse.json({ error: "Failed to update loan" }, { status: 500 })
  }
})
