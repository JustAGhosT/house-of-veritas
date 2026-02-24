"use client"

import { useState, useEffect, useCallback } from "react"
import { logger } from "@/lib/logger"
import { apiFetch } from "@/lib/api-client"
import {
  DollarSign,
  Users,
  Clock,
  TrendingUp,
  Download,
  RefreshCw,
  Loader2,
  AlertCircle,
  CheckCircle,
  Calculator,
} from "lucide-react"

interface EmployeePayroll {
  id: string
  name: string
  role: string
  hourlyRate: number
  monthlyHours: number
  overtime: number
  regularPay: number
  overtimePay: number
  grossPay: number
  totalDeductions: number
  netPay: number
  deductions: {
    tax: number
    uif: number
    pension: number
  }
}

interface PayrollData {
  mode: "mock" | "live"
  month: string
  employees: EmployeePayroll[]
  totals: {
    totalGrossPay: number
    totalDeductions: number
    totalNetPay: number
    totalHours: number
    totalOvertime: number
  }
}

export function PayrollPanel() {
  const [data, setData] = useState<PayrollData | null>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7))

  const fetchPayroll = useCallback(async () => {
    setLoading(true)
    try {
      const result = await apiFetch<PayrollData>(`/api/payroll?month=${selectedMonth}`, {
        label: "Payroll",
      })
      setData(result)
    } catch (error) {
      logger.error("Failed to fetch payroll", {
        error: error instanceof Error ? error.message : String(error),
      })
    } finally {
      setLoading(false)
    }
  }, [selectedMonth])

  useEffect(() => {
    fetchPayroll()
  }, [fetchPayroll])

  const runPayroll = async () => {
    setProcessing(true)
    try {
      const result = await apiFetch<{ success?: boolean; totalPayout?: number }>("/api/payroll", {
        method: "POST",
        body: { action: "run-payroll", month: selectedMonth },
        label: "Payroll",
      })
      if (result?.success) {
        alert(
          `Payroll processed successfully! Total payout: R${(result.totalPayout ?? 0).toLocaleString()}`
        )
        fetchPayroll()
      }
    } catch (error) {
      logger.error("Failed to run payroll", {
        error: error instanceof Error ? error.message : String(error),
      })
    } finally {
      setProcessing(false)
    }
  }

  const exportPayroll = () => {
    if (!data) return

    let csv = "Employee,Role,Hours,Overtime,Gross Pay,Deductions,Net Pay\n"
    data.employees.forEach((emp) => {
      csv += `${emp.name},${emp.role},${emp.monthlyHours},${emp.overtime},R${emp.grossPay},R${emp.totalDeductions},R${emp.netPay}\n`
    })
    csv += `\nTOTALS,,${data.totals.totalHours},${data.totals.totalOvertime},R${data.totals.totalGrossPay},R${data.totals.totalDeductions},R${data.totals.totalNetPay}`

    const blob = new Blob([csv], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `payroll-${selectedMonth}.csv`
    a.click()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-green-500/20 p-2">
            <DollarSign className="h-5 w-5 text-green-400" />
          </div>
          <div>
            <h2 className="font-semibold text-white">Payroll Management</h2>
            <p className="text-sm text-white/50">
              {data?.mode === "live"
                ? "Connected to QuickBooks"
                : "Demo Mode - QuickBooks not configured"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white"
          />
          <button
            onClick={fetchPayroll}
            className="rounded-lg bg-white/5 p-2 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
            aria-label="Refresh payroll data"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Mode Alert */}
      {data?.mode === "mock" && (
        <div className="flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>Using demo data. Configure QuickBooks/Xero for live payroll integration.</span>
        </div>
      )}

      {/* Summary Cards */}
      {data && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
          <SummaryCard title="Employees" value={data.employees.length} icon={Users} color="blue" />
          <SummaryCard
            title="Total Hours"
            value={`${data.totals.totalHours}h`}
            icon={Clock}
            color="purple"
          />
          <SummaryCard
            title="Gross Pay"
            value={`R${data.totals.totalGrossPay.toLocaleString()}`}
            icon={TrendingUp}
            color="green"
          />
          <SummaryCard
            title="Deductions"
            value={`R${data.totals.totalDeductions.toLocaleString()}`}
            icon={Calculator}
            color="amber"
          />
          <SummaryCard
            title="Net Payout"
            value={`R${data.totals.totalNetPay.toLocaleString()}`}
            icon={DollarSign}
            color="green"
          />
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={runPayroll}
          disabled={processing}
          className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-white transition-colors hover:bg-green-700 disabled:opacity-50"
        >
          {processing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <CheckCircle className="h-4 w-4" />
          )}
          Run Payroll
        </button>
        <button
          onClick={exportPayroll}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
        >
          <Download className="h-4 w-4" />
          Export CSV
        </button>
      </div>

      {/* Employee Payroll Table */}
      {data && (
        <div className="overflow-hidden rounded-xl border border-white/10 bg-white/5">
          <div className="border-b border-white/10 p-4">
            <h3 className="font-semibold text-white">Employee Payroll Details</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-white/60">
                  <th className="p-4 text-left">Employee</th>
                  <th className="p-4 text-left">Role</th>
                  <th className="p-4 text-right">Hours</th>
                  <th className="p-4 text-right">OT</th>
                  <th className="p-4 text-right">Gross</th>
                  <th className="p-4 text-right">Tax</th>
                  <th className="p-4 text-right">UIF</th>
                  <th className="p-4 text-right">Pension</th>
                  <th className="p-4 text-right font-semibold">Net Pay</th>
                </tr>
              </thead>
              <tbody>
                {data.employees.map((emp) => (
                  <tr key={emp.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="p-4 font-medium text-white">{emp.name}</td>
                    <td className="p-4 text-white/70">{emp.role}</td>
                    <td className="p-4 text-right text-white/70">{emp.monthlyHours}h</td>
                    <td className="p-4 text-right">
                      {emp.overtime > 0 && <span className="text-amber-400">+{emp.overtime}h</span>}
                    </td>
                    <td className="p-4 text-right text-white">R{emp.grossPay.toLocaleString()}</td>
                    <td className="p-4 text-right text-red-400/70">-R{emp.deductions.tax}</td>
                    <td className="p-4 text-right text-red-400/70">-R{emp.deductions.uif}</td>
                    <td className="p-4 text-right text-red-400/70">-R{emp.deductions.pension}</td>
                    <td className="p-4 text-right font-semibold text-green-400">
                      R{emp.netPay.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-white/5">
                  <td colSpan={2} className="p-4 font-semibold text-white">
                    TOTALS
                  </td>
                  <td className="p-4 text-right font-semibold text-white">
                    {data.totals.totalHours}h
                  </td>
                  <td className="p-4 text-right text-amber-400">{data.totals.totalOvertime}h</td>
                  <td className="p-4 text-right font-semibold text-white">
                    R{data.totals.totalGrossPay.toLocaleString()}
                  </td>
                  <td colSpan={3} className="p-4 text-right text-red-400">
                    -R{data.totals.totalDeductions.toLocaleString()}
                  </td>
                  <td className="p-4 text-right font-bold text-green-400">
                    R{data.totals.totalNetPay.toLocaleString()}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
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
          <p className="mt-1 text-xl font-bold text-white">{value}</p>
        </div>
        <Icon className="h-6 w-6 opacity-60" />
      </div>
    </div>
  )
}

export default PayrollPanel
