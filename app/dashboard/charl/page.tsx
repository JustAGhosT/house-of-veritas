"use client"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import {
  ClipboardList,
  Clock,
  Package,
  Car,
  CheckCircle,
  Circle,
  AlertCircle,
  Play,
  Pause,
  ChevronRight,
  Wrench,
  Zap,
  Droplets,
  Settings,
  TrendingUp,
} from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart,
} from "recharts"

// Task data for Charl
const weeklyTaskData = [
  { day: "Mon", completed: 6, assigned: 8 },
  { day: "Tue", completed: 7, assigned: 7 },
  { day: "Wed", completed: 5, assigned: 6 },
  { day: "Thu", completed: 8, assigned: 8 },
  { day: "Fri", completed: 4, assigned: 7 },
  { day: "Sat", completed: 2, assigned: 3 },
  { day: "Sun", completed: 0, assigned: 0 },
]

const skillsData = [
  { name: "Electrical", value: 35, color: "#f59e0b" },
  { name: "Plumbing", value: 25, color: "#3b82f6" },
  { name: "Mechanical", value: 25, color: "#10b981" },
  { name: "General", value: 15, color: "#8b5cf6" },
]

const hoursData = [
  { week: "W1", hours: 42 },
  { week: "W2", hours: 38 },
  { week: "W3", hours: 45 },
  { week: "W4", hours: 40 },
]

// Task Item Component
function TaskItem({
  title,
  project,
  priority,
  dueDate,
  status,
  icon: Icon,
}: {
  title: string
  project: string
  priority: "high" | "medium" | "low"
  dueDate: string
  status: "not_started" | "in_progress" | "completed"
  icon?: any
}) {
  const priorityColors = {
    high: "bg-red-500/20 text-red-400",
    medium: "bg-amber-500/20 text-amber-400",
    low: "bg-green-500/20 text-green-400",
  }

  const statusIcons = {
    not_started: <Circle className="w-5 h-5 text-white/40" />,
    in_progress: <AlertCircle className="w-5 h-5 text-amber-400" />,
    completed: <CheckCircle className="w-5 h-5 text-green-400" />,
  }

  return (
    <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer group" data-testid={`task-${title.toLowerCase().replace(/\s+/g, '-')}`}>
      <button className="shrink-0">
        {statusIcons[status]}
      </button>
      {Icon && (
        <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
          <Icon className="w-4 h-4 text-amber-400" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className={`font-medium ${status === "completed" ? "text-white/50 line-through" : "text-white"}`}>
          {title}
        </p>
        <p className="text-white/50 text-sm">{project}</p>
      </div>
      <div className={`px-2 py-1 rounded-full text-xs font-medium ${priorityColors[priority]}`}>
        {priority}
      </div>
      <p className="text-white/40 text-sm hidden sm:block">{dueDate}</p>
      <ChevronRight className="w-4 h-4 text-white/40 group-hover:text-white/60 transition-colors" />
    </div>
  )
}

// Asset Card Component
function AssetCard({
  name,
  id,
  status,
  location,
}: {
  name: string
  id: string
  status: "available" | "checked_out" | "maintenance"
  location: string
}) {
  const statusColors = {
    available: "bg-green-500",
    checked_out: "bg-amber-500",
    maintenance: "bg-red-500",
  }

  const statusLabels = {
    available: "Available",
    checked_out: "In Use",
    maintenance: "Maintenance",
  }

  return (
    <div className="p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer" data-testid={`asset-${id}`}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-white font-medium">{name}</p>
          <p className="text-white/50 text-sm">{id}</p>
        </div>
        <div className={`w-3 h-3 rounded-full ${statusColors[status]}`} />
      </div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-white/50">{location}</span>
        <span className="text-white/60">{statusLabels[status]}</span>
      </div>
    </div>
  )
}

// Custom tooltip for charts
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#1a1a24] border border-white/10 rounded-lg p-3 shadow-xl">
        <p className="text-white font-medium mb-1">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    )
  }
  return null
}

