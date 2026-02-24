"use client"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import {
  ClipboardList,
  Clock,
  DollarSign,
  Car,
  CheckCircle,
  Circle,
  AlertCircle,
  Play,
  Pause,
  Plus,
  Upload,
  ChevronRight,
  Leaf,
  Paintbrush,
  Hammer,
  Sun,
  CloudRain,
  Thermometer,
  TreeDeciduous,
  Flower2,
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
  AreaChart,
  Area,
} from "recharts"

// Lucky's task distribution data
const taskTypeData = [
  { name: "Gardening", value: 45, color: "#10b981" },
  { name: "Painting", value: 25, color: "#3b82f6" },
  { name: "Labour", value: 20, color: "#f59e0b" },
  { name: "Other", value: 10, color: "#8b5cf6" },
]

// Weekly hours data
const weeklyHoursData = [
  { day: "Mon", hours: 8 },
  { day: "Tue", hours: 7.5 },
  { day: "Wed", hours: 8 },
  { day: "Thu", hours: 6.5 },
  { day: "Fri", hours: 8 },
  { day: "Sat", hours: 4 },
  { day: "Sun", hours: 0 },
]

// Monthly expenses trend
const expensesTrendData = [
  { week: "W1", approved: 450, pending: 120 },
  { week: "W2", approved: 320, pending: 280 },
  { week: "W3", approved: 580, pending: 0 },
  { week: "W4", approved: 280, pending: 320 },
]

// Grass blade SVG paths for garden background
const grassPaths = [
  "M0 100 Q5 60 10 40 Q15 60 20 100",
  "M30 100 Q35 50 40 25 Q45 50 50 100",
  "M60 100 Q65 65 70 45 Q75 65 80 100",
  "M100 100 Q105 55 110 30 Q115 55 120 100",
  "M140 100 Q145 70 150 50 Q155 70 160 100",
  "M180 100 Q185 60 190 35 Q195 60 200 100",
  "M220 100 Q225 65 230 45 Q235 65 240 100",
  "M260 100 Q265 55 270 30 Q275 55 280 100",
  "M300 100 Q305 70 310 50 Q315 70 320 100",
  "M340 100 Q345 60 350 40 Q355 60 360 100",
  "M380 100 Q385 55 390 25 Q395 55 400 100",
  "M420 100 Q425 65 430 45 Q435 65 440 100",
  "M460 100 Q465 70 470 50 Q475 70 480 100",
  "M500 100 Q505 60 510 35 Q515 60 520 100",
  "M540 100 Q545 55 550 30 Q555 55 560 100",
  "M580 100 Q585 65 590 45 Q595 65 600 100",
  "M620 100 Q625 70 630 50 Q635 70 640 100",
  "M660 100 Q665 60 670 40 Q675 60 680 100",
  "M700 100 Q705 55 710 25 Q715 55 720 100",
  "M740 100 Q745 65 750 45 Q755 65 760 100",
  "M780 100 Q785 70 790 50 Q795 70 800 100",
  "M820 100 Q825 60 830 35 Q835 60 840 100",
  "M860 100 Q865 55 870 30 Q875 55 880 100",
  "M900 100 Q905 65 910 45 Q915 65 920 100",
  "M940 100 Q945 70 950 50 Q955 70 960 100",
  "M980 100 Q985 60 990 40 Q995 60 1000 100",
  "M1020 100 Q1025 55 1030 25 Q1035 55 1040 100",
  "M1060 100 Q1065 65 1070 45 Q1075 65 1080 100",
  "M1100 100 Q1105 70 1110 50 Q1115 70 1120 100",
  "M1140 100 Q1145 60 1150 35 Q1155 60 1160 100",
  "M1180 100 Q1185 55 1190 30 Q1195 55 1200 100",
]

