"use client"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { logger } from "@/lib/logger"
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
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Gear/Tool patterns */}
      <svg className="absolute top-10 right-10 w-64 h-64 text-amber-500/5" viewBox="0 0 100 100">
        <path d="M50 20 L55 35 L70 35 L58 45 L63 60 L50 50 L37 60 L42 45 L30 35 L45 35 Z" fill="currentColor"/>
      </svg>
      <svg className="absolute bottom-20 left-10 w-48 h-48 text-amber-500/5" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="8"/>
        <circle cx="50" cy="50" r="15" fill="currentColor"/>
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
          <rect key={i} x="46" y="5" width="8" height="15" fill="currentColor" transform={`rotate(${angle} 50 50)`}/>
        ))}
      </svg>
      <svg className="absolute top-1/3 left-1/4 w-32 h-32 text-amber-500/5" viewBox="0 0 100 100">
        <path d="M20 80 L30 50 L50 50 L60 20 L70 50 L90 50 L80 80 Z" fill="currentColor"/>
        <rect x="45" y="50" width="10" height="40" fill="currentColor"/>
      </svg>
      {/* Wrench */}
      <svg className="absolute bottom-1/4 right-1/3 w-40 h-40 text-amber-500/5 rotate-45" viewBox="0 0 100 100">
        <path d="M15 30 Q15 15 30 15 L40 15 L35 30 L65 60 L70 55 L40 25 L45 15 L70 15 Q85 15 85 30 Q85 45 70 45 L60 45 L65 30 L35 60 L30 65 L60 95 L55 100 L25 70 L20 75 L25 100 L15 100 L15 70 Q15 55 30 55 L25 45 Q15 45 15 30 Z" fill="currentColor"/>
      </svg>
      {/* Grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(245,158,11,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(245,158,11,0.03)_1px,transparent_1px)] bg-size-[40px_40px]" />
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
    not_started: <Circle className="w-5 h-5 text-white/40" />,
    in_progress: <AlertCircle className="w-5 h-5 text-amber-400" />,
    completed: <CheckCircle className="w-5 h-5 text-green-400" />,
  }

  return (
    <div className="flex items-center gap-4 p-4 rounded-xl bg-amber-950/30 border border-amber-500/10 hover:bg-amber-950/50 hover:border-amber-500/20 transition-colors cursor-pointer group" data-testid={`task-${title.toLowerCase().replace(/\s+/g, '-')}`}>
      <button className="shrink-0" aria-label={`Task status: ${status}`}>
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
        <p className="text-amber-200/50 text-sm">{project}</p>
      </div>
      <div className={`px-2 py-1 rounded-full text-xs font-medium ${priorityColors[priority]}`}>
        {priority}
      </div>
      <p className="text-amber-200/40 text-sm hidden sm:block">{dueDate}</p>
      <ChevronRight className="w-4 h-4 text-amber-400/40 group-hover:text-amber-400/60 transition-colors" />
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
    <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-500/10 hover:bg-amber-950/50 hover:border-amber-500/20 transition-colors cursor-pointer" data-testid={`asset-${id}`}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-white font-medium">{name}</p>
          <p className="text-amber-200/50 text-sm">{id}</p>
        </div>
        <div className={`w-3 h-3 rounded-full ${statusColors[status]}`} />
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
      <div className="bg-amber-950 border border-amber-500/20 rounded-lg p-3 shadow-xl">
        <p className="text-amber-100 font-medium mb-1">{label}</p>
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
      .catch((err) => logger.error("Failed to fetch stats", { error: err instanceof Error ? err.message : String(err) }))
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
      {/* Persona-specific background */}
      <div className="fixed inset-0 -z-10 bg-linear-to-br from-amber-950/40 via-[#0a0a0f] to-orange-950/30" />
      <WorkshopPattern />

      {/* Time Clock Banner */}
      <div className="mb-8 p-6 rounded-2xl bg-linear-to-r from-amber-600/30 to-orange-700/20 border border-amber-500/30 backdrop-blur-sm relative overflow-hidden" data-testid="time-clock-banner">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMjAgMTBMMjIgMTVIMjhMMjMgMTlMMjUgMjVMMjAgMjFMMTUgMjVMMTcgMTlMMTIgMTVIMThMMjAgMTBaIiBmaWxsPSJyZ2JhKDI0NSwxNTgsMTEsMC4wNSkiLz48L3N2Zz4=')] opacity-50" />
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 relative">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-linear-to-br from-amber-500/30 to-orange-600/30 border border-amber-500/30 flex items-center justify-center">
              <Clock className="w-8 h-8 text-amber-400" />
            </div>
            <div>
              <p className="text-amber-200/60 text-sm">Today's Work Time</p>
              <p className="text-4xl font-bold text-amber-100 font-mono" data-testid="clock-time">{clockTime}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right mr-4 hidden md:block">
              <p className="text-amber-200/60 text-sm">Clocked in at</p>
              <p className="text-amber-100 font-medium">07:15 AM</p>
            </div>
            <button
              onClick={() => setIsClockRunning(!isClockRunning)}
              data-testid="clock-toggle"
              className={`
                flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-colors border
                ${isClockRunning
                  ? "bg-red-500/20 text-red-400 border-red-500/30 hover:bg-red-500/30"
                  : "bg-green-500/20 text-green-400 border-green-500/30 hover:bg-green-500/30"
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
        <span className="px-3 py-1.5 rounded-full bg-amber-500/20 text-amber-400 text-sm font-medium flex items-center gap-2 border border-amber-500/30">
          <Zap className="w-4 h-4" /> Electrician
        </span>
        <span className="px-3 py-1.5 rounded-full bg-blue-500/20 text-blue-400 text-sm font-medium flex items-center gap-2 border border-blue-500/30">
          <Droplets className="w-4 h-4" /> Plumber
        </span>
        <span className="px-3 py-1.5 rounded-full bg-green-500/20 text-green-400 text-sm font-medium flex items-center gap-2 border border-green-500/30">
          <Wrench className="w-4 h-4" /> Tinkerer
        </span>
        <span className="px-3 py-1.5 rounded-full bg-purple-500/20 text-purple-400 text-sm font-medium flex items-center gap-2 border border-purple-500/30">
          <Settings className="w-4 h-4" /> Magicman
        </span>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-500/20 backdrop-blur-sm" data-testid="stat-tasks">
          <p className="text-amber-200/60 text-sm">Tasks Today</p>
          <p className="text-2xl font-bold text-amber-100">5</p>
          <p className="text-amber-400 text-sm">3 completed</p>
        </div>
        <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-500/20 backdrop-blur-sm" data-testid="stat-hours">
          <p className="text-amber-200/60 text-sm">Hours This Week</p>
          <p className="text-2xl font-bold text-amber-100">38.5</p>
          <p className="text-green-400 text-sm">On track</p>
        </div>
        <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-500/20 backdrop-blur-sm" data-testid="stat-assets">
          <p className="text-amber-200/60 text-sm">Assets Checked</p>
          <p className="text-2xl font-bold text-amber-100">2</p>
          <p className="text-amber-200/50 text-sm">Drill, Grinder</p>
        </div>
        <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-500/20 backdrop-blur-sm" data-testid="stat-leave">
          <p className="text-amber-200/60 text-sm">Leave Balance</p>
          <p className="text-2xl font-bold text-amber-100">15</p>
          <p className="text-amber-200/50 text-sm">days remaining</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        {/* Weekly Task Completion */}
        <div className="bg-amber-950/40 border border-amber-500/20 rounded-2xl p-6 lg:col-span-2 backdrop-blur-sm" data-testid="weekly-tasks-chart">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-amber-100 font-semibold">Weekly Task Progress</h3>
              <p className="text-amber-200/50 text-sm">Completed vs Assigned</p>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-amber-500" />
                <span className="text-amber-200/60">Completed</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-amber-500/30" />
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
                <Bar dataKey="assigned" fill="rgba(245,158,11,0.2)" radius={[4, 4, 0, 0]} name="Assigned" />
                <Bar dataKey="completed" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Completed" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Skills Distribution */}
        <div className="bg-amber-950/40 border border-amber-500/20 rounded-2xl p-6 backdrop-blur-sm" data-testid="skills-chart">
          <h3 className="text-amber-100 font-semibold mb-2">Skills Distribution</h3>
          <p className="text-amber-200/50 text-sm mb-4">Task types this month</p>
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
                <span className="text-amber-200/60">{skill.name}</span>
                <span className="text-amber-100 ml-auto">{skill.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* My Tasks */}
        <div className="bg-amber-950/40 border border-amber-500/20 rounded-2xl overflow-hidden backdrop-blur-sm" data-testid="my-tasks">
          <div className="p-6 border-b border-amber-500/20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ClipboardList className="w-5 h-5 text-amber-400" />
              <div>
                <h3 className="text-amber-100 font-semibold">My Tasks</h3>
                <p className="text-amber-200/50 text-sm">Today's assignments</p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 text-sm border border-amber-500/30">
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
        <div className="bg-amber-950/40 border border-amber-500/20 rounded-2xl overflow-hidden backdrop-blur-sm" data-testid="workshop-assets">
          <div className="p-6 border-b border-amber-500/20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Package className="w-5 h-5 text-amber-400" />
              <div>
                <h3 className="text-amber-100 font-semibold">Workshop Assets</h3>
                <p className="text-amber-200/50 text-sm">Equipment status</p>
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
        <div className="bg-amber-950/40 border border-amber-500/20 rounded-2xl overflow-hidden lg:col-span-2 backdrop-blur-sm" data-testid="vehicle-log">
          <div className="p-6 border-b border-amber-500/20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Car className="w-5 h-5 text-amber-400" />
              <div>
                <h3 className="text-amber-100 font-semibold">Vehicle Log</h3>
                <p className="text-amber-200/50 text-sm">Toyota Hilux - Current Trip</p>
              </div>
            </div>
            <button className="px-4 py-2 rounded-xl bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 transition-colors text-sm font-medium border border-amber-500/30" data-testid="end-trip-btn">
              End Trip
            </button>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
              <div>
                <p className="text-amber-200/50 text-sm mb-1">Start Odometer</p>
                <p className="text-xl font-semibold text-amber-100">124,532 km</p>
              </div>
              <div>
                <p className="text-amber-200/50 text-sm mb-1">Trip Start</p>
                <p className="text-xl font-semibold text-amber-100">07:30 AM</p>
              </div>
              <div>
                <p className="text-amber-200/50 text-sm mb-1">Purpose</p>
                <p className="text-xl font-semibold text-amber-100">Supply Run</p>
              </div>
              <div>
                <p className="text-amber-200/50 text-sm mb-1">Pre-Trip Check</p>
                <p className="text-xl font-semibold text-green-400">✓ Completed</p>
              </div>
              <div>
                <p className="text-amber-200/50 text-sm mb-1">Fuel Level</p>
                <p className="text-xl font-semibold text-amber-400">75%</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
