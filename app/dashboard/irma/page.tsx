"use client"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import {
  ClipboardList,
  FileText,
  CheckCircle,
  Circle,
  AlertCircle,
  Home,
  Calendar,
  ChevronRight,
  UtensilsCrossed,
  Baby,
  Sparkles,
  Clock,
  Heart,
  ShoppingCart,
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
} from "recharts"

// Task distribution for Irma
const taskTypeData = [
  { name: "Cleaning", value: 35, color: "#a855f7" },
  { name: "Cooking", value: 30, color: "#f59e0b" },
  { name: "Babysitting", value: 25, color: "#ec4899" },
  { name: "Shopping", value: 10, color: "#3b82f6" },
]

// Weekly task completion
const weeklyTaskData = [
  { day: "Mon", completed: 5, total: 5 },
  { day: "Tue", completed: 4, total: 5 },
  { day: "Wed", completed: 5, total: 5 },
  { day: "Thu", completed: 3, total: 4 },
  { day: "Fri", completed: 4, total: 4 },
  { day: "Sat", completed: 2, total: 2 },
  { day: "Sun", completed: 1, total: 1 },
]

// Meal schedule data
const mealSchedule = [
  { day: "Today", breakfast: "Oatmeal & Fruit", lunch: "Grilled Chicken Salad", dinner: "Lamb Curry", status: "in_progress" },
  { day: "Tomorrow", breakfast: "Eggs & Toast", lunch: "Sandwich Platter", dinner: "Beef Stir Fry", status: "planned" },
  { day: "Saturday", breakfast: "Pancakes", lunch: "Leftovers", dinner: "Braai Night", status: "planned" },
]

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

