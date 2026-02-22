"use client"

import { useState, useEffect, useCallback } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { logger } from "@/lib/logger"
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
  CookingPot,
  Shirt,
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

import { type Task } from "@/lib/services/baserow"

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

// Home/Domestic-themed background pattern
function HomePattern() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Heart patterns */}
      <svg className="absolute top-10 right-10 w-64 h-64 text-purple-500/5" viewBox="0 0 100 100">
        <path d="M50 88 C20 60 5 40 5 25 C5 10 20 5 35 15 C42 20 47 28 50 35 C53 28 58 20 65 15 C80 5 95 10 95 25 C95 40 80 60 50 88 Z" fill="currentColor"/>
      </svg>
      {/* House */}
      <svg className="absolute bottom-20 left-10 w-48 h-48 text-purple-500/5" viewBox="0 0 100 100">
        <polygon points="50,10 90,45 90,90 10,90 10,45" fill="currentColor"/>
        <rect x="40" y="60" width="20" height="30" fill="rgba(10,10,15,0.5)"/>
        <rect x="60" y="50" width="15" height="15" fill="rgba(10,10,15,0.3)"/>
        <rect x="25" y="50" width="15" height="15" fill="rgba(10,10,15,0.3)"/>
      </svg>
      {/* Sparkle/Star */}
      <svg className="absolute top-1/3 left-1/4 w-32 h-32 text-purple-500/5" viewBox="0 0 100 100">
        <path d="M50 5 L55 40 L90 50 L55 60 L50 95 L45 60 L10 50 L45 40 Z" fill="currentColor"/>
      </svg>
      {/* Baby/Child icon */}
      <svg className="absolute bottom-1/4 right-1/4 w-40 h-40 text-pink-500/5" viewBox="0 0 100 100">
        <circle cx="50" cy="35" r="25" fill="currentColor"/>
        <ellipse cx="50" cy="75" rx="30" ry="20" fill="currentColor"/>
      </svg>
      {/* Cooking pot */}
      <svg className="absolute top-1/2 right-10 w-36 h-36 text-amber-500/5" viewBox="0 0 100 100">
        <ellipse cx="50" cy="35" rx="35" ry="10" fill="currentColor"/>
        <path d="M15 35 L15 70 Q15 85 50 85 Q85 85 85 70 L85 35" fill="currentColor"/>
        <rect x="10" y="25" width="80" height="5" fill="currentColor"/>
        <rect x="45" y="15" width="10" height="15" fill="currentColor"/>
      </svg>
      {/* Decorative dots pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(rgba(168,85,247,0.03)_1px,transparent_1px)] bg-[size:30px_30px]" />
    </div>
  )
}

// Custom tooltip for charts
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-purple-950 border border-purple-500/20 rounded-lg p-3 shadow-xl">
        <p className="text-purple-100 font-medium mb-1">{label}</p>
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

interface DocumentItem {
  id: number | string
  name?: string
  title?: string
  type?: string
  status?: string
  signedAt?: string
  lastReview?: string
  nextReview?: string
  expiryDays?: number
  responsible?: string
  signatories?: string[]
  signedBy?: string[]
  urgency?: string
}

export default function IrmaDashboard() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [tasks, setTasks] = useState<Task[]>([])
  const [documents, setDocuments] = useState<DocumentItem[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    try {
      const [tasksRes, docsRes] = await Promise.all([
        fetch("/api/tasks?assignee=irma"),
        fetch("/api/documents"),
      ])
      const tasksData = await tasksRes.json()
      const docsData = await docsRes.json()
      setTasks(tasksData.tasks || [])
      setDocuments(Array.isArray(docsData) ? docsData : (docsData.documents || docsData.templates || []))
    } catch (error) {
      logger.error("Irma dashboard fetch failed", { error: error instanceof Error ? error.message : String(error) })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000)
    return () => clearInterval(timer)
  }, [])

  const today = new Date().toISOString().split("T")[0]
  const tasksToday = tasks.filter((t) => {
    const due = t.dueDate?.split("T")[0] ?? t.dueDate
    return due === today
  })
  const isCompleted = (t: Task) => t.status?.toLowerCase() === "completed"
  const completedToday = tasksToday.filter(isCompleted).length
  const completedThisWeek = tasks.filter(isCompleted).length
  const signedDocs = documents.filter((d) => d.status === "signed" || d.signedAt || (d.signedBy && d.signedBy.length > 0))
  const pendingTasks = tasks.filter((t) => !isCompleted(t)).slice(0, 5)

  const getGreeting = () => {
    const hour = currentTime.getHours()
    if (hour < 12) return "Good Morning"
    if (hour < 17) return "Good Afternoon"
    return "Good Evening"
  }

  return (
    <DashboardLayout persona="irma">
      {/* Persona-specific background */}
      <div className="fixed inset-0 -z-10 bg-linear-to-br from-purple-950/40 via-[#0a0a0f] to-pink-950/30" />
      <HomePattern />

      {/* Welcome Banner */}
      <div className="mb-8 p-6 rounded-2xl bg-linear-to-r from-purple-600/30 to-pink-700/20 border border-purple-500/30 backdrop-blur-sm relative overflow-hidden" data-testid="welcome-banner">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMjAgMzIgQzEwIDI0IDUgMTggNSAxMiBDNSA2IDEwIDQgMTUgOCBDMTggMTAgMTkgMTMgMjAgMTUgQzIxIDEzIDIyIDEwIDI1IDggQzMwIDQgMzUgNiAzNSAxMiBDMzUgMTggMzAgMjQgMjAgMzIgWiIgZmlsbD0icmdiYSgxNjgsMTMzLDI0NywwLjA1KSIvPjwvc3ZnPg==')] opacity-50" />
        <div className="flex items-center gap-4 relative">
          <div className="w-16 h-16 rounded-xl bg-linear-to-br from-purple-500/30 to-pink-500/30 border border-purple-500/30 flex items-center justify-center text-3xl">
            🏠
          </div>
          <div>
            <h2 className="text-2xl font-bold text-purple-100">{getGreeting()}, Irma</h2>
            <p className="text-purple-200/60">Here&apos;s your household overview for today</p>
          </div>
        </div>
      </div>

      {/* Specialty Tags */}
      <div className="mb-6 flex flex-wrap gap-2">
        <span className="px-3 py-1.5 rounded-full bg-purple-500/20 text-purple-400 text-sm font-medium flex items-center gap-2 border border-purple-500/30">
          <Sparkles className="w-4 h-4" /> Cleaning
        </span>
        <span className="px-3 py-1.5 rounded-full bg-amber-500/20 text-amber-400 text-sm font-medium flex items-center gap-2 border border-amber-500/30">
          <CookingPot className="w-4 h-4" /> Cooking
        </span>
        <span className="px-3 py-1.5 rounded-full bg-pink-500/20 text-pink-400 text-sm font-medium flex items-center gap-2 border border-pink-500/30">
          <Baby className="w-4 h-4" /> Babysitting
        </span>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="p-4 rounded-xl bg-purple-950/40 border border-purple-500/20 backdrop-blur-sm" data-testid="stat-tasks-today">
          <div className="flex items-center gap-3 mb-2">
            <ClipboardList className="w-5 h-5 text-purple-400" />
            <p className="text-purple-200/60 text-sm">Today&apos;s Tasks</p>
          </div>
          <p className="text-2xl font-bold text-purple-100">{loading ? "—" : tasksToday.length}</p>
          <p className="text-purple-400 text-sm">{loading ? "…" : `${completedToday} completed`}</p>
        </div>
        <div className="p-4 rounded-xl bg-purple-950/40 border border-purple-500/20 backdrop-blur-sm" data-testid="stat-documents">
          <div className="flex items-center gap-3 mb-2">
            <FileText className="w-5 h-5 text-purple-400" />
            <p className="text-purple-200/60 text-sm">Documents</p>
          </div>
          <p className="text-2xl font-bold text-purple-100">{loading ? "—" : documents.length}</p>
          <p className="text-green-400 text-sm">{loading ? "…" : signedDocs.length === documents.length && documents.length > 0 ? "All signed" : `${signedDocs.length} signed`}</p>
        </div>
        <div className="p-4 rounded-xl bg-purple-950/40 border border-purple-500/20 backdrop-blur-sm" data-testid="stat-weekly">
          <div className="flex items-center gap-3 mb-2">
            <Calendar className="w-5 h-5 text-purple-400" />
            <p className="text-purple-200/60 text-sm">This Week</p>
          </div>
          <p className="text-2xl font-bold text-purple-100">{loading ? "—" : completedThisWeek}</p>
          <p className="text-purple-200/50 text-sm">tasks completed</p>
        </div>
        <div className="p-4 rounded-xl bg-purple-950/40 border border-purple-500/20 backdrop-blur-sm" data-testid="stat-meals">
          <div className="flex items-center gap-3 mb-2">
            <UtensilsCrossed className="w-5 h-5 text-purple-400" />
            <p className="text-purple-200/60 text-sm">Meals Planned</p>
          </div>
          <p className="text-2xl font-bold text-purple-100">9</p>
          <p className="text-purple-200/50 text-sm">next 3 days</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        {/* Weekly Completion */}
        <div className="bg-purple-950/40 border border-purple-500/20 rounded-2xl p-6 lg:col-span-2 backdrop-blur-sm" data-testid="weekly-completion-chart">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-purple-100 font-semibold">Weekly Task Completion</h3>
              <p className="text-purple-200/50 text-sm">Tasks completed vs total</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-purple-100">92%</p>
              <p className="text-green-400 text-sm">Completion rate</p>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyTaskData} barGap={8}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(168,85,247,0.1)" />
                <XAxis dataKey="day" stroke="rgba(168,85,247,0.6)" fontSize={12} />
                <YAxis stroke="rgba(168,85,247,0.6)" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="total" fill="rgba(168,85,247,0.2)" radius={[4, 4, 0, 0]} name="Total" />
                <Bar dataKey="completed" fill="#a855f7" radius={[4, 4, 0, 0]} name="Completed" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Task Distribution */}
        <div className="bg-purple-950/40 border border-purple-500/20 rounded-2xl p-6 backdrop-blur-sm" data-testid="task-distribution-chart">
          <h3 className="text-purple-100 font-semibold mb-2">Task Distribution</h3>
          <p className="text-purple-200/50 text-sm mb-4">By category this month</p>
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
                <span className="text-purple-200/60">{task.name}</span>
                <span className="text-purple-100 ml-auto">{task.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Household Tasks */}
        <div className="bg-purple-950/40 border border-purple-500/20 rounded-2xl overflow-hidden backdrop-blur-sm" data-testid="household-tasks">
          <div className="p-6 border-b border-purple-500/20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Home className="w-5 h-5 text-purple-400" />
              <div>
                <h3 className="text-purple-100 font-semibold">Household Tasks</h3>
                <p className="text-purple-200/50 text-sm">Today&apos;s roster</p>
              </div>
            </div>
          </div>
          <div className="p-4 space-y-3">
            {loading ? (
              <div className="p-4 text-purple-200/50 text-sm">Loading tasks…</div>
            ) : pendingTasks.length === 0 ? (
              <div className="p-4 text-purple-200/50 text-sm">No tasks assigned</div>
            ) : (
              pendingTasks.map((task) => {
                const done = isCompleted(task)
                const Icon = done ? CheckCircle : (task as { priority?: string }).priority === "High" ? AlertCircle : Circle
                const iconColor = done ? "text-green-400" : (task as { priority?: string }).priority === "High" ? "text-amber-400" : "text-purple-200/40"
                return (
                  <div
                    key={task.id}
                    className="flex items-center gap-4 p-4 rounded-xl bg-purple-950/50 border border-purple-500/10 hover:bg-purple-950/70 transition-colors cursor-pointer group"
                    data-testid={`task-${task.id}`}
                  >
                    <Icon className={`w-5 h-5 ${iconColor}`} />
                    <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-purple-400" />
                    </div>
                    <div className="flex-1">
                      <p className={done ? "text-purple-200/50 line-through" : "text-purple-100 font-medium"}>{task.title}</p>
                      <p className="text-purple-200/40 text-sm">
                        {done ? `Completed ${task.completedDate ? new Date(task.completedDate).toLocaleTimeString() : ""}` : task.dueDate ? `Due ${new Date(task.dueDate).toLocaleDateString()}` : ""}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-purple-400/40 group-hover:text-purple-400/60" />
                  </div>
                )
              })
            )}
          </div>
          <div className="p-4 border-t border-purple-500/20">
            <button className="w-full text-center text-purple-400 hover:text-purple-300 text-sm font-medium">
              View weekly schedule
            </button>
          </div>
        </div>

        {/* Meal Planning */}
        <div className="bg-purple-950/40 border border-purple-500/20 rounded-2xl overflow-hidden backdrop-blur-sm" data-testid="meal-planning">
          <div className="p-6 border-b border-purple-500/20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <UtensilsCrossed className="w-5 h-5 text-purple-400" />
              <div>
                <h3 className="text-purple-100 font-semibold">Meal Planning</h3>
                <p className="text-purple-200/50 text-sm">Upcoming meals</p>
              </div>
            </div>
            <button className="px-3 py-1.5 rounded-lg bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 transition-colors text-sm font-medium border border-purple-500/30">
              + Add Meal
            </button>
          </div>
          <div className="p-4 space-y-4">
            {mealSchedule.map((meal, index) => (
              <div key={index} className={`p-4 rounded-xl ${meal.status === 'in_progress' ? 'bg-purple-500/20 border border-purple-500/30' : 'bg-purple-950/50 border border-purple-500/10'}`}>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-purple-100 font-medium">{meal.day}</span>
                  {meal.status === 'in_progress' && (
                    <span className="px-2 py-1 rounded-full bg-purple-500/30 text-purple-300 text-xs border border-purple-500/40">Active</span>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div>
                    <p className="text-purple-200/50 mb-1">Breakfast</p>
                    <p className="text-purple-100">{meal.breakfast}</p>
                  </div>
                  <div>
                    <p className="text-purple-200/50 mb-1">Lunch</p>
                    <p className="text-purple-100">{meal.lunch}</p>
                  </div>
                  <div>
                    <p className="text-purple-200/50 mb-1">Dinner</p>
                    <p className="text-purple-100">{meal.dinner}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* My Documents */}
        <div className="bg-purple-950/40 border border-purple-500/20 rounded-2xl overflow-hidden backdrop-blur-sm" data-testid="my-documents">
          <div className="p-6 border-b border-purple-500/20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-purple-400" />
              <div>
                <h3 className="text-purple-100 font-semibold">My Documents</h3>
                <p className="text-purple-200/50 text-sm">Signed agreements</p>
              </div>
            </div>
          </div>
          <div className="p-4 space-y-3">
            {loading ? (
              <div className="p-4 text-purple-200/50 text-sm">Loading documents…</div>
            ) : documents.length === 0 ? (
              <div className="p-4 text-purple-200/50 text-sm">No documents</div>
            ) : (
              documents.slice(0, 5).map((doc) => {
                const name = doc.name ?? doc.title ?? "Document"
                const isSigned = doc.status === "signed" || !!doc.signedAt || (doc.signedBy && doc.signedBy.length > 0)
                return (
                  <div key={doc.id} className="flex items-center gap-4 p-4 rounded-xl bg-purple-950/50 border border-purple-500/10 hover:bg-purple-950/70 transition-colors cursor-pointer group">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isSigned ? "bg-green-500/20" : "bg-amber-500/20"}`}>
                      <CheckCircle className={`w-5 h-5 ${isSigned ? "text-green-400" : "text-amber-400"}`} />
                    </div>
                    <div className="flex-1">
                      <p className="text-purple-100 font-medium">{name}</p>
                      <p className="text-purple-200/50 text-sm">
                        {isSigned && (doc.signedAt || doc.lastReview) ? `Signed ${new Date(doc.signedAt ?? doc.lastReview!).toLocaleDateString()}` : doc.status ?? "Pending"}
                      </p>
                    </div>
                    <button className="text-purple-400 text-sm hover:text-purple-300">View</button>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Weekly Schedule Preview */}
        <div className="bg-purple-950/40 border border-purple-500/20 rounded-2xl overflow-hidden backdrop-blur-sm" data-testid="weekly-schedule">
          <div className="p-6 border-b border-purple-500/20">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-purple-400" />
              <div>
                <h3 className="text-purple-100 font-semibold">This Week&apos;s Schedule</h3>
                <p className="text-purple-200/50 text-sm">Household task roster</p>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-7 gap-2">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, index) => {
                const isToday = index === 3
                return (
                  <div key={day} className={`text-center p-3 rounded-xl ${isToday ? "bg-purple-500/30 border border-purple-500/40" : "bg-purple-950/50 border border-purple-500/10"}`}>
                    <p className={`text-sm font-medium mb-1 ${isToday ? "text-purple-300" : "text-purple-200/60"}`}>{day}</p>
                    <p className={`text-lg font-bold ${isToday ? "text-purple-100" : "text-purple-100/80"}`}>{16 + index}</p>
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
            <div className="mt-4 flex items-center gap-4 text-sm text-purple-200/60">
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
