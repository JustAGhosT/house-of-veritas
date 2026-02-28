"use client"

import DashboardLayout from "@/components/dashboard-layout"
import { WidgetErrorBoundary } from "@/components/widget-error-boundary"
import { apiFetchSafe } from "@/lib/api-client"
import {
  AlertTriangle,
  ArrowUpRight,
  Calendar,
  CheckCircle,
  ClipboardList,
  Clock,
  Cpu,
  DollarSign,
  Monitor,
  Network,
  Server,
  Shield,
  TrendingDown,
  TrendingUp,
  Users,
  XCircle
} from "lucide-react"
import { useEffect, useState } from "react"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts"

// Budget data
const budgetData = [
  { month: "Jul", allocated: 45000, spent: 38000 },
  { month: "Aug", allocated: 45000, spent: 42000 },
  { month: "Sep", allocated: 48000, spent: 44000 },
  { month: "Oct", allocated: 48000, spent: 39000 },
  { month: "Nov", allocated: 45000, spent: 41000 },
  { month: "Dec", allocated: 45000, spent: 38250 },
]

// Task completion by employee
const employeeTaskData = [
  { name: "Charl", completed: 28, pending: 8, color: "#f59e0b" },
  { name: "Lucky", completed: 24, pending: 6, color: "#10b981" },
  { name: "Irma", completed: 18, pending: 2, color: "#a855f7" },
]

// Document compliance trend
const complianceData = [
  { month: "Jul", compliance: 85 },
  { month: "Aug", compliance: 88 },
  { month: "Sep", compliance: 92 },
  { month: "Oct", compliance: 95 },
  { month: "Nov", compliance: 98 },
  { month: "Dec", compliance: 100 },
]

// Compute current compliance percentage from the latest data point
const currentCompliancePercentage = complianceData.length > 0
  ? `${complianceData[complianceData.length - 1].compliance}%`
  : "—"

// Task status distribution
const taskStatusData = [
  { name: "Completed", value: 38, color: "#10b981" },
  { name: "In Progress", value: 6, color: "#f59e0b" },
  { name: "Overdue", value: 3, color: "#ef4444" },
]

