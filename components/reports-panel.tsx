"use client"

import { useState, useEffect, useCallback } from 'react'
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
} from 'lucide-react'
import { generatePDFReport } from '@/lib/utils/pdf-generator'
import { logger } from '@/lib/logger'
import { apiFetch } from '@/lib/api-client'

type ReportType = 'expenses' | 'tasks' | 'time' | 'all'

interface ReportData {
  reportType: string
  generatedAt: string
  data: any
}

export function ReportsPanel() {
  const [reportType, setReportType] = useState<ReportType>('expenses')
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(false)
  const [dateRange, setDateRange] = useState({ start: '', end: '' })

  const fetchReport = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ type: reportType })
      if (dateRange.start) params.append('startDate', dateRange.start)
      if (dateRange.end) params.append('endDate', dateRange.end)

      const data = await apiFetch<ReportData>(`/api/reports?${params}`, { label: 'Reports' })
      setReportData(data)
    } catch (error) {
      logger.error('Failed to fetch report', { error: error instanceof Error ? error.message : String(error) })
    } finally {
      setLoading(false)
    }
  }, [reportType, dateRange])

  const downloadCSV = async () => {
    const params = new URLSearchParams({ type: reportType, format: 'csv' })
    if (dateRange.start) params.append('startDate', dateRange.start)
    if (dateRange.end) params.append('endDate', dateRange.end)

    const response = await fetch(`/api/reports?${params}`)
    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${reportType}-report-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  const downloadPDF = () => {
    if (!reportData?.data) return
    
    const reportTitles: Record<string, string> = {
      expenses: 'Expense Report',
      tasks: 'Task Report',
      time: 'Time & Attendance Report',
      all: 'Comprehensive Report',
    }

    generatePDFReport({
      title: reportTitles[reportType] || 'Report',
      subtitle: 'House of Veritas - Estate Management',
      generatedAt: new Date(),
      data: reportData.data,
      type: reportType as any,
    })
  }

  useEffect(() => {
    fetchReport()
  }, [fetchReport])

  const reportTypes = [
    { id: 'expenses', label: 'Expenses', icon: DollarSign, color: 'text-purple-400' },
    { id: 'tasks', label: 'Tasks', icon: ClipboardList, color: 'text-blue-400' },
    { id: 'time', label: 'Time Log', icon: Clock, color: 'text-green-400' },
    { id: 'all', label: 'All Reports', icon: BarChart3, color: 'text-amber-400' },
  ]

  return (
    <div className="space-y-6">
      {/* Report Type Selector */}
      <div className="flex flex-wrap gap-3">
        {reportTypes.map((type) => (
          <button
            key={type.id}
            onClick={() => setReportType(type.id as ReportType)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
              reportType === type.id
                ? 'bg-blue-600 text-white'
                : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
            }`}
          >
            <type.icon className={`w-4 h-4 ${reportType === type.id ? 'text-white' : type.color}`} />
            {type.label}
          </button>
        ))}
      </div>

      {/* Filters & Actions */}
      <div className="flex flex-wrap items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-white/40" />
          <input
            type="date"
            value={dateRange.start}
            onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
            className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
          />
          <span className="text-white/40">to</span>
          <input
            type="date"
            value={dateRange.end}
            onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
            className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
          />
        </div>
        
        <button
          onClick={fetchReport}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Filter className="w-4 h-4" />}
          Generate
        </button>
        
        <button
          onClick={downloadCSV}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>

        <button
          onClick={downloadPDF}
          disabled={!reportData}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50 transition-colors"
        >
          <FileDown className="w-4 h-4" />
          Export PDF
        </button>
      </div>

      {/* Report Content */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
      ) : reportData ? (
        <div className="space-y-6">
          {/* Summary Cards */}
          {reportType === 'expenses' && reportData.data?.summary && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <SummaryCard title="Total Expenses" value={`R${reportData.data.summary.total}`} icon={DollarSign} color="purple" />
              <SummaryCard title="Approved" value={`R${reportData.data.summary.approved}`} icon={TrendingUp} color="green" />
              <SummaryCard title="Pending" value={`R${reportData.data.summary.pending}`} icon={Clock} color="amber" />
              <SummaryCard title="Count" value={reportData.data.summary.count} icon={FileText} color="blue" />
            </div>
          )}

          {reportType === 'tasks' && reportData.data?.summary && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <SummaryCard title="Total Tasks" value={reportData.data.summary.total} icon={ClipboardList} color="blue" />
              <SummaryCard title="Completed" value={reportData.data.summary.completed} icon={TrendingUp} color="green" />
              <SummaryCard title="In Progress" value={reportData.data.summary.inProgress} icon={Clock} color="amber" />
              <SummaryCard title="Pending" value={reportData.data.summary.pending} icon={FileText} color="purple" />
            </div>
          )}

          {reportType === 'time' && reportData.data?.summary && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <SummaryCard title="Total Hours" value={`${reportData.data.summary.totalHours}h`} icon={Clock} color="blue" />
              <SummaryCard title="Overtime" value={`${reportData.data.summary.totalOvertime}h`} icon={TrendingUp} color="amber" />
              <SummaryCard title="Regular" value={`${reportData.data.summary.regularHours}h`} icon={FileText} color="green" />
              <SummaryCard title="Days Worked" value={reportData.data.summary.daysWorked} icon={Calendar} color="purple" />
            </div>
          )}

          {/* Data Table */}
          <div className="rounded-xl bg-white/5 border border-white/10 overflow-hidden">
            <div className="p-4 border-b border-white/10">
              <h3 className="text-white font-semibold">Detailed Report</h3>
              <p className="text-white/50 text-sm">Generated: {new Date(reportData.generatedAt).toLocaleString()}</p>
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
    <div className={`p-4 rounded-xl bg-linear-to-br ${colors[color]} border`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white/60 text-sm">{title}</p>
          <p className="text-2xl font-bold text-white mt-1">{value}</p>
        </div>
        <Icon className="w-8 h-8 opacity-60" />
      </div>
    </div>
  )
}

function ReportTable({ type, data }: { type: ReportType; data: any }) {
  if (type === 'expenses' && data?.expenses) {
    return (
      <table className="w-full text-sm">
        <thead>
          <tr className="text-white/60 border-b border-white/10">
            <th className="text-left p-4">Date</th>
            <th className="text-left p-4">Category</th>
            <th className="text-right p-4">Amount</th>
            <th className="text-left p-4">Status</th>
            <th className="text-left p-4">Submitted By</th>
          </tr>
        </thead>
        <tbody>
          {data.expenses.map((expense: any) => (
            <tr key={expense.id} className="border-b border-white/5 hover:bg-white/5">
              <td className="p-4 text-white">{expense.date}</td>
              <td className="p-4 text-white">{expense.category}</td>
              <td className="p-4 text-white text-right">R{expense.amount}</td>
              <td className="p-4">
                <span className={`px-2 py-1 rounded-full text-xs ${
                  expense.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                  expense.status === 'pending' ? 'bg-amber-500/20 text-amber-400' :
                  'bg-red-500/20 text-red-400'
                }`}>
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

  if (type === 'tasks' && data?.tasks) {
    return (
      <table className="w-full text-sm">
        <thead>
          <tr className="text-white/60 border-b border-white/10">
            <th className="text-left p-4">Task</th>
            <th className="text-left p-4">Assignee</th>
            <th className="text-left p-4">Status</th>
            <th className="text-left p-4">Priority</th>
            <th className="text-left p-4">Completed</th>
          </tr>
        </thead>
        <tbody>
          {data.tasks.map((task: any) => (
            <tr key={task.id} className="border-b border-white/5 hover:bg-white/5">
              <td className="p-4 text-white">{task.title}</td>
              <td className="p-4 text-white/70">{task.assignee}</td>
              <td className="p-4">
                <span className={`px-2 py-1 rounded-full text-xs ${
                  task.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                  task.status === 'in_progress' ? 'bg-blue-500/20 text-blue-400' :
                  'bg-amber-500/20 text-amber-400'
                }`}>
                  {task.status}
                </span>
              </td>
              <td className="p-4">
                <span className={`px-2 py-1 rounded-full text-xs ${
                  task.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                  task.priority === 'medium' ? 'bg-amber-500/20 text-amber-400' :
                  'bg-green-500/20 text-green-400'
                }`}>
                  {task.priority}
                </span>
              </td>
              <td className="p-4 text-white/70">{task.completedDate || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    )
  }

  if (type === 'time' && data?.entries) {
    return (
      <table className="w-full text-sm">
        <thead>
          <tr className="text-white/60 border-b border-white/10">
            <th className="text-left p-4">Date</th>
            <th className="text-left p-4">User</th>
            <th className="text-left p-4">Clock In</th>
            <th className="text-left p-4">Clock Out</th>
            <th className="text-right p-4">Hours</th>
            <th className="text-right p-4">Overtime</th>
          </tr>
        </thead>
        <tbody>
          {data.entries.map((entry: any) => (
            <tr key={entry.id} className="border-b border-white/5 hover:bg-white/5">
              <td className="p-4 text-white">{entry.date}</td>
              <td className="p-4 text-white/70">{entry.user}</td>
              <td className="p-4 text-green-400">{entry.clockIn}</td>
              <td className="p-4 text-amber-400">{entry.clockOut}</td>
              <td className="p-4 text-white text-right">{entry.hours}h</td>
              <td className="p-4 text-right">
                {entry.overtime > 0 && (
                  <span className="text-amber-400">+{entry.overtime}h</span>
                )}
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
