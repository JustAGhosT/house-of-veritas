"use client"

import { useState, useEffect } from 'react'
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
} from 'lucide-react'

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
  mode: 'mock' | 'live'
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

  const fetchPayroll = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/payroll?month=${selectedMonth}`)
      const result = await response.json()
      setData(result)
    } catch (error) {
      console.error('Failed to fetch payroll:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPayroll()
  }, [selectedMonth])

  const runPayroll = async () => {
    setProcessing(true)
    try {
      const response = await fetch('/api/payroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'run-payroll', month: selectedMonth }),
      })
      const result = await response.json()
      if (result.success) {
        alert(`Payroll processed successfully! Total payout: R${result.totalPayout.toLocaleString()}`)
        fetchPayroll()
      }
    } catch (error) {
      console.error('Failed to run payroll:', error)
    } finally {
      setProcessing(false)
    }
  }

  const exportPayroll = () => {
    if (!data) return

    let csv = 'Employee,Role,Hours,Overtime,Gross Pay,Deductions,Net Pay\n'
    data.employees.forEach(emp => {
      csv += `${emp.name},${emp.role},${emp.monthlyHours},${emp.overtime},R${emp.grossPay},R${emp.totalDeductions},R${emp.netPay}\n`
    })
    csv += `\nTOTALS,,${data.totals.totalHours},${data.totals.totalOvertime},R${data.totals.totalGrossPay},R${data.totals.totalDeductions},R${data.totals.totalNetPay}`

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `payroll-${selectedMonth}.csv`
    a.click()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-green-500/20">
            <DollarSign className="w-5 h-5 text-green-400" />
          </div>
          <div>
            <h2 className="text-white font-semibold">Payroll Management</h2>
            <p className="text-white/50 text-sm">
              {data?.mode === 'live' ? 'Connected to QuickBooks' : 'Demo Mode - QuickBooks not configured'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white"
          />
          <button
            onClick={fetchPayroll}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mode Alert */}
      {data?.mode === 'mock' && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>Using demo data. Configure QuickBooks/Xero for live payroll integration.</span>
        </div>
      )}

      {/* Summary Cards */}
      {data && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <SummaryCard
            title="Employees"
            value={data.employees.length}
            icon={Users}
            color="blue"
          />
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
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 transition-colors"
        >
          {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
          Run Payroll
        </button>
        <button
          onClick={exportPayroll}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {/* Employee Payroll Table */}
      {data && (
        <div className="rounded-xl bg-white/5 border border-white/10 overflow-hidden">
          <div className="p-4 border-b border-white/10">
            <h3 className="text-white font-semibold">Employee Payroll Details</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-white/60 border-b border-white/10">
                  <th className="text-left p-4">Employee</th>
                  <th className="text-left p-4">Role</th>
                  <th className="text-right p-4">Hours</th>
                  <th className="text-right p-4">OT</th>
                  <th className="text-right p-4">Gross</th>
                  <th className="text-right p-4">Tax</th>
                  <th className="text-right p-4">UIF</th>
                  <th className="text-right p-4">Pension</th>
                  <th className="text-right p-4 font-semibold">Net Pay</th>
                </tr>
              </thead>
              <tbody>
                {data.employees.map((emp) => (
                  <tr key={emp.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="p-4 text-white font-medium">{emp.name}</td>
                    <td className="p-4 text-white/70">{emp.role}</td>
                    <td className="p-4 text-white/70 text-right">{emp.monthlyHours}h</td>
                    <td className="p-4 text-right">
                      {emp.overtime > 0 && (
                        <span className="text-amber-400">+{emp.overtime}h</span>
                      )}
                    </td>
                    <td className="p-4 text-white text-right">R{emp.grossPay.toLocaleString()}</td>
                    <td className="p-4 text-red-400/70 text-right">-R{emp.deductions.tax}</td>
                    <td className="p-4 text-red-400/70 text-right">-R{emp.deductions.uif}</td>
                    <td className="p-4 text-red-400/70 text-right">-R{emp.deductions.pension}</td>
                    <td className="p-4 text-green-400 text-right font-semibold">
                      R{emp.netPay.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-white/5">
                  <td colSpan={2} className="p-4 text-white font-semibold">TOTALS</td>
                  <td className="p-4 text-white text-right font-semibold">{data.totals.totalHours}h</td>
                  <td className="p-4 text-amber-400 text-right">{data.totals.totalOvertime}h</td>
                  <td className="p-4 text-white text-right font-semibold">
                    R{data.totals.totalGrossPay.toLocaleString()}
                  </td>
                  <td colSpan={3} className="p-4 text-red-400 text-right">
                    -R{data.totals.totalDeductions.toLocaleString()}
                  </td>
                  <td className="p-4 text-green-400 text-right font-bold">
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

function SummaryCard({ title, value, icon: Icon, color }: {
  title: string
  value: string | number
  icon: any
  color: 'blue' | 'green' | 'amber' | 'purple'
}) {
  const colors = {
    blue: 'from-blue-600/20 to-blue-600/5 border-blue-500/30 text-blue-400',
    green: 'from-green-600/20 to-green-600/5 border-green-500/30 text-green-400',
    amber: 'from-amber-600/20 to-amber-600/5 border-amber-500/30 text-amber-400',
    purple: 'from-purple-600/20 to-purple-600/5 border-purple-500/30 text-purple-400',
  }

  return (
    <div className={`p-4 rounded-xl bg-gradient-to-br ${colors[color]} border`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white/60 text-sm">{title}</p>
          <p className="text-xl font-bold text-white mt-1">{value}</p>
        </div>
        <Icon className="w-6 h-6 opacity-60" />
      </div>
    </div>
  )
}

export default PayrollPanel
