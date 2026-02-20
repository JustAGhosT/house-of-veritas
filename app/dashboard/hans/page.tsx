"use client"

import { useEffect, useState } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import {
  FileText,
  Users,
  Package,
  ClipboardList,
  Clock,
  DollarSign,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  XCircle,
  ArrowUpRight,
  Calendar,
} from "lucide-react"

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
    blue: "from-blue-600/20 to-blue-600/5 border-blue-500/30",
    green: "from-green-600/20 to-green-600/5 border-green-500/30",
    amber: "from-amber-600/20 to-amber-600/5 border-amber-500/30",
    red: "from-red-600/20 to-red-600/5 border-red-500/30",
    purple: "from-purple-600/20 to-purple-600/5 border-purple-500/30",
  }

  const iconColors = {
    blue: "text-blue-400",
    green: "text-green-400",
    amber: "text-amber-400",
    red: "text-red-400",
    purple: "text-purple-400",
  }

  return (
    <div className={`p-6 rounded-2xl bg-gradient-to-br ${colorClasses[color as keyof typeof colorClasses]} border backdrop-blur-sm`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-white/60 text-sm mb-1">{title}</p>
          <p className="text-3xl font-bold text-white">{value}</p>
          {change && (
            <div className="flex items-center gap-1 mt-2">
              {changeType === "up" && <TrendingUp className="w-4 h-4 text-green-400" />}
              {changeType === "down" && <TrendingDown className="w-4 h-4 text-red-400" />}
              <span className={`text-sm ${changeType === "up" ? "text-green-400" : changeType === "down" ? "text-red-400" : "text-white/60"}`}>
                {change}
              </span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-xl bg-white/5 ${iconColors[color as keyof typeof iconColors]}`}>
          <Icon className="w-6 h-6" />
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
    expense: "bg-amber-500/20 text-amber-400",
    leave: "bg-purple-500/20 text-purple-400",
    overtime: "bg-blue-500/20 text-blue-400",
  }

  const typeLabels = {
    expense: "Expense",
    leave: "Leave",
    overtime: "Overtime",
  }

  return (
    <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer">
      <div className={`px-3 py-1 rounded-full text-xs font-medium ${typeColors[type]}`}>
        {typeLabels[type]}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-white font-medium truncate">{title}</p>
        <p className="text-white/50 text-sm truncate">{subtitle}</p>
      </div>
      {amount && (
        <p className="text-white font-semibold">{amount}</p>
      )}
      <p className="text-white/40 text-sm">{date}</p>
      <div className="flex gap-2">
        <button className="p-2 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors">
          <CheckCircle className="w-4 h-4" />
        </button>
        <button className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors">
          <XCircle className="w-4 h-4" />
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
    <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5">
      <div className={`px-3 py-1 rounded-full text-xs font-medium border ${urgencyColors[urgency]}`}>
        {daysLeft}d
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-white font-medium truncate">{name}</p>
        <p className="text-white/50 text-sm">{responsible}</p>
      </div>
      <button className="text-blue-400 hover:text-blue-300 text-sm font-medium">
        Review
      </button>
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
      <div className="p-2 rounded-lg bg-white/5 text-white/60">
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-white text-sm">{action}</p>
        <p className="text-white/50 text-xs mt-1">by {user} · {time}</p>
      </div>
    </div>
  )
}

export default function HansDashboard() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch dashboard data
    fetch("/api/stats")
      .then((res) => res.json())
      .then((data) => {
        setStats(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <DashboardLayout persona="hans">
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout persona="hans">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Documents Digitized"
          value={stats?.documents?.total || 18}
          change="100% compliant"
          changeType="up"
          icon={FileText}
          color="blue"
        />
        <StatCard
          title="Active Employees"
          value={stats?.users?.total || 4}
          icon={Users}
          color="green"
        />
        <StatCard
          title="Pending Tasks"
          value={12}
          change="+3 this week"
          changeType="up"
          icon={ClipboardList}
          color="amber"
        />
        <StatCard
          title="Monthly Expenses"
          value={`R${(stats?.budget?.spent || 8250).toLocaleString()}`}
          change={`${stats?.budget?.percentage || 85}% of budget`}
          changeType="neutral"
          icon={DollarSign}
          color="purple"
        />
      </div>

      {/* Two Column Layout */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content - 2 columns */}
        <div className="lg:col-span-2 space-y-6">
          {/* Pending Approvals */}
          <div className="bg-[#0d0d12] border border-white/10 rounded-2xl overflow-hidden">
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <div>
                <h3 className="text-white font-semibold text-lg">Pending Approvals</h3>
                <p className="text-white/50 text-sm">Items requiring your action</p>
              </div>
              <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 text-sm font-medium">
                5 pending
              </span>
            </div>
            <div className="p-4 space-y-3">
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
            <div className="p-4 border-t border-white/10">
              <button className="w-full text-center text-blue-400 hover:text-blue-300 text-sm font-medium flex items-center justify-center gap-2">
                View all pending items
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Task Overview */}
          <div className="bg-[#0d0d12] border border-white/10 rounded-2xl overflow-hidden">
            <div className="p-6 border-b border-white/10">
              <h3 className="text-white font-semibold text-lg">Task Overview</h3>
              <p className="text-white/50 text-sm">This week's task distribution</p>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-3 gap-6">
                {/* Charl's Tasks */}
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center text-2xl mb-3">
                    🔧
                  </div>
                  <p className="text-white font-medium">Charl</p>
                  <p className="text-white/50 text-sm">8 tasks</p>
                  <div className="mt-2 h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full" style={{ width: "62%" }} />
                  </div>
                  <p className="text-amber-400 text-xs mt-1">62% complete</p>
                </div>
                {/* Lucky's Tasks */}
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-green-600 to-green-800 flex items-center justify-center text-2xl mb-3">
                    🌿
                  </div>
                  <p className="text-white font-medium">Lucky</p>
                  <p className="text-white/50 text-sm">6 tasks</p>
                  <div className="mt-2 h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 rounded-full" style={{ width: "83%" }} />
                  </div>
                  <p className="text-green-400 text-xs mt-1">83% complete</p>
                </div>
                {/* Irma's Tasks */}
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center text-2xl mb-3">
                    🏠
                  </div>
                  <p className="text-white font-medium">Irma</p>
                  <p className="text-white/50 text-sm">4 tasks</p>
                  <div className="mt-2 h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-500 rounded-full" style={{ width: "100%" }} />
                  </div>
                  <p className="text-purple-400 text-xs mt-1">100% complete</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar - 1 column */}
        <div className="space-y-6">
          {/* Document Expiry Alerts */}
          <div className="bg-[#0d0d12] border border-white/10 rounded-2xl overflow-hidden">
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <div>
                <h3 className="text-white font-semibold">Expiring Documents</h3>
                <p className="text-white/50 text-sm">Requiring review</p>
              </div>
              <AlertTriangle className="w-5 h-5 text-amber-400" />
            </div>
            <div className="p-4 space-y-3">
              <ExpiryItem name="Emergency Contact List" daysLeft={7} responsible="All" />
              <ExpiryItem name="Expense Policy" daysLeft={23} responsible="Hans" />
              <ExpiryItem name="Leave Policy" daysLeft={45} responsible="HR" />
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-[#0d0d12] border border-white/10 rounded-2xl overflow-hidden">
            <div className="p-6 border-b border-white/10">
              <h3 className="text-white font-semibold">Recent Activity</h3>
            </div>
            <div className="p-4 divide-y divide-white/5">
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

          {/* Quick Stats */}
          <div className="bg-[#0d0d12] border border-white/10 rounded-2xl p-6">
            <h3 className="text-white font-semibold mb-4">System Status</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-white/60 text-sm">Uptime</span>
                <span className="text-green-400 text-sm font-medium">99.9%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/60 text-sm">Documents Signed</span>
                <span className="text-white text-sm font-medium">18/18</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/60 text-sm">Last Backup</span>
                <span className="text-white text-sm font-medium">2 hours ago</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