// Tech/Leadership-themed background pattern
function TechPattern() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Circuit board pattern */}
      <svg className="absolute top-10 right-10 h-64 w-64 text-blue-500/5" viewBox="0 0 100 100">
        <circle cx="20" cy="20" r="5" fill="currentColor" />
        <circle cx="80" cy="20" r="5" fill="currentColor" />
        <circle cx="50" cy="50" r="8" fill="currentColor" />
        <circle cx="20" cy="80" r="5" fill="currentColor" />
        <circle cx="80" cy="80" r="5" fill="currentColor" />
        <path
          d="M20 20 L50 50 L80 20 M20 80 L50 50 L80 80 M50 50 L50 10 M50 50 L50 90"
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
        />
      </svg>
      {/* Network nodes */}
      <svg className="absolute bottom-20 left-10 h-48 w-48 text-blue-500/5" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="15" fill="currentColor" />
        <circle cx="20" cy="30" r="8" fill="currentColor" />
        <circle cx="80" cy="30" r="8" fill="currentColor" />
        <circle cx="20" cy="70" r="8" fill="currentColor" />
        <circle cx="80" cy="70" r="8" fill="currentColor" />
        <line x1="50" y1="50" x2="20" y2="30" stroke="currentColor" strokeWidth="2" />
        <line x1="50" y1="50" x2="80" y2="30" stroke="currentColor" strokeWidth="2" />
        <line x1="50" y1="50" x2="20" y2="70" stroke="currentColor" strokeWidth="2" />
        <line x1="50" y1="50" x2="80" y2="70" stroke="currentColor" strokeWidth="2" />
      </svg>
      {/* Monitor/Screen */}
      <svg className="absolute top-1/3 left-1/5 h-40 w-40 text-blue-500/5" viewBox="0 0 100 100">
        <rect x="10" y="15" width="80" height="55" rx="3" fill="currentColor" />
        <rect x="40" y="70" width="20" height="10" fill="currentColor" />
        <rect x="30" y="80" width="40" height="5" rx="2" fill="currentColor" />
      </svg>
      {/* Chip/CPU */}
      <svg
        className="absolute right-1/5 bottom-1/3 h-36 w-36 text-blue-500/5"
        viewBox="0 0 100 100"
      >
        <rect x="25" y="25" width="50" height="50" rx="5" fill="currentColor" />
        {[30, 40, 50, 60, 70].map((pos) => (
          <g key={pos}>
            <rect x={pos - 2} y="15" width="4" height="10" fill="currentColor" />
            <rect x={pos - 2} y="75" width="4" height="10" fill="currentColor" />
            <rect x="15" y={pos - 2} width="10" height="4" fill="currentColor" />
            <rect x="75" y={pos - 2} width="10" height="4" fill="currentColor" />
          </g>
        ))}
      </svg>
      {/* Tech grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />
    </div>
  )
}

// Custom tooltip for charts
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-blue-500/20 bg-blue-950 p-3 shadow-xl">
        <p className="mb-1 font-medium text-blue-100">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}:{" "}
            {typeof entry.value === "number" && entry.name !== "compliance"
              ? entry.name.includes("allocated") ||
                entry.name.includes("spent") ||
                entry.dataKey === "allocated" ||
                entry.dataKey === "spent"
                ? `R${entry.value.toLocaleString()}`
                : entry.value
              : `${entry.value}%`}
          </p>
        ))}
      </div>
    )
  }
  return null
}

// Stat Card Component
function StatCard({
  title,
  value,
  change,
  changeType,
  icon: Icon,
  color,
}: {
  title: string
  value: string | number
  change?: string
  changeType?: "up" | "down" | "neutral"
  icon: any
  color: string
}) {
  const colorClasses = {
    blue: "from-blue-600/30 to-blue-600/10 border-blue-500/30",
    green: "from-green-600/30 to-green-600/10 border-green-500/30",
    amber: "from-amber-600/30 to-amber-600/10 border-amber-500/30",
    red: "from-red-600/30 to-red-600/10 border-red-500/30",
    purple: "from-purple-600/30 to-purple-600/10 border-purple-500/30",
  }

  const iconColors = {
    blue: "text-blue-400",
    green: "text-green-400",
    amber: "text-amber-400",
    red: "text-red-400",
    purple: "text-purple-400",
  }

  return (
    <div
      className={`rounded-2xl bg-linear-to-br p-6 ${colorClasses[color as keyof typeof colorClasses]} border backdrop-blur-sm`}
      data-testid={`stat-card-${title.toLowerCase().replace(/\s+/g, "-")}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="mb-1 text-sm text-blue-200/60">{title}</p>
          <p className="text-3xl font-bold text-blue-100">{value}</p>
          {change && (
            <div className="mt-2 flex items-center gap-1">
              {changeType === "up" && <TrendingUp className="h-4 w-4 text-green-400" />}
              {changeType === "down" && <TrendingDown className="h-4 w-4 text-red-400" />}
              <span
                className={`text-sm ${changeType === "up" ? "text-green-400" : changeType === "down" ? "text-red-400" : "text-blue-200/60"}`}
              >
                {change}
              </span>
            </div>
          )}
        </div>
        <div
          className={`rounded-xl border border-blue-500/20 bg-blue-950/50 p-3 ${iconColors[color as keyof typeof iconColors]}`}
        >
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  )
}

// Pending Approval Item
function ApprovalItem({
  type,
  title,
  subtitle,
  amount,
  date,
}: {
  type: "expense" | "leave" | "overtime"
  title: string
  subtitle: string
  amount?: string
  date: string
}) {
  const typeColors = {
    expense: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    leave: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    overtime: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  }

  const typeLabels = {
    expense: "Expense",
    leave: "Leave",
    overtime: "Overtime",
  }

  return (
    <div className="flex cursor-pointer items-center gap-4 rounded-xl border border-blue-500/10 bg-blue-950/50 p-4 transition-colors hover:border-blue-500/20 hover:bg-blue-950/70">
      <div className={`rounded-full border px-3 py-1 text-xs font-medium ${typeColors[type]}`}>
        {typeLabels[type]}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-blue-100">{title}</p>
        <p className="truncate text-sm text-blue-200/50">{subtitle}</p>
      </div>
      {amount && <p className="font-semibold text-blue-100">{amount}</p>}
      <p className="hidden text-sm text-blue-200/40 sm:block">{date}</p>
      <div className="flex gap-2">
        <button
          className="rounded-lg border border-green-500/30 bg-green-500/20 p-2 text-green-400 transition-colors hover:bg-green-500/30"
          data-testid="approve-btn"
          aria-label="Approve expense"
        >
          <CheckCircle className="h-4 w-4" />
        </button>
        <button
          className="rounded-lg border border-red-500/30 bg-red-500/20 p-2 text-red-400 transition-colors hover:bg-red-500/30"
          data-testid="reject-btn"
          aria-label="Reject expense"
        >
          <XCircle className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

// Document Expiry Item
function ExpiryItem({
  name,
  daysLeft,
  responsible,
}: {
  name: string
  daysLeft: number
  responsible: string
}) {
  const urgency = daysLeft <= 7 ? "urgent" : daysLeft <= 30 ? "warning" : "notice"
  const urgencyColors = {
    urgent: "bg-red-500/20 text-red-400 border-red-500/30",
    warning: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    notice: "bg-green-500/20 text-green-400 border-green-500/30",
  }

  return (
    <div className="flex items-center gap-4 rounded-xl border border-blue-500/10 bg-blue-950/50 p-4">
      <div
        className={`rounded-full border px-3 py-1 text-xs font-medium ${urgencyColors[urgency]}`}
      >
        {daysLeft}d
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-blue-100">{name}</p>
        <p className="text-sm text-blue-200/50">{responsible}</p>
      </div>
      <button className="text-sm font-medium text-blue-400 hover:text-blue-300">Review</button>
    </div>
  )
}

// Recent Activity Item
function ActivityItem({
  action,
  user,
  time,
  icon: Icon,
}: {
  action: string
  user: string
  time: string
  icon: any
}) {
  return (
    <div className="flex items-start gap-4 py-3">
      <div className="rounded-lg border border-blue-500/20 bg-blue-950/50 p-2 text-blue-400">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm text-blue-100">{action}</p>
        <p className="mt-1 text-xs text-blue-200/50">
          by {user} · {time}
        </p>
      </div>
    </div>
  )
}

export default function HansDashboard() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiFetchSafe<any>("/api/stats", null, { label: "Stats" })
      .then((data) => {
        setStats(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <DashboardLayout persona="hans">
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500/30 border-t-blue-500" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout persona="hans">
      {/* Persona-specific background */}
      <div className="fixed inset-0 -z-10 bg-linear-to-br from-blue-950/40 via-[#0a0a0f] to-cyan-950/30" />
      <TechPattern />

      {/* Specialty Tags */}
      <div className="mb-6 flex flex-wrap gap-2">
        <span className="flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/20 px-3 py-1.5 text-sm font-medium text-blue-400">
          <Monitor className="h-4 w-4" /> Tech Lead
        </span>
        <span className="flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/20 px-3 py-1.5 text-sm font-medium text-cyan-400">
          <Cpu className="h-4 w-4" /> Electronics
        </span>
        <span className="flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/20 px-3 py-1.5 text-sm font-medium text-purple-400">
          <Shield className="h-4 w-4" /> Administrator
        </span>
        <span className="flex items-center gap-2 rounded-full border border-green-500/30 bg-green-500/20 px-3 py-1.5 text-sm font-medium text-green-400">
          <Network className="h-4 w-4" /> Leadership
        </span>
      </div>

      {/* Stats Grid */}
      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <WidgetErrorBoundary>
          <StatCard
            title="Active Tasks"
            value={stats?.tasks?.total || 0}
            change={`${stats?.tasks?.completed || 0} completed`}
            changeType="up"
            icon={ClipboardList}
            color="blue"
          />
        </WidgetErrorBoundary>
        <WidgetErrorBoundary>
          <StatCard
            title="Active Employees"
            value={stats?.users?.total || 4}
            icon={Users}
            color="green"
          />
        </WidgetErrorBoundary>
        <WidgetErrorBoundary>
          <StatCard
            title="Pending Approvals"
            value={stats?.expenses?.pending || 0}
            change={stats?.tasks?.overdue ? `${stats.tasks.overdue} overdue` : undefined}
            changeType={stats?.tasks?.overdue > 0 ? "down" : "neutral"}
            icon={AlertTriangle}
            color="amber"
          />
        </WidgetErrorBoundary>
        <WidgetErrorBoundary>
          <StatCard
            title="Monthly Expenses"
            value={`R${(stats?.expenses?.thisMonth || 0).toLocaleString()}`}
            change={`${stats?.budget?.percentage || 0}% of budget`}
            changeType="neutral"
            icon={DollarSign}
            color="purple"
          />
        </WidgetErrorBoundary>
      </div>

      {/* Charts Row */}
      <div className="mb-8 grid gap-6 lg:grid-cols-3">
        {/* Budget Overview */}
        <WidgetErrorBoundary className="lg:col-span-2">
          <div
            className="rounded-2xl border border-blue-500/20 bg-blue-950/40 p-6 backdrop-blur-sm"
            data-testid="budget-chart"
          >
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-blue-100">Budget Overview</h3>
                <p className="text-sm text-blue-200/50">6-month spending trend</p>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-blue-500" />
                  <span className="text-blue-200/60">Allocated</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-green-500" />
                  <span className="text-blue-200/60">Spent</span>
                </div>
              </div>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={budgetData} barGap={8}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(59,130,246,0.1)" />
                  <XAxis dataKey="month" stroke="rgba(59,130,246,0.6)" fontSize={12} />
                  <YAxis
                    stroke="rgba(59,130,246,0.6)"
                    fontSize={12}
                    tickFormatter={(v) => `R${(v / 1000).toFixed(0)}k`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="allocated" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Allocated" />
                  <Bar dataKey="spent" fill="#10b981" radius={[4, 4, 0, 0]} name="Spent" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </WidgetErrorBoundary>

        {/* Task Status */}
        <WidgetErrorBoundary>
          <div
            className="rounded-2xl border border-blue-500/20 bg-blue-950/40 p-6 backdrop-blur-sm"
            data-testid="task-status-chart"
          >
            <h3 className="mb-2 font-semibold text-blue-100">Task Status</h3>
            <p className="mb-4 text-sm text-blue-200/50">Current overview</p>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={taskStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {taskStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-2">
              {taskStatusData.map((status) => (
                <div key={status.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: status.color }} />
                    <span className="text-blue-200/60">{status.name}</span>
                  </div>
                  <span className="font-medium text-blue-100">{status.value}</span>
                </div>
              ))}
            </div>
          </div>
        </WidgetErrorBoundary>
      </div>

      {/* Employee Performance & Compliance */}
      <div className="mb-8 grid gap-6 lg:grid-cols-2">
        {/* Employee Task Performance */}
        <WidgetErrorBoundary>
          <div
            className="rounded-2xl border border-blue-500/20 bg-blue-950/40 p-6 backdrop-blur-sm"
            data-testid="employee-performance-chart"
          >
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-blue-100">Employee Performance</h3>
                <p className="text-sm text-blue-200/50">Tasks completed this month</p>
              </div>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={employeeTaskData} layout="vertical" barGap={4}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(59,130,246,0.1)"
                    horizontal={false}
                  />
                  <XAxis type="number" stroke="rgba(59,130,246,0.6)" fontSize={12} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    stroke="rgba(59,130,246,0.6)"
                    fontSize={12}
                    width={60}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="completed" fill="#10b981" radius={[0, 4, 4, 0]} name="Completed" />
                  <Bar dataKey="pending" fill="#f59e0b" radius={[0, 4, 4, 0]} name="Pending" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </WidgetErrorBoundary>

        {/* Compliance Trend */}
        <WidgetErrorBoundary>
          <div
            className="rounded-2xl border border-blue-500/20 bg-blue-950/40 p-6 backdrop-blur-sm"
            data-testid="compliance-chart"
          >
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-blue-100">Document Compliance</h3>
                <p className="text-sm text-blue-200/50">6-month trend</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-green-400">{currentCompliancePercentage}</p>
                <p className="text-sm text-blue-200/50">Current</p>
              </div>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={complianceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(59,130,246,0.1)" />
                  <XAxis dataKey="month" stroke="rgba(59,130,246,0.6)" fontSize={12} />
                  <YAxis
                    stroke="rgba(59,130,246,0.6)"
                    fontSize={12}
                    domain={[80, 100]}
                    tickFormatter={(v) => `${v}%`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="compliance"
                    stroke="#3b82f6"
                    fill="rgba(59,130,246,0.2)"
                    strokeWidth={2}
                    name="Compliance"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </WidgetErrorBoundary>
      </div>

      {/* Three Column Layout */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Pending Approvals - 2 columns */}
        <WidgetErrorBoundary className="lg:col-span-2">
          <div
            className="overflow-hidden rounded-2xl border border-blue-500/20 bg-blue-950/40 backdrop-blur-sm"
            data-testid="pending-approvals"
          >
            <div className="flex items-center justify-between border-b border-blue-500/20 p-6">
              <div>
                <h3 className="text-lg font-semibold text-blue-100">Pending Approvals</h3>
                <p className="text-sm text-blue-200/50">Items requiring your action</p>
              </div>
              <span className="rounded-full border border-amber-500/30 bg-amber-500/20 px-3 py-1 text-sm font-medium text-amber-400">
                {stats?.expenses?.pending || 5} pending
              </span>
            </div>
            <div className="max-h-96 space-y-3 overflow-y-auto p-4">
              <ApprovalItem
                type="expense"
                title="Workshop Materials"
                subtitle="Charl Pieterse"
                amount="R850"
                date="Today"
              />
              <ApprovalItem
                type="overtime"
                title="Weekend Work"
                subtitle="Lucky Mokoena - 4.5 hours"
                amount="R540"
                date="Yesterday"
              />
              <ApprovalItem
                type="leave"
                title="Annual Leave - 3 days"
                subtitle="Charl Pieterse - Dec 20-22"
                date="2 days ago"
              />
              <ApprovalItem
                type="expense"
                title="Garden Supplies"
                subtitle="Lucky Mokoena"
                amount="R320"
                date="3 days ago"
              />
              <ApprovalItem
                type="expense"
                title="Vehicle Fuel"
                subtitle="Charl Pieterse"
                amount="R450"
                date="3 days ago"
              />
            </div>
            <div className="border-t border-blue-500/20 p-4">
              <button className="flex w-full items-center justify-center gap-2 text-center text-sm font-medium text-blue-400 hover:text-blue-300">
                View all pending items
                <ArrowUpRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </WidgetErrorBoundary>

        {/* Sidebar - 1 column */}
        <div className="space-y-6">
          {/* Document Expiry Alerts */}
          <WidgetErrorBoundary>
            <div
              className="overflow-hidden rounded-2xl border border-blue-500/20 bg-blue-950/40 backdrop-blur-sm"
              data-testid="document-expiry"
            >
              <div className="flex items-center justify-between border-b border-blue-500/20 p-6">
                <div>
                  <h3 className="font-semibold text-blue-100">Expiring Documents</h3>
                  <p className="text-sm text-blue-200/50">Requiring review</p>
                </div>
                <AlertTriangle className="h-5 w-5 text-amber-400" />
              </div>
              <div className="space-y-3 p-4">
                <ExpiryItem name="Emergency Contact List" daysLeft={7} responsible="All" />
                <ExpiryItem name="Expense Policy" daysLeft={23} responsible="Hans" />
                <ExpiryItem name="Leave Policy" daysLeft={45} responsible="HR" />
              </div>
            </div>
          </WidgetErrorBoundary>

          {/* Recent Activity */}
          <WidgetErrorBoundary>
            <div
              className="overflow-hidden rounded-2xl border border-blue-500/20 bg-blue-950/40 backdrop-blur-sm"
              data-testid="recent-activity"
            >
              <div className="border-b border-blue-500/20 p-6">
                <h3 className="font-semibold text-blue-100">Recent Activity</h3>
              </div>
              <div className="divide-y divide-blue-500/10 p-4">
                <ActivityItem
                  action="Completed workshop cleanup task"
                  user="Charl"
                  time="30 min ago"
                  icon={CheckCircle}
                />
                <ActivityItem
                  action="Submitted fuel expense"
                  user="Lucky"
                  time="1 hour ago"
                  icon={DollarSign}
                />
                <ActivityItem
                  action="Clocked in for shift"
                  user="Charl"
                  time="3 hours ago"
                  icon={Clock}
                />
                <ActivityItem
                  action="Updated vehicle mileage"
                  user="Lucky"
                  time="5 hours ago"
                  icon={Calendar}
                />
              </div>
            </div>
          </WidgetErrorBoundary>

          {/* System Status */}
          <WidgetErrorBoundary>
            <div
              className="rounded-2xl border border-blue-500/20 bg-blue-950/40 p-6 backdrop-blur-sm"
              data-testid="system-status"
            >
              <div className="mb-4 flex items-center gap-3">
                <Server className="h-5 w-5 text-blue-400" />
                <h3 className="font-semibold text-blue-100">System Status</h3>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-blue-200/60">Uptime</span>
                  <span className="text-sm font-medium text-green-400">99.9%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-blue-200/60">Documents Signed</span>
                  <span className="text-sm font-medium text-blue-100">18/18</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-blue-200/60">Last Backup</span>
                  <span className="text-sm font-medium text-blue-100">2 hours ago</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-blue-200/60">API Status</span>
                  <span className="flex items-center gap-1 text-sm font-medium text-green-400">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-green-400" />
                    Online
                  </span>
                </div>
              </div>
            </div>
          </WidgetErrorBoundary>
        </div>
      </div>
    </DashboardLayout>
  )
}