// Garden/Nature-themed background pattern
function GardenPattern() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Leaf patterns */}
      <svg className="absolute top-10 right-10 h-64 w-64 text-green-500/5" viewBox="0 0 100 100">
        <path
          d="M50 10 Q80 30 70 60 Q60 80 50 90 Q40 80 30 60 Q20 30 50 10 Z"
          fill="currentColor"
        />
        <path d="M50 20 L50 85" stroke="currentColor" strokeWidth="2" fill="none" />
      </svg>
      <svg className="absolute bottom-20 left-10 h-48 w-48 text-green-500/5" viewBox="0 0 100 100">
        <ellipse cx="50" cy="40" rx="30" ry="35" fill="currentColor" />
        <path d="M50 75 L50 95" stroke="currentColor" strokeWidth="3" />
        <path d="M50 40 Q30 50 20 70" stroke="currentColor" strokeWidth="1" fill="none" />
        <path d="M50 40 Q70 50 80 70" stroke="currentColor" strokeWidth="1" fill="none" />
      </svg>
      {/* Flower */}
      <svg className="absolute top-1/3 left-1/4 h-32 w-32 text-green-500/5" viewBox="0 0 100 100">
        {[0, 72, 144, 216, 288].map((angle, i) => (
          <ellipse
            key={i}
            cx="50"
            cy="30"
            rx="12"
            ry="20"
            fill="currentColor"
            transform={`rotate(${angle} 50 50)`}
          />
        ))}
        <circle cx="50" cy="50" r="12" fill="currentColor" />
      </svg>
      {/* Tree */}
      <svg
        className="absolute right-1/4 bottom-1/4 h-40 w-40 text-green-500/5"
        viewBox="0 0 100 100"
      >
        <polygon points="50,10 80,50 65,50 85,80 15,80 35,50 20,50" fill="currentColor" />
        <rect x="45" y="80" width="10" height="15" fill="currentColor" />
      </svg>
      {/* Grass blades */}
      <div className="absolute right-0 bottom-0 left-0 h-32 opacity-10">
        <svg className="h-full w-full" viewBox="0 0 1200 100" preserveAspectRatio="none">
          {grassPaths.map((d, i) => (
            <path key={i} d={d} stroke="#10b981" strokeWidth="2" fill="none" />
          ))}
        </svg>
      </div>
      {/* Grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />
    </div>
  )
}

// Custom tooltip for charts
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-green-500/20 bg-green-950 p-3 shadow-xl">
        <p className="mb-1 font-medium text-green-100">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}:{" "}
            {typeof entry.value === "number"
              ? entry.name.includes("R") ||
                entry.dataKey?.includes("approved") ||
                entry.dataKey?.includes("pending")
                ? `R${entry.value}`
                : entry.value
              : entry.value}
          </p>
        ))}
      </div>
    )
  }
  return null
}

export default function LuckyDashboard() {
  const [isClockRunning, setIsClockRunning] = useState(true)
  const [clockTime, setClockTime] = useState("05:18:42")

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

  const [grassPaths] = useState(() =>
    Array.from({ length: 60 }).map(
      (_, i) => `M${i * 20} 100 Q${i * 20 + 5} ${70 - Math.random() * 30} ${i * 20 + 10} 100`
    )
  )

  return (
    <DashboardLayout persona="lucky">
      {/* Persona-specific background */}
      <div className="fixed inset-0 -z-10 bg-linear-to-br from-green-950/40 via-[#0a0a0f] to-emerald-950/30" />
      <GardenPattern />

      {/* Time Clock Banner */}
      <div
        className="relative mb-8 overflow-hidden rounded-2xl border border-green-500/30 bg-linear-to-r from-green-600/30 to-emerald-700/20 p-6 backdrop-blur-sm"
        data-testid="time-clock-banner"
      >
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMjAgNSBRMzAgMTUgMjUgMjUgUTIwIDM1IDIwIDM1IFEyMCAzNSAxNSAyNSBRMTAgMTUgMjAgNSBaIiBmaWxsPSJyZ2JhKDE2LDE4NSwxMjksMC4wNSkiLz48L3N2Zz4=')] opacity-50" />
        <div className="relative flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-xl border border-green-500/30 bg-linear-to-br from-green-500/30 to-emerald-600/30">
              <Clock className="h-8 w-8 text-green-400" />
            </div>
            <div>
              <p className="text-sm text-green-200/60">Today&apos;s Work Time</p>
              <p className="font-mono text-4xl font-bold text-green-100" data-testid="clock-time">
                {clockTime}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="mr-4 hidden text-right md:block">
              <p className="text-sm text-green-200/60">Clocked in at</p>
              <p className="font-medium text-green-100">06:30 AM</p>
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

      {/* Specialty Tags & Weather */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          <span className="flex items-center gap-2 rounded-full border border-green-500/30 bg-green-500/20 px-3 py-1.5 text-sm font-medium text-green-400">
            <Leaf className="h-4 w-4" /> Gardening
          </span>
          <span className="flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/20 px-3 py-1.5 text-sm font-medium text-blue-400">
            <Paintbrush className="h-4 w-4" /> Painting
          </span>
          <span className="flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/20 px-3 py-1.5 text-sm font-medium text-amber-400">
            <Hammer className="h-4 w-4" /> Manual Labour
          </span>
        </div>
        {/* Weather Widget */}
        <div className="flex items-center gap-3 rounded-xl border border-green-500/20 bg-green-950/50 px-4 py-2">
          <Sun className="h-5 w-5 text-amber-400" />
          <div>
            <p className="font-medium text-green-100">28°C</p>
            <p className="text-xs text-green-200/50">Perfect for outdoor work</p>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
        <div
          className="rounded-xl border border-green-500/20 bg-green-950/40 p-4 backdrop-blur-sm"
          data-testid="stat-tasks"
        >
          <p className="text-sm text-green-200/60">Tasks Today</p>
          <p className="text-2xl font-bold text-green-100">4</p>
          <p className="text-sm text-green-400">3 completed</p>
        </div>
        <div
          className="rounded-xl border border-green-500/20 bg-green-950/40 p-4 backdrop-blur-sm"
          data-testid="stat-hours"
        >
          <p className="text-sm text-green-200/60">Hours This Week</p>
          <p className="text-2xl font-bold text-green-100">32.5</p>
          <p className="text-sm text-green-400">On track</p>
        </div>
        <div
          className="rounded-xl border border-green-500/20 bg-green-950/40 p-4 backdrop-blur-sm"
          data-testid="stat-expenses"
        >
          <p className="text-sm text-green-200/60">Pending Expenses</p>
          <p className="text-2xl font-bold text-green-100">R320</p>
          <p className="text-sm text-amber-400">Awaiting approval</p>
        </div>
        <div
          className="rounded-xl border border-green-500/20 bg-green-950/40 p-4 backdrop-blur-sm"
          data-testid="stat-leave"
        >
          <p className="text-sm text-green-200/60">Leave Balance</p>
          <p className="text-2xl font-bold text-green-100">8</p>
          <p className="text-sm text-green-200/50">days remaining</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="mb-8 grid gap-6 lg:grid-cols-3">
        {/* Weekly Hours */}
        <div
          className="rounded-2xl border border-green-500/20 bg-green-950/40 p-6 backdrop-blur-sm lg:col-span-2"
          data-testid="weekly-hours-chart"
        >
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-green-100">Weekly Hours</h3>
              <p className="text-sm text-green-200/50">Hours worked per day</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-green-100">42h</p>
              <p className="text-sm text-green-400">Total this week</p>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyHoursData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(16,185,129,0.1)" />
                <XAxis dataKey="day" stroke="rgba(16,185,129,0.6)" fontSize={12} />
                <YAxis stroke="rgba(16,185,129,0.6)" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="hours"
                  stroke="#10b981"
                  fill="rgba(16,185,129,0.2)"
                  strokeWidth={2}
                  name="Hours"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Task Type Distribution */}
        <div
          className="rounded-2xl border border-green-500/20 bg-green-950/40 p-6 backdrop-blur-sm"
          data-testid="task-type-chart"
        >
          <h3 className="mb-2 font-semibold text-green-100">Task Types</h3>
          <p className="mb-4 text-sm text-green-200/50">This month&apos;s work</p>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={taskTypeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {taskTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {taskTypeData.map((task) => (
              <div key={task.name} className="flex items-center gap-2 text-sm">
                <div className="h-2 w-2 rounded-full" style={{ backgroundColor: task.color }} />
                <span className="text-green-200/60">{task.name}</span>
                <span className="ml-auto text-green-100">{task.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* My Tasks */}
        <div
          className="overflow-hidden rounded-2xl border border-green-500/20 bg-green-950/40 backdrop-blur-sm"
          data-testid="my-tasks"
        >
          <div className="flex items-center justify-between border-b border-green-500/20 p-6">
            <div className="flex items-center gap-3">
              <ClipboardList className="h-5 w-5 text-green-400" />
              <div>
                <h3 className="font-semibold text-green-100">My Tasks</h3>
                <p className="text-sm text-green-200/50">Today&apos;s garden work</p>
              </div>
            </div>
          </div>
          <div className="space-y-3 p-4">
            <div
              className="flex items-center gap-4 rounded-xl border border-green-500/10 bg-green-950/50 p-4"
              data-testid="task-lawn-mowing"
            >
              <CheckCircle className="h-5 w-5 text-green-400" />
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-500/20">
                <Leaf className="h-4 w-4 text-green-400" />
              </div>
              <div className="flex-1">
                <p className="text-green-200/50 line-through">Weekly lawn mowing</p>
                <p className="text-sm text-green-200/40">Garden - Front & Back</p>
              </div>
              <span className="text-sm text-green-400">Done</span>
            </div>
            <div
              className="flex items-center gap-4 rounded-xl border border-green-500/10 bg-green-950/50 p-4"
              data-testid="task-hedge-trim"
            >
              <CheckCircle className="h-5 w-5 text-green-400" />
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-500/20">
                <TreeDeciduous className="h-4 w-4 text-green-400" />
              </div>
              <div className="flex-1">
                <p className="text-green-200/50 line-through">Trim hedges - front</p>
                <p className="text-sm text-green-200/40">Garden Maintenance</p>
              </div>
              <span className="text-sm text-green-400">Done</span>
            </div>
            <div
              className="flex items-center gap-4 rounded-xl border border-green-500/10 bg-green-950/50 p-4"
              data-testid="task-irrigation"
            >
              <AlertCircle className="h-5 w-5 text-amber-400" />
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/20">
                <CloudRain className="h-4 w-4 text-amber-400" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-green-100">Fix irrigation zone 3</p>
                <p className="text-sm text-green-200/50">High Priority - Leak detected</p>
              </div>
              <span className="text-sm text-amber-400">In Progress</span>
            </div>
            <div
              className="flex items-center gap-4 rounded-xl border border-green-500/10 bg-green-950/50 p-4"
              data-testid="task-flowers"
            >
              <Circle className="h-5 w-5 text-green-200/40" />
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/20">
                <Paintbrush className="h-4 w-4 text-blue-400" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-green-100">Paint garden shed door</p>
                <p className="text-sm text-green-200/50">Painting - Exterior</p>
              </div>
              <span className="text-sm text-green-200/40">Pending</span>
            </div>
          </div>
        </div>

        {/* Expenses */}
        <div
          className="overflow-hidden rounded-2xl border border-green-500/20 bg-green-950/40 backdrop-blur-sm"
          data-testid="my-expenses"
        >
          <div className="flex items-center justify-between border-b border-green-500/20 p-6">
            <div className="flex items-center gap-3">
              <DollarSign className="h-5 w-5 text-green-400" />
              <div>
                <h3 className="font-semibold text-green-100">My Expenses</h3>
                <p className="text-sm text-green-200/50">Recent submissions</p>
              </div>
            </div>
            <button
              className="flex items-center gap-2 rounded-xl border border-green-500/30 bg-green-500/20 px-4 py-2 text-sm font-medium text-green-400 transition-colors hover:bg-green-500/30"
              data-testid="new-expense-btn"
            >
              <Plus className="h-4 w-4" />
              New
            </button>
          </div>
          <div className="space-y-3 p-4">
            <div className="flex items-center gap-4 rounded-xl border border-green-500/10 bg-green-950/50 p-4">
              <div className="flex-1">
                <p className="font-medium text-green-100">Garden Supplies</p>
                <p className="text-sm text-green-200/50">Seeds, fertilizer, mulch</p>
              </div>
              <p className="font-semibold text-green-100">R320</p>
              <span className="rounded-full border border-amber-500/30 bg-amber-500/20 px-2 py-1 text-xs text-amber-400">
                Pending
              </span>
            </div>
            <div className="flex items-center gap-4 rounded-xl border border-green-500/10 bg-green-950/50 p-4">
              <div className="flex-1">
                <p className="font-medium text-green-100">Fuel - Lawn Mower</p>
                <p className="text-sm text-green-200/50">Petrol 10L</p>
              </div>
              <p className="font-semibold text-green-100">R280</p>
              <span className="rounded-full border border-green-500/30 bg-green-500/20 px-2 py-1 text-xs text-green-400">
                Approved
              </span>
            </div>
            <div className="flex items-center gap-4 rounded-xl border border-green-500/10 bg-green-950/50 p-4">
              <div className="flex-1">
                <p className="font-medium text-green-100">Paint Supplies</p>
                <p className="text-sm text-green-200/50">Exterior paint, brushes</p>
              </div>
              <p className="font-semibold text-green-100">R650</p>
              <span className="rounded-full border border-green-500/30 bg-green-500/20 px-2 py-1 text-xs text-green-400">
                Approved
              </span>
            </div>
          </div>
          <div className="border-t border-green-500/20 p-4">
            <button
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-green-500/30 p-3 text-green-200/60 transition-colors hover:border-green-500/50 hover:text-green-100"
              data-testid="upload-receipt-btn"
            >
              <Upload className="h-4 w-4" />
              Upload Receipt
            </button>
          </div>
        </div>

        {/* Expenses Trend Chart */}
        <div
          className="rounded-2xl border border-green-500/20 bg-green-950/40 p-6 backdrop-blur-sm"
          data-testid="expenses-trend-chart"
        >
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-green-100">Expenses This Month</h3>
              <p className="text-sm text-green-200/50">Approved vs Pending</p>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-green-500" />
                <span className="text-green-200/60">Approved</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-amber-500" />
                <span className="text-green-200/60">Pending</span>
              </div>
            </div>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={expensesTrendData} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(16,185,129,0.1)" />
                <XAxis dataKey="week" stroke="rgba(16,185,129,0.6)" fontSize={12} />
                <YAxis stroke="rgba(16,185,129,0.6)" fontSize={12} tickFormatter={(v) => `R${v}`} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="approved" fill="#10b981" radius={[4, 4, 0, 0]} name="Approved" />
                <Bar dataKey="pending" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Pending" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Vehicle Log */}
        <div
          className="overflow-hidden rounded-2xl border border-green-500/20 bg-green-950/40 backdrop-blur-sm"
          data-testid="vehicle-log"
        >
          <div className="flex items-center justify-between border-b border-green-500/20 p-6">
            <div className="flex items-center gap-3">
              <Car className="h-5 w-5 text-green-400" />
              <div>
                <h3 className="font-semibold text-green-100">Recent Vehicle Trips</h3>
                <p className="text-sm text-green-200/50">Toyota Hilux usage</p>
              </div>
            </div>
            <button
              className="rounded-xl border border-green-500/30 bg-green-500/20 px-4 py-2 text-sm font-medium text-green-400 transition-colors hover:bg-green-500/30"
              data-testid="log-trip-btn"
            >
              Log New Trip
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-green-950/50">
                <tr>
                  <th className="p-4 text-left text-sm font-medium text-green-200/60">Date</th>
                  <th className="p-4 text-left text-sm font-medium text-green-200/60">Purpose</th>
                  <th className="p-4 text-left text-sm font-medium text-green-200/60">Distance</th>
                  <th className="p-4 text-left text-sm font-medium text-green-200/60">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-green-500/10">
                <tr className="hover:bg-green-950/30">
                  <td className="p-4 text-green-100">Today</td>
                  <td className="p-4 text-green-100">Garden center - supplies</td>
                  <td className="p-4 text-green-100">24 km</td>
                  <td className="p-4">
                    <span className="rounded-full border border-green-500/30 bg-green-500/20 px-2 py-1 text-xs text-green-400">
                      Logged
                    </span>
                  </td>
                </tr>
                <tr className="hover:bg-green-950/30">
                  <td className="p-4 text-green-100">Yesterday</td>
                  <td className="p-4 text-green-100">Hardware store</td>
                  <td className="p-4 text-green-100">18 km</td>
                  <td className="p-4">
                    <span className="rounded-full border border-green-500/30 bg-green-500/20 px-2 py-1 text-xs text-green-400">
                      Logged
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
