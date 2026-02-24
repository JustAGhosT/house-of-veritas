"use client"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { logger } from "@/lib/logger"
import { apiFetchSafe } from "@/lib/api-client"
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

// Workshop-themed background pattern
function WorkshopPattern() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Gear/Tool patterns */}
      <svg className="absolute top-10 right-10 h-64 w-64 text-amber-500/5" viewBox="0 0 100 100">
        <path
          d="M50 20 L55 35 L70 35 L58 45 L63 60 L50 50 L37 60 L42 45 L30 35 L45 35 Z"
          fill="currentColor"
        />
      </svg>
      <svg className="absolute bottom-20 left-10 h-48 w-48 text-amber-500/5" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="8" />
        <circle cx="50" cy="50" r="15" fill="currentColor" />
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
          <rect
            key={i}
            x="46"
            y="5"
            width="8"
            height="15"
            fill="currentColor"
            transform={`rotate(${angle} 50 50)`}
          />
        ))}
      </svg>
      <svg className="absolute top-1/3 left-1/4 h-32 w-32 text-amber-500/5" viewBox="0 0 100 100">
        <path d="M20 80 L30 50 L50 50 L60 20 L70 50 L90 50 L80 80 Z" fill="currentColor" />
        <rect x="45" y="50" width="10" height="40" fill="currentColor" />
      </svg>
      {/* Wrench */}
      <svg
        className="absolute right-1/3 bottom-1/4 h-40 w-40 rotate-45 text-amber-500/5"
        viewBox="0 0 100 100"
      >
        <path
          d="M15 30 Q15 15 30 15 L40 15 L35 30 L65 60 L70 55 L40 25 L45 15 L70 15 Q85 15 85 30 Q85 45 70 45 L60 45 L65 30 L35 60 L30 65 L60 95 L55 100 L25 70 L20 75 L25 100 L15 100 L15 70 Q15 55 30 55 L25 45 Q15 45 15 30 Z"
          fill="currentColor"
        />
      </svg>
      {/* Grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(245,158,11,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(245,158,11,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />
    </div>
  )
}

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
    not_started: <Circle className="h-5 w-5 text-white/40" />,
    in_progress: <AlertCircle className="h-5 w-5 text-amber-400" />,
    completed: <CheckCircle className="h-5 w-5 text-green-400" />,
  }

  return (
    <div
      className="group flex cursor-pointer items-center gap-4 rounded-xl border border-amber-500/10 bg-amber-950/30 p-4 transition-colors hover:border-amber-500/20 hover:bg-amber-950/50"
      data-testid={`task-${title.toLowerCase().replace(/\s+/g, "-")}`}
    >
      <button className="shrink-0" aria-label={`Task status: ${status}`}>
        {statusIcons[status]}
      </button>
      {Icon && (
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/20">
          <Icon className="h-4 w-4 text-amber-400" />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p
          className={`font-medium ${status === "completed" ? "text-white/50 line-through" : "text-white"}`}
        >
          {title}
        </p>
        <p className="text-sm text-amber-200/50">{project}</p>
      </div>
      <div className={`rounded-full px-2 py-1 text-xs font-medium ${priorityColors[priority]}`}>
        {priority}
      </div>
      <p className="hidden text-sm text-amber-200/40 sm:block">{dueDate}</p>
      <ChevronRight className="h-4 w-4 text-amber-400/40 transition-colors group-hover:text-amber-400/60" />
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
    <div
      className="cursor-pointer rounded-xl border border-amber-500/10 bg-amber-950/30 p-4 transition-colors hover:border-amber-500/20 hover:bg-amber-950/50"
      data-testid={`asset-${id}`}
    >
      <div className="mb-3 flex items-start justify-between">
        <div>
          <p className="font-medium text-white">{name}</p>
          <p className="text-sm text-amber-200/50">{id}</p>
        </div>
        <div className={`h-3 w-3 rounded-full ${statusColors[status]}`} />
      </div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-amber-200/50">{location}</span>
        <span className="text-amber-200/60">{statusLabels[status]}</span>
      </div>
    </div>
  )
}

// Custom tooltip for charts
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-amber-500/20 bg-amber-950 p-3 shadow-xl">
        <p className="mb-1 font-medium text-amber-100">{label}</p>
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
    apiFetchSafe<any>("/api/stats", null, { label: "Stats" })
      .then((data) => setStats(data))
      .catch((err) =>
        logger.error("Failed to fetch stats", {
          error: err instanceof Error ? err.message : String(err),
        })
      )
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
        if (newS >= 60) {
          newS = 0
          newM++
        }
        if (newM >= 60) {
          newM = 0
          newH++
        }
        return `${String(newH).padStart(2, "0")}:${String(newM).padStart(2, "0")}:${String(newS).padStart(2, "0")}`
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [isClockRunning])

  return (
    <DashboardLayout persona="charl">
      {/* Persona-specific background */}
      <div className="fixed inset-0 -z-10 bg-linear-to-br from-amber-950/40 via-[#0a0a0f] to-orange-950/30" />
      <WorkshopPattern />

      {/* Time Clock Banner */}
      <div
        className="relative mb-8 overflow-hidden rounded-2xl border border-amber-500/30 bg-linear-to-r from-amber-600/30 to-orange-700/20 p-6 backdrop-blur-sm"
        data-testid="time-clock-banner"
      >
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMjAgMTBMMjIgMTVIMjhMMjMgMTlMMjUgMjVMMjAgMjFMMTUgMjVMMTcgMTlMMTIgMTVIMThMMjAgMTBaIiBmaWxsPSJyZ2JhKDI0NSwxNTgsMTEsMC4wNSkiLz48L3N2Zz4=')] opacity-50" />
        <div className="relative flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-xl border border-amber-500/30 bg-linear-to-br from-amber-500/30 to-orange-600/30">
              <Clock className="h-8 w-8 text-amber-400" />
            </div>
            <div>
              <p className="text-sm text-amber-200/60">Today&apos;s Work Time</p>
              <p className="font-mono text-4xl font-bold text-amber-100" data-testid="clock-time">
                {clockTime}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="mr-4 hidden text-right md:block">
              <p className="text-sm text-amber-200/60">Clocked in at</p>
              <p className="font-medium text-amber-100">07:15 AM</p>
            </div>
            <button
              onClick={() => setIsClockRunning(!isClockRunning)}
              data-testid="clock-toggle"
              className={`flex items-center gap-2 rounded-xl border px-6 py-3 font-medium transition-colors ${
                isClockRunning
                  ? "border-red-500/30 bg-red-500/20 text-red-400 hover:bg-red-500/30"
                  : "border-green-500/30 bg-green-500/20 text-green-400 hover:bg-green-500/30"
              } `}
            >
              {isClockRunning ? (
                <>
                  <Pause className="h-5 w-5" />
                  Clock Out
                </>
              ) : (
                <>
                  <Play className="h-5 w-5" />
                  Clock In
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Specialty Tags */}
      <div className="mb-6 flex flex-wrap gap-2">
        <span className="flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/20 px-3 py-1.5 text-sm font-medium text-amber-400">
          <Zap className="h-4 w-4" /> Electrician
        </span>
        <span className="flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/20 px-3 py-1.5 text-sm font-medium text-blue-400">
          <Droplets className="h-4 w-4" /> Plumber
        </span>
        <span className="flex items-center gap-2 rounded-full border border-green-500/30 bg-green-500/20 px-3 py-1.5 text-sm font-medium text-green-400">
          <Wrench className="h-4 w-4" /> Tinkerer
        </span>
        <span className="flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/20 px-3 py-1.5 text-sm font-medium text-purple-400">
          <Settings className="h-4 w-4" /> Magicman
        </span>
      </div>

      {/* Stats Row */}
      <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
        <div
          className="rounded-xl border border-amber-500/20 bg-amber-950/40 p-4 backdrop-blur-sm"
          data-testid="stat-tasks"
        >
          <p className="text-sm text-amber-200/60">Tasks Today</p>
          <p className="text-2xl font-bold text-amber-100">5</p>
          <p className="text-sm text-amber-400">3 completed</p>
        </div>
        <div
          className="rounded-xl border border-amber-500/20 bg-amber-950/40 p-4 backdrop-blur-sm"
          data-testid="stat-hours"
        >
          <p className="text-sm text-amber-200/60">Hours This Week</p>
          <p className="text-2xl font-bold text-amber-100">38.5</p>
          <p className="text-sm text-green-400">On track</p>
        </div>
        <div
          className="rounded-xl border border-amber-500/20 bg-amber-950/40 p-4 backdrop-blur-sm"
          data-testid="stat-assets"
        >
          <p className="text-sm text-amber-200/60">Assets Checked</p>
          <p className="text-2xl font-bold text-amber-100">2</p>
          <p className="text-sm text-amber-200/50">Drill, Grinder</p>
        </div>
        <div
          className="rounded-xl border border-amber-500/20 bg-amber-950/40 p-4 backdrop-blur-sm"
          data-testid="stat-leave"
        >
          <p className="text-sm text-amber-200/60">Leave Balance</p>
          <p className="text-2xl font-bold text-amber-100">15</p>
          <p className="text-sm text-amber-200/50">days remaining</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="mb-8 grid gap-6 lg:grid-cols-3">
        {/* Weekly Task Completion */}
        <div
          className="rounded-2xl border border-amber-500/20 bg-amber-950/40 p-6 backdrop-blur-sm lg:col-span-2"
          data-testid="weekly-tasks-chart"
        >
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-amber-100">Weekly Task Progress</h3>
              <p className="text-sm text-amber-200/50">Completed vs Assigned</p>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-amber-500" />
                <span className="text-amber-200/60">Completed</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-amber-500/30" />
                <span className="text-amber-200/60">Assigned</span>
              </div>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyTaskData} barGap={8}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(245,158,11,0.1)" />
                <XAxis dataKey="day" stroke="rgba(245,158,11,0.6)" fontSize={12} />
                <YAxis stroke="rgba(245,158,11,0.6)" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="assigned"
                  fill="rgba(245,158,11,0.2)"
                  radius={[4, 4, 0, 0]}
                  name="Assigned"
                />
                <Bar dataKey="completed" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Completed" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Skills Distribution */}
        <div
          className="rounded-2xl border border-amber-500/20 bg-amber-950/40 p-6 backdrop-blur-sm"
          data-testid="skills-chart"
        >
          <h3 className="mb-2 font-semibold text-amber-100">Skills Distribution</h3>
          <p className="mb-4 text-sm text-amber-200/50">Task types this month</p>
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
          <div className="mt-4 grid grid-cols-2 gap-2">
            {skillsData.map((skill) => (
              <div key={skill.name} className="flex items-center gap-2 text-sm">
                <div className="h-2 w-2 rounded-full" style={{ backgroundColor: skill.color }} />
                <span className="text-amber-200/60">{skill.name}</span>
                <span className="ml-auto text-amber-100">{skill.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* My Tasks */}
        <div
          className="overflow-hidden rounded-2xl border border-amber-500/20 bg-amber-950/40 backdrop-blur-sm"
          data-testid="my-tasks"
        >
          <div className="flex items-center justify-between border-b border-amber-500/20 p-6">
            <div className="flex items-center gap-3">
              <ClipboardList className="h-5 w-5 text-amber-400" />
              <div>
                <h3 className="font-semibold text-amber-100">My Tasks</h3>
                <p className="text-sm text-amber-200/50">Today&apos;s assignments</p>
              </div>
            </div>
            <span className="rounded-full border border-amber-500/30 bg-amber-500/20 px-3 py-1 text-sm text-amber-400">
              5 tasks
            </span>
          </div>
          <div className="max-h-96 space-y-3 overflow-y-auto p-4">
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
        <div
          className="overflow-hidden rounded-2xl border border-amber-500/20 bg-amber-950/40 backdrop-blur-sm"
          data-testid="workshop-assets"
        >
          <div className="flex items-center justify-between border-b border-amber-500/20 p-6">
            <div className="flex items-center gap-3">
              <Package className="h-5 w-5 text-amber-400" />
              <div>
                <h3 className="font-semibold text-amber-100">Workshop Assets</h3>
                <p className="text-sm text-amber-200/50">Equipment status</p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 p-4">
            <AssetCard name="Makita Drill Set" id="WS-001" status="checked_out" location="In Use" />
            <AssetCard name="Angle Grinder" id="WS-002" status="checked_out" location="In Use" />
            <AssetCard name="Multimeter" id="WS-005" status="available" location="Workshop" />
            <AssetCard name="Pipe Wrench Set" id="WS-006" status="available" location="Workshop" />
            <AssetCard name="Socket Set" id="WS-004" status="available" location="Workshop" />
            <AssetCard name="Soldering Iron" id="WS-007" status="maintenance" location="Repair" />
          </div>
        </div>

        {/* Vehicle Log */}
        <div
          className="overflow-hidden rounded-2xl border border-amber-500/20 bg-amber-950/40 backdrop-blur-sm lg:col-span-2"
          data-testid="vehicle-log"
        >
          <div className="flex items-center justify-between border-b border-amber-500/20 p-6">
            <div className="flex items-center gap-3">
              <Car className="h-5 w-5 text-amber-400" />
              <div>
                <h3 className="font-semibold text-amber-100">Vehicle Log</h3>
                <p className="text-sm text-amber-200/50">Toyota Hilux - Current Trip</p>
              </div>
            </div>
            <button
              className="rounded-xl border border-amber-500/30 bg-amber-500/20 px-4 py-2 text-sm font-medium text-amber-400 transition-colors hover:bg-amber-500/30"
              data-testid="end-trip-btn"
            >
              End Trip
            </button>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 gap-6 md:grid-cols-5">
              <div>
                <p className="mb-1 text-sm text-amber-200/50">Start Odometer</p>
                <p className="text-xl font-semibold text-amber-100">124,532 km</p>
              </div>
              <div>
                <p className="mb-1 text-sm text-amber-200/50">Trip Start</p>
                <p className="text-xl font-semibold text-amber-100">07:30 AM</p>
              </div>
              <div>
                <p className="mb-1 text-sm text-amber-200/50">Purpose</p>
                <p className="text-xl font-semibold text-amber-100">Supply Run</p>
              </div>
              <div>
                <p className="mb-1 text-sm text-amber-200/50">Pre-Trip Check</p>
                <p className="text-xl font-semibold text-green-400">✓ Completed</p>
              </div>
              <div>
                <p className="mb-1 text-sm text-amber-200/50">Fuel Level</p>
                <p className="text-xl font-semibold text-amber-400">75%</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
