import { NextResponse } from "next/server"
import {
  getLeaveRequests,
  createLeaveRequest,
  updateLeaveRequest,
  getEmployee,
  updateEmployee,
  getBaserowEmployeeIdByAppId,
} from "@/lib/services/baserow"
import { withDataSource } from "@/lib/api/response"
import { withRole } from "@/lib/auth/rbac"
import { toISODateString } from "@/lib/utils"
import { logger } from "@/lib/logger"
import { routeToInngest } from "@/lib/workflows"

function daysBetween(start: string, end: string): number {
  const a = new Date(start)
  const b = new Date(end)
  const diff = (b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24)
  return Math.max(0, Math.floor(diff) + 1)
}

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
    const requests = await getLeaveRequests({
      employee,
      status: status || undefined,
    })
    return withDataSource({ requests })
  } catch (error) {
    logger.error("Error fetching leave requests", {
      error: error instanceof Error ? error.message : String(error),
    })
    return NextResponse.json({ error: "Failed to fetch leave requests" }, { status: 500 })
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
    const { employee: empParam, personaId, startDate, endDate, type, notes } = body

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

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: "Start date and end date are required" },
        { status: 400 }
      )
    }

    const days = daysBetween(startDate, endDate)
    const emp = await getEmployee(employeeId)
    if (!emp) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 })
    }

    if (type === "Annual" || !type) {
      const balance = emp.leaveBalance ?? 0
      if (days > balance) {
        return NextResponse.json(
          {
            error: "Insufficient leave balance",
            balance,
            requested: days,
          },
          { status: 400 }
        )
      }
    }

    const leaveRequest = await createLeaveRequest({
      employee: employeeId,
      startDate,
      endDate,
      type: type || "Annual",
      status: "Pending",
      submittedAt: toISODateString(),
      notes,
    })

    if (!leaveRequest) {
      return NextResponse.json({ error: "Failed to create leave request" }, { status: 500 })
    }

    await routeToInngest({
      name: "house-of-veritas/leave.request.submitted",
      data: {
        id: leaveRequest.id,
        employeeId,
        startDate,
        endDate,
        type: leaveRequest.type,
        days,
      },
    })

    return withDataSource({ leaveRequest })
  } catch (error) {
    logger.error("Error creating leave request", {
      error: error instanceof Error ? error.message : String(error),
    })
    return NextResponse.json({ error: "Failed to create leave request" }, { status: 500 })
  }
})

export const PATCH = withRole("admin")(async (request) => {
  try {
    const body = await request.json()
    const { id, status, approver, ...rest } = body

    if (!id) {
      return NextResponse.json({ error: "Leave request ID is required" }, { status: 400 })
    }

    const updates: Record<string, unknown> = { ...rest }
    if (status) updates.status = status
    if (approver) updates.approver = approver
    if (status === "Approved" || status === "Rejected") {
      updates.approvedAt = toISODateString()
    }

    const leaveRequest = await updateLeaveRequest(id, updates as Parameters<typeof updateLeaveRequest>[1])

    if (!leaveRequest) {
      return NextResponse.json({ error: "Leave request not found" }, { status: 404 })
    }

    if (status === "Approved" && leaveRequest.type === "Annual") {
      const emp = await getEmployee(leaveRequest.employee)
      if (emp) {
        const days = daysBetween(leaveRequest.startDate, leaveRequest.endDate)
        const newBalance = Math.max(0, (emp.leaveBalance ?? 0) - days)
        await updateEmployee(emp.id, { leaveBalance: newBalance })
      }
    }

    return withDataSource({ leaveRequest })
  } catch (error) {
    logger.error("Error updating leave request", {
      error: error instanceof Error ? error.message : String(error),
    })
    return NextResponse.json({ error: "Failed to update leave request" }, { status: 500 })
  }
})