export default function IrmaDashboard() {
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000)
    return () => clearInterval(timer)
  }, [])

  const getGreeting = () => {
    const hour = currentTime.getHours()
    if (hour < 12) return "Good Morning"
    if (hour < 17) return "Good Afternoon"
    return "Good Evening"
  }

  return (
    <DashboardLayout persona="irma">
      {/* Welcome Banner */}
      <div className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-purple-600/20 to-purple-800/20 border border-purple-500/30" data-testid="welcome-banner">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-xl bg-purple-500/20 flex items-center justify-center text-3xl">
            🏠
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">{getGreeting()}, Irma</h2>
            <p className="text-white/60">Here's your household overview for today</p>
          </div>
        </div>
      </div>

      {/* Specialty Tags */}
      <div className="mb-6 flex flex-wrap gap-2">
        <span className="px-3 py-1.5 rounded-full bg-purple-500/20 text-purple-400 text-sm font-medium flex items-center gap-2">
          <Sparkles className="w-4 h-4" /> Cleaning
        </span>
        <span className="px-3 py-1.5 rounded-full bg-amber-500/20 text-amber-400 text-sm font-medium flex items-center gap-2">
          <UtensilsCrossed className="w-4 h-4" /> Cooking
        </span>
        <span className="px-3 py-1.5 rounded-full bg-pink-500/20 text-pink-400 text-sm font-medium flex items-center gap-2">
          <Baby className="w-4 h-4" /> Babysitting
        </span>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="p-4 rounded-xl bg-white/5 border border-white/10" data-testid="stat-tasks-today">
          <div className="flex items-center gap-3 mb-2">
            <ClipboardList className="w-5 h-5 text-purple-400" />
            <p className="text-white/60 text-sm">Today's Tasks</p>
          </div>
          <p className="text-2xl font-bold text-white">3</p>
          <p className="text-purple-400 text-sm">2 completed</p>
        </div>
        <div className="p-4 rounded-xl bg-white/5 border border-white/10" data-testid="stat-documents">
          <div className="flex items-center gap-3 mb-2">
            <FileText className="w-5 h-5 text-purple-400" />
            <p className="text-white/60 text-sm">Documents</p>
          </div>
          <p className="text-2xl font-bold text-white">4</p>
          <p className="text-green-400 text-sm">All signed</p>
        </div>
        <div className="p-4 rounded-xl bg-white/5 border border-white/10" data-testid="stat-weekly">
          <div className="flex items-center gap-3 mb-2">
            <Calendar className="w-5 h-5 text-purple-400" />
            <p className="text-white/60 text-sm">This Week</p>
          </div>
          <p className="text-2xl font-bold text-white">24</p>
          <p className="text-white/50 text-sm">tasks completed</p>
        </div>
        <div className="p-4 rounded-xl bg-white/5 border border-white/10" data-testid="stat-meals">
          <div className="flex items-center gap-3 mb-2">
            <UtensilsCrossed className="w-5 h-5 text-purple-400" />
            <p className="text-white/60 text-sm">Meals Planned</p>
          </div>
          <p className="text-2xl font-bold text-white">9</p>
          <p className="text-white/50 text-sm">next 3 days</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        {/* Weekly Completion */}
        <div className="bg-[#0d0d12] border border-white/10 rounded-2xl p-6 lg:col-span-2" data-testid="weekly-completion-chart">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-white font-semibold">Weekly Task Completion</h3>
              <p className="text-white/50 text-sm">Tasks completed vs total</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-white">92%</p>
              <p className="text-green-400 text-sm">Completion rate</p>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyTaskData} barGap={8}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                <XAxis dataKey="day" stroke="#ffffff60" fontSize={12} />
                <YAxis stroke="#ffffff60" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="total" fill="#ffffff15" radius={[4, 4, 0, 0]} name="Total" />
                <Bar dataKey="completed" fill="#a855f7" radius={[4, 4, 0, 0]} name="Completed" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Task Distribution */}
        <div className="bg-[#0d0d12] border border-white/10 rounded-2xl p-6" data-testid="task-distribution-chart">
          <h3 className="text-white font-semibold mb-2">Task Distribution</h3>
          <p className="text-white/50 text-sm mb-4">By category this month</p>
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
        {/* Household Tasks */}
        <div className="bg-[#0d0d12] border border-white/10 rounded-2xl overflow-hidden" data-testid="household-tasks">
          <div className="p-6 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Home className="w-5 h-5 text-purple-400" />
              <div>
                <h3 className="text-white font-semibold">Household Tasks</h3>
                <p className="text-white/50 text-sm">Today's roster</p>
              </div>
            </div>
          </div>
          <div className="p-4 space-y-3">
            <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer group" data-testid="task-morning-kitchen">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-purple-400" />
              </div>
              <div className="flex-1">
                <p className="text-white/50 line-through">Morning kitchen clean</p>
                <p className="text-white/40 text-sm">Completed at 8:30 AM</p>
              </div>
              <ChevronRight className="w-4 h-4 text-white/40 group-hover:text-white/60" />
            </div>
            <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer group" data-testid="task-laundry">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-purple-400" />
              </div>
              <div className="flex-1">
                <p className="text-white/50 line-through">Laundry - bedding</p>
                <p className="text-white/40 text-sm">Completed at 10:15 AM</p>
              </div>
              <ChevronRight className="w-4 h-4 text-white/40 group-hover:text-white/60" />
            </div>
            <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer group" data-testid="task-dinner">
              <AlertCircle className="w-5 h-5 text-amber-400" />
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
                <UtensilsCrossed className="w-4 h-4 text-amber-400" />
              </div>
              <div className="flex-1">
                <p className="text-white font-medium">Meal preparation - dinner</p>
                <p className="text-white/50 text-sm">Lamb Curry · Due by 5:00 PM</p>
              </div>
              <ChevronRight className="w-4 h-4 text-white/40 group-hover:text-white/60" />
            </div>
            <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer group" data-testid="task-babysitting">
              <Circle className="w-5 h-5 text-white/40" />
              <div className="w-8 h-8 rounded-lg bg-pink-500/20 flex items-center justify-center">
                <Baby className="w-4 h-4 text-pink-400" />
              </div>
              <div className="flex-1">
                <p className="text-white font-medium">Evening childcare</p>
                <p className="text-white/50 text-sm">6:00 PM - 8:00 PM</p>
              </div>
              <ChevronRight className="w-4 h-4 text-white/40 group-hover:text-white/60" />
            </div>
          </div>
          <div className="p-4 border-t border-white/10">
            <button className="w-full text-center text-purple-400 hover:text-purple-300 text-sm font-medium">
              View weekly schedule
            </button>
          </div>
        </div>

        {/* Meal Planning */}
        <div className="bg-[#0d0d12] border border-white/10 rounded-2xl overflow-hidden" data-testid="meal-planning">
          <div className="p-6 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <UtensilsCrossed className="w-5 h-5 text-purple-400" />
              <div>
                <h3 className="text-white font-semibold">Meal Planning</h3>
                <p className="text-white/50 text-sm">Upcoming meals</p>
              </div>
            </div>
            <button className="px-3 py-1.5 rounded-lg bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 transition-colors text-sm font-medium">
              + Add Meal
            </button>
          </div>
          <div className="p-4 space-y-4">
            {mealSchedule.map((meal, index) => (
              <div key={index} className={`p-4 rounded-xl ${meal.status === 'in_progress' ? 'bg-purple-500/10 border border-purple-500/30' : 'bg-white/5'}`}>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-white font-medium">{meal.day}</span>
                  {meal.status === 'in_progress' && (
                    <span className="px-2 py-1 rounded-full bg-purple-500/20 text-purple-400 text-xs">Active</span>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div>
                    <p className="text-white/50 mb-1">Breakfast</p>
                    <p className="text-white">{meal.breakfast}</p>
                  </div>
                  <div>
                    <p className="text-white/50 mb-1">Lunch</p>
                    <p className="text-white">{meal.lunch}</p>
                  </div>
                  <div>
                    <p className="text-white/50 mb-1">Dinner</p>
                    <p className="text-white">{meal.dinner}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* My Documents */}
        <div className="bg-[#0d0d12] border border-white/10 rounded-2xl overflow-hidden" data-testid="my-documents">
          <div className="p-6 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-purple-400" />
              <div>
                <h3 className="text-white font-semibold">My Documents</h3>
                <p className="text-white/50 text-sm">Signed agreements</p>
              </div>
            </div>
          </div>
          <div className="p-4 space-y-3">
            <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer group">
              <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-400" />
              </div>
              <div className="flex-1">
                <p className="text-white font-medium">Resident Agreement</p>
                <p className="text-white/50 text-sm">Signed Jan 2024 · Valid until Jan 2026</p>
              </div>
              <button className="text-purple-400 text-sm hover:text-purple-300">View</button>
            </div>
            <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer group">
              <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-400" />
              </div>
              <div className="flex-1">
                <p className="text-white font-medium">House Rules</p>
                <p className="text-white/50 text-sm">Signed Jan 2024 · Annual review</p>
              </div>
              <button className="text-purple-400 text-sm hover:text-purple-300">View</button>
            </div>
            <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer group">
              <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-400" />
              </div>
              <div className="flex-1">
                <p className="text-white font-medium">POPIA Consent</p>
                <p className="text-white/50 text-sm">Signed Jan 2024 · 3-year validity</p>
              </div>
              <button className="text-purple-400 text-sm hover:text-purple-300">View</button>
            </div>
          </div>
        </div>

        {/* Weekly Schedule Preview */}
        <div className="bg-[#0d0d12] border border-white/10 rounded-2xl overflow-hidden" data-testid="weekly-schedule">
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-purple-400" />
              <div>
                <h3 className="text-white font-semibold">This Week's Schedule</h3>
                <p className="text-white/50 text-sm">Household task roster</p>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-7 gap-2">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, index) => {
                const isToday = index === 3
                return (
                  <div key={day} className={`text-center p-3 rounded-xl ${isToday ? "bg-purple-500/20 border border-purple-500/30" : "bg-white/5"}`}>
                    <p className={`text-sm font-medium mb-1 ${isToday ? "text-purple-400" : "text-white/60"}`}>{day}</p>
                    <p className={`text-lg font-bold ${isToday ? "text-white" : "text-white/80"}`}>{16 + index}</p>
                    <div className="mt-2 space-y-1">
                      {index < 5 && (
                        <>
                          <div className="h-1 rounded-full bg-purple-500/60" />
                          <div className="h-1 rounded-full bg-amber-500/60" />
                        </>
                      )}
                      {index === 5 && (
                        <div className="h-1 rounded-full bg-purple-500/40" />
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="mt-4 flex items-center gap-4 text-sm text-white/60">
              <div className="flex items-center gap-2">
                <div className="w-3 h-1 rounded-full bg-purple-500/60" />
                <span>Cleaning</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-1 rounded-full bg-amber-500/60" />
                <span>Cooking</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
