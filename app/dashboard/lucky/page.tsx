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

// Custom tooltip for charts
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#1a1a24] border border-white/10 rounded-lg p-3 shadow-xl">
        <p className="text-white font-medium mb-1">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {typeof entry.value === 'number' ? (entry.name.includes('R') || entry.dataKey?.includes('approved') || entry.dataKey?.includes('pending') ? `R${entry.value}` : entry.value) : entry.value}
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
        if (newS >= 60) { newS = 0; newM++ }
        if (newM >= 60) { newM = 0; newH++ }
        return `${String(newH).padStart(2, "0")}:${String(newM).padStart(2, "0")}:${String(newS).padStart(2, "0")}`
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [isClockRunning])

  return (
    <DashboardLayout persona="lucky">
      {/* Time Clock Banner */}
      <div className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-green-600/20 to-green-800/20 border border-green-500/30" data-testid="time-clock-banner">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-green-500/20 flex items-center justify-center">
              <Clock className="w-8 h-8 text-green-400" />
            </div>
            <div>
              <p className="text-white/60 text-sm">Today's Work Time</p>
              <p className="text-4xl font-bold text-white font-mono" data-testid="clock-time">{clockTime}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right mr-4 hidden md:block">
              <p className="text-white/60 text-sm">Clocked in at</p>
              <p className="text-white font-medium">06:30 AM</p>
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

      {/* Specialty Tags & Weather */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          <span className="px-3 py-1.5 rounded-full bg-green-500/20 text-green-400 text-sm font-medium flex items-center gap-2">
            <Leaf className="w-4 h-4" /> Gardening
          </span>
          <span className="px-3 py-1.5 rounded-full bg-blue-500/20 text-blue-400 text-sm font-medium flex items-center gap-2">
            <Paintbrush className="w-4 h-4" /> Painting
          </span>
          <span className="px-3 py-1.5 rounded-full bg-amber-500/20 text-amber-400 text-sm font-medium flex items-center gap-2">
            <Hammer className="w-4 h-4" /> Manual Labour
          </span>
        </div>
        {/* Weather Widget */}
        <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-white/5 border border-white/10">
          <Sun className="w-5 h-5 text-amber-400" />
          <div>
            <p className="text-white font-medium">28°C</p>
            <p className="text-white/50 text-xs">Perfect for outdoor work</p>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="p-4 rounded-xl bg-white/5 border border-white/10" data-testid="stat-tasks">
          <p className="text-white/60 text-sm">Tasks Today</p>
          <p className="text-2xl font-bold text-white">4</p>
          <p className="text-green-400 text-sm">3 completed</p>
        </div>
        <div className="p-4 rounded-xl bg-white/5 border border-white/10" data-testid="stat-hours">
          <p className="text-white/60 text-sm">Hours This Week</p>
          <p className="text-2xl font-bold text-white">32.5</p>
          <p className="text-green-400 text-sm">On track</p>
        </div>
        <div className="p-4 rounded-xl bg-white/5 border border-white/10" data-testid="stat-expenses">
          <p className="text-white/60 text-sm">Pending Expenses</p>
          <p className="text-2xl font-bold text-white">R320</p>
          <p className="text-amber-400 text-sm">Awaiting approval</p>
        </div>
        <div className="p-4 rounded-xl bg-white/5 border border-white/10" data-testid="stat-leave">
          <p className="text-white/60 text-sm">Leave Balance</p>
          <p className="text-2xl font-bold text-white">8</p>
          <p className="text-white/50 text-sm">days remaining</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        {/* Weekly Hours */}
        <div className="bg-[#0d0d12] border border-white/10 rounded-2xl p-6 lg:col-span-2" data-testid="weekly-hours-chart">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-white font-semibold">Weekly Hours</h3>
              <p className="text-white/50 text-sm">Hours worked per day</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-white">42h</p>
              <p className="text-green-400 text-sm">Total this week</p>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyHoursData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                <XAxis dataKey="day" stroke="#ffffff60" fontSize={12} />
                <YAxis stroke="#ffffff60" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="hours" 
                  stroke="#10b981" 
                  fill="#10b98130" 
                  strokeWidth={2}
                  name="Hours"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Task Type Distribution */}
        <div className="bg-[#0d0d12] border border-white/10 rounded-2xl p-6" data-testid="task-type-chart">
          <h3 className="text-white font-semibold mb-2">Task Types</h3>
          <p className="text-white/50 text-sm mb-4">This month's work</p>
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
          <div className="grid grid-cols-2 gap-2 mt-4">
            {taskTypeData.map((task) => (
              <div key={task.name} className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: task.color }} />
                <span className="text-white/60">{task.name}</span>
                <span className="text-white ml-auto">{task.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* My Tasks */}
        <div className="bg-[#0d0d12] border border-white/10 rounded-2xl overflow-hidden" data-testid="my-tasks">
          <div className="p-6 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ClipboardList className="w-5 h-5 text-green-400" />
              <div>
                <h3 className="text-white font-semibold">My Tasks</h3>
                <p className="text-white/50 text-sm">Today's garden work</p>
              </div>
            </div>
          </div>
          <div className="p-4 space-y-3">
            <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5" data-testid="task-lawn-mowing">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
                <Leaf className="w-4 h-4 text-green-400" />
              </div>
              <div className="flex-1">
                <p className="text-white/50 line-through">Weekly lawn mowing</p>
                <p className="text-white/40 text-sm">Garden - Front & Back</p>
              </div>
              <span className="text-green-400 text-sm">Done</span>
            </div>
            <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5" data-testid="task-hedge-trim">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
                <Leaf className="w-4 h-4 text-green-400" />
              </div>
              <div className="flex-1">
                <p className="text-white/50 line-through">Trim hedges - front</p>
                <p className="text-white/40 text-sm">Garden Maintenance</p>
              </div>
              <span className="text-green-400 text-sm">Done</span>
            </div>
            <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5" data-testid="task-irrigation">
              <AlertCircle className="w-5 h-5 text-amber-400" />
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
                <CloudRain className="w-4 h-4 text-amber-400" />
              </div>
              <div className="flex-1">
                <p className="text-white font-medium">Fix irrigation zone 3</p>
                <p className="text-white/50 text-sm">High Priority - Leak detected</p>
              </div>
              <span className="text-amber-400 text-sm">In Progress</span>
            </div>
            <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5" data-testid="task-flowers">
              <Circle className="w-5 h-5 text-white/40" />
              <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <Paintbrush className="w-4 h-4 text-blue-400" />
              </div>
              <div className="flex-1">
                <p className="text-white font-medium">Paint garden shed door</p>
                <p className="text-white/50 text-sm">Painting - Exterior</p>
              </div>
              <span className="text-white/40 text-sm">Pending</span>
            </div>
          </div>
        </div>

        {/* Expenses */}
        <div className="bg-[#0d0d12] border border-white/10 rounded-2xl overflow-hidden" data-testid="my-expenses">
          <div className="p-6 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <DollarSign className="w-5 h-5 text-green-400" />
              <div>
                <h3 className="text-white font-semibold">My Expenses</h3>
                <p className="text-white/50 text-sm">Recent submissions</p>
              </div>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors text-sm font-medium" data-testid="new-expense-btn">
              <Plus className="w-4 h-4" />
              New
            </button>
          </div>
          <div className="p-4 space-y-3">
            <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5">
              <div className="flex-1">
                <p className="text-white font-medium">Garden Supplies</p>
                <p className="text-white/50 text-sm">Seeds, fertilizer, mulch</p>
              </div>
              <p className="text-white font-semibold">R320</p>
              <span className="px-2 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs">Pending</span>
            </div>
            <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5">
              <div className="flex-1">
                <p className="text-white font-medium">Fuel - Lawn Mower</p>
                <p className="text-white/50 text-sm">Petrol 10L</p>
              </div>
              <p className="text-white font-semibold">R280</p>
              <span className="px-2 py-1 rounded-full bg-green-500/20 text-green-400 text-xs">Approved</span>
            </div>
            <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5">
              <div className="flex-1">
                <p className="text-white font-medium">Paint Supplies</p>
                <p className="text-white/50 text-sm">Exterior paint, brushes</p>
              </div>
              <p className="text-white font-semibold">R650</p>
              <span className="px-2 py-1 rounded-full bg-green-500/20 text-green-400 text-xs">Approved</span>
            </div>
            <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5">
              <div className="flex-1">
                <p className="text-white font-medium">Hedge Trimmer Blade</p>
                <p className="text-white/50 text-sm">Replacement part</p>
              </div>
              <p className="text-white font-semibold">R450</p>
              <span className="px-2 py-1 rounded-full bg-green-500/20 text-green-400 text-xs">Approved</span>
            </div>
          </div>
          <div className="p-4 border-t border-white/10">
            <button className="w-full flex items-center justify-center gap-2 p-3 rounded-xl border border-dashed border-white/20 text-white/60 hover:text-white hover:border-white/40 transition-colors" data-testid="upload-receipt-btn">
              <Upload className="w-4 h-4" />
              Upload Receipt
            </button>
          </div>
        </div>

        {/* Expenses Trend Chart */}
        <div className="bg-[#0d0d12] border border-white/10 rounded-2xl p-6" data-testid="expenses-trend-chart">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-white font-semibold">Expenses This Month</h3>
              <p className="text-white/50 text-sm">Approved vs Pending</p>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-white/60">Approved</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-amber-500" />
                <span className="text-white/60">Pending</span>
              </div>
            </div>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={expensesTrendData} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                <XAxis dataKey="week" stroke="#ffffff60" fontSize={12} />
                <YAxis stroke="#ffffff60" fontSize={12} tickFormatter={(v) => `R${v}`} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="approved" fill="#10b981" radius={[4, 4, 0, 0]} name="Approved" />
                <Bar dataKey="pending" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Pending" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Vehicle Log */}
        <div className="bg-[#0d0d12] border border-white/10 rounded-2xl overflow-hidden" data-testid="vehicle-log">
          <div className="p-6 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Car className="w-5 h-5 text-green-400" />
              <div>
                <h3 className="text-white font-semibold">Recent Vehicle Trips</h3>
                <p className="text-white/50 text-sm">Toyota Hilux usage</p>
              </div>
            </div>
            <button className="px-4 py-2 rounded-xl bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors text-sm font-medium" data-testid="log-trip-btn">
              Log New Trip
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5">
                <tr>
                  <th className="text-left p-4 text-white/60 text-sm font-medium">Date</th>
                  <th className="text-left p-4 text-white/60 text-sm font-medium">Purpose</th>
                  <th className="text-left p-4 text-white/60 text-sm font-medium">Distance</th>
                  <th className="text-left p-4 text-white/60 text-sm font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                <tr className="hover:bg-white/5">
                  <td className="p-4 text-white">Today</td>
                  <td className="p-4 text-white">Garden center - supplies</td>
                  <td className="p-4 text-white">24 km</td>
                  <td className="p-4"><span className="px-2 py-1 rounded-full bg-green-500/20 text-green-400 text-xs">Logged</span></td>
                </tr>
                <tr className="hover:bg-white/5">
                  <td className="p-4 text-white">Yesterday</td>
                  <td className="p-4 text-white">Hardware store</td>
                  <td className="p-4 text-white">18 km</td>
                  <td className="p-4"><span className="px-2 py-1 rounded-full bg-green-500/20 text-green-400 text-xs">Logged</span></td>
                </tr>
                <tr className="hover:bg-white/5">
                  <td className="p-4 text-white">Mon 16 Dec</td>
                  <td className="p-4 text-white">Waste disposal site</td>
                  <td className="p-4 text-white">32 km</td>
                  <td className="p-4"><span className="px-2 py-1 rounded-full bg-green-500/20 text-green-400 text-xs">Logged</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
