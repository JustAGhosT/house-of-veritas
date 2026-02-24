"use client"

import { useState, useEffect, useCallback } from "react"
import {
  FileText,
  Download,
  Calendar,
  DollarSign,
  ClipboardList,
  Clock,
  Filter,
  Loader2,
  BarChart3,
  TrendingUp,
  FileDown,
} from "lucide-react"
import { generatePDFReport } from "@/lib/utils/pdf-generator"
import { logger } from "@/lib/logger"
import { apiFetch } from "@/lib/api-client"

type ReportType = "expenses" | "tasks" | "time" | "all"

interface ReportData {
  reportType: string
  generatedAt: string
  data: any
}

export function ReportsPanel() {
  const [reportType, setReportType] = useState<ReportType>("expenses")
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(false)
  const [dateRange, setDateRange] = useState({ start: "", end: "" })

  const fetchReport = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ type: reportType })
      if (dateRange.start) params.append("startDate", dateRange.start)
      if (dateRange.end) params.append("endDate", dateRange.end)

      const data = await apiFetch<ReportData>(`/api/reports?${params}`, { label: "Reports" })
      setReportData(data)
    } catch (error) {
      logger.error("Failed to fetch report", {
        error: error instanceof Error ? error.message : String(error),
      })
    } finally {
      setLoading(false)
    }
  }, [reportType, dateRange])

  const downloadCSV = async () => {
    const params = new URLSearchParams({ type: reportType, format: "csv" })
    if (dateRange.start) params.append("startDate", dateRange.start)
    if (dateRange.end) params.append("endDate", dateRange.end)

    const response = await fetch(`/api/reports?${params}`)
    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${reportType}-report-${new Date().toISOString().split("T")[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  const downloadPDF = () => {
    if (!reportData?.data) return

    const reportTitles: Record<string, string> = {
      expenses: "Expense Report",
      tasks: "Task Report",
      time: "Time & Attendance Report",
      all: "Comprehensive Report",
    }

    generatePDFReport({
      title: reportTitles[reportType] || "Report",
      subtitle: "House of Veritas - Estate Management",
      generatedAt: new Date(),
      data: reportData.data,
      type: reportType as any,
    })
  }

  useEffect(() => {
    fetchReport()
  }, [fetchReport])

  const reportTypes = [
    { id: "expenses", label: "Expenses", icon: DollarSign, color: "text-purple-400" },
    { id: "tasks", label: "Tasks", icon: ClipboardList, color: "text-blue-400" },
    { id: "time", label: "Time Log", icon: Clock, color: "text-green-400" },
    { id: "all", label: "All Reports", icon: BarChart3, color: "text-amber-400" },
  ]

  return (
    <div className="space-y-6">
      {/* Report Type Selector */}
      <div className="flex flex-wrap gap-3">
        {reportTypes.map((type) => (
          <button
            key={type.id}
            onClick={() => setReportType(type.id as ReportType)}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 transition-all ${
              reportType === type.id
                ? "bg-blue-600 text-white"
                : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
            }`}
          >
            <type.icon
              className={`h-4 w-4 ${reportType === type.id ? "text-white" : type.color}`}
            />
            {type.label}
          </button>
        ))}
      </div>

      {/* Filters & Actions */}
      <div className="flex flex-wrap items-center gap-4 rounded-xl border border-white/10 bg-white/5 p-4">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-white/40" />
          <input
            type="date"
            value={dateRange.start}
            onChange={(e) => setDateRange((prev) => ({ ...prev, start: e.target.value }))}
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
          />
          <span className="text-white/40">to</span>
          <input
            type="date"
            value={dateRange.end}
            onChange={(e) => setDateRange((prev) => ({ ...prev, end: e.target.value }))}
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
          />
        </div>

        <button
          onClick={fetchReport}
          disabled={loading}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Filter className="h-4 w-4" />}
          Generate
        </button>

        <button
          onClick={downloadCSV}
          className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-white transition-colors hover:bg-green-700"
        >
          <Download className="h-4 w-4" />
          Export CSV
        </button>

        <button
          onClick={downloadPDF}
          disabled={!reportData}
          className="flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-white transition-colors hover:bg-purple-700 disabled:opacity-50"
        >
          <FileDown className="h-4 w-4" />
          Export PDF
        </button>
      </div>

      {/* Report Content */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      ) : reportData ? (
        <div className="space-y-6">
          {/* Summary Cards */}
          {reportType === "expenses" && reportData.data?.summary && (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              <SummaryCard
                title="Total Expenses"
                value={`R${reportData.data.summary.total}`}
                icon={DollarSign}
                color="purple"
              />
              <SummaryCard
                title="Approved"
                value={`R${reportData.data.summary.approved}`}
                icon={TrendingUp}
                color="green"
              />
              <SummaryCard
                title="Pending"
                value={`R${reportData.data.summary.pending}`}
                icon={Clock}
                color="amber"
              />
              <SummaryCard
                title="Count"
                value={reportData.data.summary.count}
                icon={FileText}
                color="blue"
              />
            </div>
          )}

          {reportType === "tasks" && reportData.data?.summary && (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              <SummaryCard
                title="Total Tasks"
                value={reportData.data.summary.total}
                icon={ClipboardList}
                color="blue"
              />
              <SummaryCard
                title="Completed"
                value={reportData.data.summary.completed}
                icon={TrendingUp}
                color="green"
              />
              <SummaryCard
                title="In Progress"
                value={reportData.data.summary.inProgress}
                icon={Clock}
                color="amber"
              />
              <SummaryCard
                title="Pending"
                value={reportData.data.summary.pending}
                icon={FileText}
                color="purple"
              />
            </div>
          )}

          {reportType === "time" && reportData.data?.summary && (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              <SummaryCard
                title="Total Hours"
                value={`${reportData.data.summary.totalHours}h`}
                icon={Clock}
                color="blue"
              />
              <SummaryCard
                title="Overtime"
                value={`${reportData.data.summary.totalOvertime}h`}
                icon={TrendingUp}
                color="amber"
              />
              <SummaryCard
                title="Regular"
                value={`${reportData.data.summary.regularHours}h`}
                icon={FileText}
                color="green"
              />
              <SummaryCard
                title="Days Worked"
                value={reportData.data.summary.daysWorked}
                icon={Calendar}
                color="purple"
              />
            </div>
          )}

          {/* Data Table */}
          <div className="overflow-hidden rounded-xl border border-white/10 bg-white/5">
            <div className="border-b border-white/10 p-4">
              <h3 className="font-semibold text-white">Detailed Report</h3>
              <p className="text-sm text-white/50">
                Generated: {new Date(reportData.generatedAt).toLocaleString()}
              </p>
            </div>
            <div className="overflow-x-auto">
              <ReportTable type={reportType} data={reportData.data} />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

function SummaryCard({
  title,
  value,
  icon: Icon,
  color,
}: {
  title: string
  value: string | number
  icon: any
  color: "blue" | "green" | "amber" | "purple"
}) {
  const colors = {
    blue: "from-blue-600/20 to-blue-600/5 border-blue-500/30 text-blue-400",
    green: "from-green-600/20 to-green-600/5 border-green-500/30 text-green-400",
    amber: "from-amber-600/20 to-amber-600/5 border-amber-500/30 text-amber-400",
    purple: "from-purple-600/20 to-purple-600/5 border-purple-500/30 text-purple-400",
  }

  return (
    <div className={`rounded-xl bg-linear-to-br p-4 ${colors[color]} border`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-white/60">{title}</p>
          <p className="mt-1 text-2xl font-bold text-white">{value}</p>
        </div>
        <Icon className="h-8 w-8 opacity-60" />
      </div>
    </div>
  )
}

function ReportTable({ type, data }: { type: ReportType; data: any }) {
  if (type === "expenses" && data?.expenses) {
    return (
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/10 text-white/60">
            <th className="p-4 text-left">Date</th>
            <th className="p-4 text-left">Category</th>
            <th className="p-4 text-right">Amount</th>
            <th className="p-4 text-left">Status</th>
            <th className="p-4 text-left">Submitted By</th>
          </tr>
        </thead>
        <tbody>
          {data.expenses.map((expense: any) => (
            <tr key={expense.id} className="border-b border-white/5 hover:bg-white/5">
              <td className="p-4 text-white">{expense.date}</td>
              <td className="p-4 text-white">{expense.category}</td>
              <td className="p-4 text-right text-white">R{expense.amount}</td>
              <td className="p-4">
                <span
                  className={`rounded-full px-2 py-1 text-xs ${
                    expense.status === "approved"
                      ? "bg-green-500/20 text-green-400"
                      : expense.status === "pending"
                        ? "bg-amber-500/20 text-amber-400"
                        : "bg-red-500/20 text-red-400"
                  }`}
                >
                  {expense.status}
                </span>
              </td>
              <td className="p-4 text-white/70">{expense.submittedBy}</td>
            </tr>
          ))}
        </tbody>
      </table>
    )
  }

  if (type === "tasks" && data?.tasks) {
    return (
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/10 text-white/60">
            <th className="p-4 text-left">Task</th>
            <th className="p-4 text-left">Assignee</th>
            <th className="p-4 text-left">Status</th>
            <th className="p-4 text-left">Priority</th>
            <th className="p-4 text-left">Completed</th>
          </tr>
        </thead>
        <tbody>
          {data.tasks.map((task: any) => (
            <tr key={task.id} className="border-b border-white/5 hover:bg-white/5">
              <td className="p-4 text-white">{task.title}</td>
              <td className="p-4 text-white/70">{task.assignee}</td>
              <td className="p-4">
                <span
                  className={`rounded-full px-2 py-1 text-xs ${
                    task.status === "completed"
                      ? "bg-green-500/20 text-green-400"
                      : task.status === "in_progress"
                        ? "bg-blue-500/20 text-blue-400"
                        : "bg-amber-500/20 text-amber-400"
                  }`}
                >
                  {task.status}
                </span>
              </td>
              <td className="p-4">
                <span
                  className={`rounded-full px-2 py-1 text-xs ${
                    task.priority === "high"
                      ? "bg-red-500/20 text-red-400"
                      : task.priority === "medium"
                        ? "bg-amber-500/20 text-amber-400"
                        : "bg-green-500/20 text-green-400"
                  }`}
                >
                  {task.priority}
                </span>
              </td>
              <td className="p-4 text-white/70">{task.completedDate || "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    )
  }

  if (type === "time" && data?.entries) {
    return (
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/10 text-white/60">
            <th className="p-4 text-left">Date</th>
            <th className="p-4 text-left">User</th>
            <th className="p-4 text-left">Clock In</th>
            <th className="p-4 text-left">Clock Out</th>
            <th className="p-4 text-right">Hours</th>
            <th className="p-4 text-right">Overtime</th>
          </tr>
        </thead>
        <tbody>
          {data.entries.map((entry: any) => (
            <tr key={entry.id} className="border-b border-white/5 hover:bg-white/5">
              <td className="p-4 text-white">{entry.date}</td>
              <td className="p-4 text-white/70">{entry.user}</td>
              <td className="p-4 text-green-400">{entry.clockIn}</td>
              <td className="p-4 text-amber-400">{entry.clockOut}</td>
              <td className="p-4 text-right text-white">{entry.hours}h</td>
              <td className="p-4 text-right">
                {entry.overtime > 0 && <span className="text-amber-400">+{entry.overtime}h</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    )
  }

  return <p className="p-4 text-white/50">No data available</p>
}

export default ReportsPanel