export default function CharlDashboard() {
  const [isClockRunning, setIsClockRunning] = useState(true)
  const [clockTime, setClockTime] = useState("06:42:15")
  const [stats, setStats] = useState<any>(null)

  useEffect(() => {
    fetch("/api/stats")
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch(console.error)
  }, [])

  // Simulate clock
  useEffect(() => {
    if (!isClockRunning) return
    const interval = setInterval(() => {
      setClockTime((prev) => {
        const [h, m, s] = prev.split(":").map(Number)
        let newS = s + 1
        let newM = m
        let newH = h
        if (newS >= 60) { newS = 0; newM++ }
        if (newM >= 60) { newM = 0; newH++ }
        return `${String(newH).padStart(2, "0")}:${String(newM).padStart(2, "0")}:${String(newS).padStart(2, "0")}`
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [isClockRunning])

  return (
    <DashboardLayout persona="charl">
      {/* Time Clock Banner */}
      <div className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-amber-600/20 to-amber-800/20 border border-amber-500/30" data-testid="time-clock-banner">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-amber-500/20 flex items-center justify-center">
              <Clock className="w-8 h-8 text-amber-400" />
            </div>
            <div>
              <p className="text-white/60 text-sm">Today's Work Time</p>
              <p className="text-4xl font-bold text-white font-mono" data-testid="clock-time">{clockTime}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right mr-4 hidden md:block">
              <p className="text-white/60 text-sm">Clocked in at</p>
              <p className="text-white font-medium">07:15 AM</p>
            </div>
            <button
              onClick={() => setIsClockRunning(!isClockRunning)}
              data-testid="clock-toggle"
              className={`
                flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-colors
                ${isClockRunning
                  ? "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                  : "bg-green-500/20 text-green-400 hover:bg-green-500/30"
                }
              `}
            >
              {isClockRunning ? (
                <>
                  <Pause className="w-5 h-5" />
                  Clock Out
                </>
              ) : (
                <>
                  <Play className="w-5 h-5" />
                  Clock In
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Specialty Tags */}
      <div className="mb-6 flex flex-wrap gap-2">
        <span className="px-3 py-1.5 rounded-full bg-amber-500/20 text-amber-400 text-sm font-medium flex items-center gap-2">
          <Zap className="w-4 h-4" /> Electrician
        </span>
        <span className="px-3 py-1.5 rounded-full bg-blue-500/20 text-blue-400 text-sm font-medium flex items-center gap-2">
          <Droplets className="w-4 h-4" /> Plumber
        </span>
        <span className="px-3 py-1.5 rounded-full bg-green-500/20 text-green-400 text-sm font-medium flex items-center gap-2">
          <Wrench className="w-4 h-4" /> Tinkerer
        </span>
        <span className="px-3 py-1.5 rounded-full bg-purple-500/20 text-purple-400 text-sm font-medium flex items-center gap-2">
          <Settings className="w-4 h-4" /> Magicman
        </span>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="p-4 rounded-xl bg-white/5 border border-white/10" data-testid="stat-tasks">
          <p className="text-white/60 text-sm">Tasks Today</p>
          <p className="text-2xl font-bold text-white">5</p>
          <p className="text-amber-400 text-sm">3 completed</p>
        </div>
        <div className="p-4 rounded-xl bg-white/5 border border-white/10" data-testid="stat-hours">
          <p className="text-white/60 text-sm">Hours This Week</p>
          <p className="text-2xl font-bold text-white">38.5</p>
          <p className="text-green-400 text-sm">On track</p>
        </div>
        <div className="p-4 rounded-xl bg-white/5 border border-white/10" data-testid="stat-assets">
          <p className="text-white/60 text-sm">Assets Checked</p>
          <p className="text-2xl font-bold text-white">2</p>
          <p className="text-white/50 text-sm">Drill, Grinder</p>
        </div>
        <div className="p-4 rounded-xl bg-white/5 border border-white/10" data-testid="stat-leave">
          <p className="text-white/60 text-sm">Leave Balance</p>
          <p className="text-2xl font-bold text-white">15</p>
          <p className="text-white/50 text-sm">days remaining</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        {/* Weekly Task Completion */}
        <div className="bg-[#0d0d12] border border-white/10 rounded-2xl p-6 lg:col-span-2" data-testid="weekly-tasks-chart">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-white font-semibold">Weekly Task Progress</h3>
              <p className="text-white/50 text-sm">Completed vs Assigned</p>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-amber-500" />
                <span className="text-white/60">Completed</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-white/20" />
                <span className="text-white/60">Assigned</span>
              </div>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyTaskData} barGap={8}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                <XAxis dataKey="day" stroke="#ffffff60" fontSize={12} />
                <YAxis stroke="#ffffff60" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="assigned" fill="#ffffff20" radius={[4, 4, 0, 0]} name="Assigned" />
                <Bar dataKey="completed" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Completed" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Skills Distribution */}
        <div className="bg-[#0d0d12] border border-white/10 rounded-2xl p-6" data-testid="skills-chart">
          <h3 className="text-white font-semibold mb-2">Skills Distribution</h3>
          <p className="text-white/50 text-sm mb-4">Task types this month</p>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={skillsData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {skillsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {skillsData.map((skill) => (
              <div key={skill.name} className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: skill.color }} />
                <span className="text-white/60">{skill.name}</span>
                <span className="text-white ml-auto">{skill.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* My Tasks */}
        <div className="bg-[#0d0d12] border border-white/10 rounded-2xl overflow-hidden" data-testid="my-tasks">
          <div className="p-6 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ClipboardList className="w-5 h-5 text-amber-400" />
              <div>
                <h3 className="text-white font-semibold">My Tasks</h3>
                <p className="text-white/50 text-sm">Today's assignments</p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 text-sm">
              5 tasks
            </span>
          </div>
          <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
            <TaskItem
              title="Fix electrical outlet - Kitchen"
              project="Electrical Work"
              priority="high"
              dueDate="Today"
              status="in_progress"
              icon={Zap}
            />
            <TaskItem
              title="Repair leaking pipe - Bathroom"
              project="Plumbing"
              priority="high"
              dueDate="Today"
              status="completed"
              icon={Droplets}
            />
            <TaskItem
              title="Service Toyota Hilux"
              project="Vehicle Maintenance"
              priority="medium"
              dueDate="Today"
              status="in_progress"
              icon={Wrench}
            />
            <TaskItem
              title="Install new light fixtures"
              project="Electrical Work"
              priority="medium"
              dueDate="Tomorrow"
              status="not_started"
              icon={Zap}
            />
            <TaskItem
              title="Workshop equipment inspection"
              project="Safety Check"
              priority="low"
              dueDate="This week"
              status="completed"
              icon={Settings}
            />
          </div>
        </div>

        {/* Assets */}
        <div className="bg-[#0d0d12] border border-white/10 rounded-2xl overflow-hidden" data-testid="workshop-assets">
          <div className="p-6 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Package className="w-5 h-5 text-amber-400" />
              <div>
                <h3 className="text-white font-semibold">Workshop Assets</h3>
                <p className="text-white/50 text-sm">Equipment status</p>
              </div>
            </div>
          </div>
          <div className="p-4 grid grid-cols-2 gap-3">
            <AssetCard
              name="Makita Drill Set"
              id="WS-001"
              status="checked_out"
              location="In Use"
            />
            <AssetCard
              name="Angle Grinder"
              id="WS-002"
              status="checked_out"
              location="In Use"
            />
            <AssetCard
              name="Multimeter"
              id="WS-005"
              status="available"
              location="Workshop"
            />
            <AssetCard
              name="Pipe Wrench Set"
              id="WS-006"
              status="available"
              location="Workshop"
            />
            <AssetCard
              name="Socket Set"
              id="WS-004"
              status="available"
              location="Workshop"
            />
            <AssetCard
              name="Soldering Iron"
              id="WS-007"
              status="maintenance"
              location="Repair"
            />
          </div>
        </div>

        {/* Vehicle Log */}
        <div className="bg-[#0d0d12] border border-white/10 rounded-2xl overflow-hidden lg:col-span-2" data-testid="vehicle-log">
          <div className="p-6 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Car className="w-5 h-5 text-amber-400" />
              <div>
                <h3 className="text-white font-semibold">Vehicle Log</h3>
                <p className="text-white/50 text-sm">Toyota Hilux - Current Trip</p>
              </div>
            </div>
            <button className="px-4 py-2 rounded-xl bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 transition-colors text-sm font-medium" data-testid="end-trip-btn">
              End Trip
            </button>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
              <div>
                <p className="text-white/50 text-sm mb-1">Start Odometer</p>
                <p className="text-xl font-semibold text-white">124,532 km</p>
              </div>
              <div>
                <p className="text-white/50 text-sm mb-1">Trip Start</p>
                <p className="text-xl font-semibold text-white">07:30 AM</p>
              </div>
              <div>
                <p className="text-white/50 text-sm mb-1">Purpose</p>
                <p className="text-xl font-semibold text-white">Supply Run</p>
              </div>
              <div>
                <p className="text-white/50 text-sm mb-1">Pre-Trip Check</p>
                <p className="text-xl font-semibold text-green-400">✓ Completed</p>
              </div>
              <div>
                <p className="text-white/50 text-sm mb-1">Fuel Level</p>
                <p className="text-xl font-semibold text-amber-400">75%</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
