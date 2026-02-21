import { NextResponse } from "next/server"
import { getAuthContext } from "@/lib/auth/rbac"
import {
  getExpenses,
  getTasks,
  getTimeClockEntries,
  isBaserowConfigured,
} from "@/lib/services/baserow"

export async function GET(request: Request) {
  const auth = getAuthContext(request)
  if (!auth || auth.role !== "admin") {
    return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const reportType = searchParams.get("type") || "expenses"
  const userId = searchParams.get("userId")
  const format = searchParams.get("format") || "json"

  let data: Record<string, unknown>

  switch (reportType) {
    case "expenses":
      data = await buildExpenseReport(userId || undefined)
      break
    case "tasks":
      data = await buildTaskReport(userId || undefined)
      break
    case "time":
      data = await buildTimeReport(userId || undefined)
      break
    case "all":
      data = {
        expenses: await buildExpenseReport(userId || undefined),
        tasks: await buildTaskReport(userId || undefined),
        time: await buildTimeReport(userId || undefined),
      }
      break
    default:
      return NextResponse.json({ error: "Invalid report type" }, { status: 400 })
  }

  if (format === "csv") {
    const csv = generateCsv(reportType, data)
    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="${reportType}-report-${new Date().toISOString().split("T")[0]}.csv"`,
      },
    })
  }

  return NextResponse.json({
    reportType,
    dataSource: isBaserowConfigured() ? "live" : "mock",
    generatedAt: new Date().toISOString(),
    filters: { userId },
    data,
  })
}

async function buildExpenseReport(userId?: string) {
  const expenses = await getExpenses()
  const filtered = userId
    ? expenses.filter((e) => e.requesterName?.toLowerCase() === userId.toLowerCase())
    : expenses

  const total = filtered.reduce((sum, e) => sum + e.amount, 0)

  return {
    expenses: filtered,
    summary: {
      total,
      approved: filtered.filter((e) => e.approvalStatus === "Approved").reduce((sum, e) => sum + e.amount, 0),
      pending: filtered.filter((e) => e.approvalStatus === "Pending").reduce((sum, e) => sum + e.amount, 0),
      count: filtered.length,
      byCategory: filtered.reduce((acc, e) => {
        acc[e.category] = (acc[e.category] || 0) + e.amount
        return acc
      }, {} as Record<string, number>),
    },
  }
}

async function buildTaskReport(userId?: string) {
  const tasks = await getTasks()
  const filtered = userId
    ? tasks.filter((t) => t.assignedToName?.toLowerCase() === userId.toLowerCase())
    : tasks

  return {
    tasks: filtered,
    summary: {
      total: filtered.length,
      completed: filtered.filter((t) => t.status === "Completed").length,
      inProgress: filtered.filter((t) => t.status === "In Progress").length,
      pending: filtered.filter((t) => t.status === "Not Started").length,
      byPriority: {
        high: filtered.filter((t) => t.priority === "High").length,
        medium: filtered.filter((t) => t.priority === "Medium").length,
        low: filtered.filter((t) => t.priority === "Low").length,
      },
    },
  }
}

async function buildTimeReport(userId?: string) {
  const entries = await getTimeClockEntries()
  const filtered = userId
    ? entries.filter((e) => e.employeeName?.toLowerCase() === userId.toLowerCase())
    : entries

  const totalHours = filtered.reduce((sum, e) => sum + (e.totalHours || 0), 0)
  const totalOvertime = filtered.reduce((sum, e) => sum + (e.overtimeHours || 0), 0)

  return {
    entries: filtered,
    summary: {
      totalHours,
      totalOvertime,
      regularHours: totalHours - totalOvertime,
      averageDaily: totalHours / (filtered.length || 1),
      daysWorked: new Set(filtered.map((e) => e.date)).size,
    },
  }
}

function generateCsv(reportType: string, data: Record<string, unknown>): string {
  if (reportType === "expenses") {
    const d = data as Awaited<ReturnType<typeof buildExpenseReport>>
    let csv = "Date,Category,Amount,Status,Submitted By\n"
    csv += d.expenses
      .map((e) => `${e.date},${e.category},${e.amount},${e.approvalStatus},${e.requesterName}`)
      .join("\n")
    return csv
  }
  if (reportType === "tasks") {
    const d = data as Awaited<ReturnType<typeof buildTaskReport>>
    let csv = "Title,Assignee,Status,Priority,Completed Date\n"
    csv += d.tasks
      .map((t) => `"${t.title}",${t.assignedToName},${t.status},${t.priority},${t.completedDate || ""}`)
      .join("\n")
    return csv
  }
  if (reportType === "time") {
    const d = data as Awaited<ReturnType<typeof buildTimeReport>>
    let csv = "Date,Employee,Clock In,Clock Out,Hours,Overtime\n"
    csv += d.entries
      .map((e) => `${e.date},${e.employeeName},${e.clockIn || ""},${e.clockOut || ""},${e.totalHours || 0},${e.overtimeHours || 0}`)
      .join("\n")
    return csv
  }
  return ""
}
