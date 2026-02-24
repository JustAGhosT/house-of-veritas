"use client"

import { useState, useEffect, useCallback } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { logger } from "@/lib/logger"
import { apiFetch } from "@/lib/api-client"
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
  {
    day: "Today",
    breakfast: "Oatmeal & Fruit",
    lunch: "Grilled Chicken Salad",
    dinner: "Lamb Curry",
    status: "in_progress",
  },
  {
    day: "Tomorrow",
    breakfast: "Eggs & Toast",
    lunch: "Sandwich Platter",
    dinner: "Beef Stir Fry",
    status: "planned",
  },
  {
    day: "Saturday",
    breakfast: "Pancakes",
    lunch: "Leftovers",
    dinner: "Braai Night",
    status: "planned",
  },
]

// Home/Domestic-themed background pattern
function HomePattern() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Heart patterns */}
      <svg className="absolute top-10 right-10 h-64 w-64 text-purple-500/5" viewBox="0 0 100 100">
        <path
          d="M50 88 C20 60 5 40 5 25 C5 10 20 5 35 15 C42 20 47 28 50 35 C53 28 58 20 65 15 C80 5 95 10 95 25 C95 40 80 60 50 88 Z"
          fill="currentColor"
        />
      </svg>
      {/* House */}
      <svg className="absolute bottom-20 left-10 h-48 w-48 text-purple-500/5" viewBox="0 0 100 100">
        <polygon points="50,10 90,45 90,90 10,90 10,45" fill="currentColor" />
        <rect x="40" y="60" width="20" height="30" fill="rgba(10,10,15,0.5)" />
        <rect x="60" y="50" width="15" height="15" fill="rgba(10,10,15,0.3)" />
        <rect x="25" y="50" width="15" height="15" fill="rgba(10,10,15,0.3)" />
      </svg>
      {/* Sparkle/Star */}
      <svg className="absolute top-1/3 left-1/4 h-32 w-32 text-purple-500/5" viewBox="0 0 100 100">
        <path d="M50 5 L55 40 L90 50 L55 60 L50 95 L45 60 L10 50 L45 40 Z" fill="currentColor" />
      </svg>
      {/* Baby/Child icon */}
      <svg
        className="absolute right-1/4 bottom-1/4 h-40 w-40 text-pink-500/5"
        viewBox="0 0 100 100"
      >
        <circle cx="50" cy="35" r="25" fill="currentColor" />
        <ellipse cx="50" cy="75" rx="30" ry="20" fill="currentColor" />
      </svg>
      {/* Cooking pot */}
      <svg className="absolute top-1/2 right-10 h-36 w-36 text-amber-500/5" viewBox="0 0 100 100">
        <ellipse cx="50" cy="35" rx="35" ry="10" fill="currentColor" />
        <path d="M15 35 L15 70 Q15 85 50 85 Q85 85 85 70 L85 35" fill="currentColor" />
        <rect x="10" y="25" width="80" height="5" fill="currentColor" />
        <rect x="45" y="15" width="10" height="15" fill="currentColor" />
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
      <div className="rounded-lg border border-purple-500/20 bg-purple-950 p-3 shadow-xl">
        <p className="mb-1 font-medium text-purple-100">{label}</p>
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
      const [tasksData, docsData] = await Promise.all([
        apiFetch<{ tasks?: Task[] }>("/api/tasks?assignee=irma", { label: "Tasks" }),
        apiFetch<{ documents?: DocumentItem[]; templates?: DocumentItem[] } | DocumentItem[]>(
          "/api/documents",
          { label: "Documents" }
        ),
      ])
      setTasks(tasksData?.tasks || [])
      const docs = Array.isArray(docsData)
        ? docsData
        : (docsData as { documents?: DocumentItem[]; templates?: DocumentItem[] })
      setDocuments(Array.isArray(docs) ? docs : (docs?.documents ?? docs?.templates ?? []))
    } catch (error) {
      logger.error("Irma dashboard fetch failed", {
        error: error instanceof Error ? error.message : String(error),
      })
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
  const signedDocs = documents.filter(
    (d) => d.status === "signed" || d.signedAt || (d.signedBy && d.signedBy.length > 0)
  )
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
      <div
        className="relative mb-8 overflow-hidden rounded-2xl border border-purple-500/30 bg-linear-to-r from-purple-600/30 to-pink-700/20 p-6 backdrop-blur-sm"
        data-testid="welcome-banner"
      >
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMjAgMzIgQzEwIDI0IDUgMTggNSAxMiBDNSA2IDEwIDQgMTUgOCBDMTggMTAgMTkgMTMgMjAgMTUgQzIxIDEzIDIyIDEwIDI1IDggQzMwIDQgMzUgNiAzNSAxMiBDMzUgMTggMzAgMjQgMjAgMzIgWiIgZmlsbD0icmdiYSgxNjgsMTMzLDI0NywwLjA1KSIvPjwvc3ZnPg==')] opacity-50" />
        <div className="relative flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-xl border border-purple-500/30 bg-linear-to-br from-purple-500/30 to-pink-500/30 text-3xl">
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
        <span className="flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/20 px-3 py-1.5 text-sm font-medium text-purple-400">
          <Sparkles className="h-4 w-4" /> Cleaning
        </span>
        <span className="flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/20 px-3 py-1.5 text-sm font-medium text-amber-400">
          <CookingPot className="h-4 w-4" /> Cooking
        </span>
        <span className="flex items-center gap-2 rounded-full border border-pink-500/30 bg-pink-500/20 px-3 py-1.5 text-sm font-medium text-pink-400">
          <Baby className="h-4 w-4" /> Babysitting
        </span>
      </div>

      {/* Quick Stats */}
      <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
        <div
          className="rounded-xl border border-purple-500/20 bg-purple-950/40 p-4 backdrop-blur-sm"
          data-testid="stat-tasks-today"
        >
          <div className="mb-2 flex items-center gap-3">
            <ClipboardList className="h-5 w-5 text-purple-400" />
            <p className="text-sm text-purple-200/60">Today&apos;s Tasks</p>
          </div>
          <p className="text-2xl font-bold text-purple-100">{loading ? "—" : tasksToday.length}</p>
          <p className="text-sm text-purple-400">{loading ? "…" : `${completedToday} completed`}</p>
        </div>
        <div
          className="rounded-xl border border-purple-500/20 bg-purple-950/40 p-4 backdrop-blur-sm"
          data-testid="stat-documents"
        >
          <div className="mb-2 flex items-center gap-3">
            <FileText className="h-5 w-5 text-purple-400" />
            <p className="text-sm text-purple-200/60">Documents</p>
          </div>
          <p className="text-2xl font-bold text-purple-100">{loading ? "—" : documents.length}</p>
          <p className="text-sm text-green-400">
            {loading
              ? "…"
              : signedDocs.length === documents.length && documents.length > 0
                ? "All signed"
                : `${signedDocs.length} signed`}
          </p>
        </div>
        <div
          className="rounded-xl border border-purple-500/20 bg-purple-950/40 p-4 backdrop-blur-sm"
          data-testid="stat-weekly"
        >
          <div className="mb-2 flex items-center gap-3">
            <Calendar className="h-5 w-5 text-purple-400" />
            <p className="text-sm text-purple-200/60">This Week</p>
          </div>
          <p className="text-2xl font-bold text-purple-100">{loading ? "—" : completedThisWeek}</p>
          <p className="text-sm text-purple-200/50">tasks completed</p>
        </div>
        <div
          className="rounded-xl border border-purple-500/20 bg-purple-950/40 p-4 backdrop-blur-sm"
          data-testid="stat-meals"
        >
          <div className="mb-2 flex items-center gap-3">
            <UtensilsCrossed className="h-5 w-5 text-purple-400" />
            <p className="text-sm text-purple-200/60">Meals Planned</p>
          </div>
          <p className="text-2xl font-bold text-purple-100">9</p>
          <p className="text-sm text-purple-200/50">next 3 days</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="mb-8 grid gap-6 lg:grid-cols-3">
        {/* Weekly Completion */}
        <div
          className="rounded-2xl border border-purple-500/20 bg-purple-950/40 p-6 backdrop-blur-sm lg:col-span-2"
          data-testid="weekly-completion-chart"
        >
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-purple-100">Weekly Task Completion</h3>
              <p className="text-sm text-purple-200/50">Tasks completed vs total</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-purple-100">92%</p>
              <p className="text-sm text-green-400">Completion rate</p>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyTaskData} barGap={8}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(168,85,247,0.1)" />
                <XAxis dataKey="day" stroke="rgba(168,85,247,0.6)" fontSize={12} />
                <YAxis stroke="rgba(168,85,247,0.6)" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="total"
                  fill="rgba(168,85,247,0.2)"
                  radius={[4, 4, 0, 0]}
                  name="Total"
                />
                <Bar dataKey="completed" fill="#a855f7" radius={[4, 4, 0, 0]} name="Completed" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Task Distribution */}
        <div
          className="rounded-2xl border border-purple-500/20 bg-purple-950/40 p-6 backdrop-blur-sm"
          data-testid="task-distribution-chart"
        >
          <h3 className="mb-2 font-semibold text-purple-100">Task Distribution</h3>
          <p className="mb-4 text-sm text-purple-200/50">By category this month</p>
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
                <span className="text-purple-200/60">{task.name}</span>
                <span className="ml-auto text-purple-100">{task.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Household Tasks */}
        <div
          className="overflow-hidden rounded-2xl border border-purple-500/20 bg-purple-950/40 backdrop-blur-sm"
          data-testid="household-tasks"
        >
          <div className="flex items-center justify-between border-b border-purple-500/20 p-6">
            <div className="flex items-center gap-3">
              <Home className="h-5 w-5 text-purple-400" />
              <div>
                <h3 className="font-semibold text-purple-100">Household Tasks</h3>
                <p className="text-sm text-purple-200/50">Today&apos;s roster</p>
              </div>
            </div>
          </div>
          <div className="space-y-3 p-4">
            {loading ? (
              <div className="p-4 text-sm text-purple-200/50">Loading tasks…</div>
            ) : pendingTasks.length === 0 ? (
              <div className="p-4 text-sm text-purple-200/50">No tasks assigned</div>
            ) : (
              pendingTasks.map((task) => {
                const done = isCompleted(task)
                const Icon = done
                  ? CheckCircle
                  : (task as { priority?: string }).priority === "High"
                    ? AlertCircle
                    : Circle
                const iconColor = done
                  ? "text-green-400"
                  : (task as { priority?: string }).priority === "High"
                    ? "text-amber-400"
                    : "text-purple-200/40"
                return (
                  <div
                    key={task.id}
                    className="group flex cursor-pointer items-center gap-4 rounded-xl border border-purple-500/10 bg-purple-950/50 p-4 transition-colors hover:bg-purple-950/70"
                    data-testid={`task-${task.id}`}
                  >
                    <Icon className={`h-5 w-5 ${iconColor}`} />
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/20">
                      <Sparkles className="h-4 w-4 text-purple-400" />
                    </div>
                    <div className="flex-1">
                      <p
                        className={
                          done ? "text-purple-200/50 line-through" : "font-medium text-purple-100"
                        }
                      >
                        {task.title}
                      </p>
                      <p className="text-sm text-purple-200/40">
                        {done
                          ? `Completed ${task.completedDate ? new Date(task.completedDate).toLocaleTimeString() : ""}`
                          : task.dueDate
                            ? `Due ${new Date(task.dueDate).toLocaleDateString()}`
                            : ""}
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-purple-400/40 group-hover:text-purple-400/60" />
                  </div>
                )
              })
            )}
          </div>
          <div className="border-t border-purple-500/20 p-4">
            <button className="w-full text-center text-sm font-medium text-purple-400 hover:text-purple-300">
              View weekly schedule
            </button>
          </div>
        </div>

        {/* Meal Planning */}
        <div
          className="overflow-hidden rounded-2xl border border-purple-500/20 bg-purple-950/40 backdrop-blur-sm"
          data-testid="meal-planning"
        >
          <div className="flex items-center justify-between border-b border-purple-500/20 p-6">
            <div className="flex items-center gap-3">
              <UtensilsCrossed className="h-5 w-5 text-purple-400" />
              <div>
                <h3 className="font-semibold text-purple-100">Meal Planning</h3>
                <p className="text-sm text-purple-200/50">Upcoming meals</p>
              </div>
            </div>
            <button className="rounded-lg border border-purple-500/30 bg-purple-500/20 px-3 py-1.5 text-sm font-medium text-purple-400 transition-colors hover:bg-purple-500/30">
              + Add Meal
            </button>
          </div>
          <div className="space-y-4 p-4">
            {mealSchedule.map((meal, index) => (
              <div
                key={index}
                className={`rounded-xl p-4 ${meal.status === "in_progress" ? "border border-purple-500/30 bg-purple-500/20" : "border border-purple-500/10 bg-purple-950/50"}`}
              >
                <div className="mb-3 flex items-center justify-between">
                  <span className="font-medium text-purple-100">{meal.day}</span>
                  {meal.status === "in_progress" && (
                    <span className="rounded-full border border-purple-500/40 bg-purple-500/30 px-2 py-1 text-xs text-purple-300">
                      Active
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div>
                    <p className="mb-1 text-purple-200/50">Breakfast</p>
                    <p className="text-purple-100">{meal.breakfast}</p>
                  </div>
                  <div>
                    <p className="mb-1 text-purple-200/50">Lunch</p>
                    <p className="text-purple-100">{meal.lunch}</p>
                  </div>
                  <div>
                    <p className="mb-1 text-purple-200/50">Dinner</p>
                    <p className="text-purple-100">{meal.dinner}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* My Documents */}
        <div
          className="overflow-hidden rounded-2xl border border-purple-500/20 bg-purple-950/40 backdrop-blur-sm"
          data-testid="my-documents"
        >
          <div className="flex items-center justify-between border-b border-purple-500/20 p-6">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-purple-400" />
              <div>
                <h3 className="font-semibold text-purple-100">My Documents</h3>
                <p className="text-sm text-purple-200/50">Signed agreements</p>
              </div>
            </div>
          </div>
          <div className="space-y-3 p-4">
            {loading ? (
              <div className="p-4 text-sm text-purple-200/50">Loading documents…</div>
            ) : documents.length === 0 ? (
              <div className="p-4 text-sm text-purple-200/50">No documents</div>
            ) : (
              documents.slice(0, 5).map((doc) => {
                const name = doc.name ?? doc.title ?? "Document"
                const isSigned =
                  doc.status === "signed" ||
                  !!doc.signedAt ||
                  (doc.signedBy && doc.signedBy.length > 0)
                return (
                  <div
                    key={doc.id}
                    className="group flex cursor-pointer items-center gap-4 rounded-xl border border-purple-500/10 bg-purple-950/50 p-4 transition-colors hover:bg-purple-950/70"
                  >
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-lg ${isSigned ? "bg-green-500/20" : "bg-amber-500/20"}`}
                    >
                      <CheckCircle
                        className={`h-5 w-5 ${isSigned ? "text-green-400" : "text-amber-400"}`}
                      />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-purple-100">{name}</p>
                      <p className="text-sm text-purple-200/50">
                        {isSigned && (doc.signedAt || doc.lastReview)
                          ? `Signed ${new Date(doc.signedAt ?? doc.lastReview!).toLocaleDateString()}`
                          : (doc.status ?? "Pending")}
                      </p>
                    </div>
                    <button className="text-sm text-purple-400 hover:text-purple-300">View</button>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Weekly Schedule Preview */}
        <div
          className="overflow-hidden rounded-2xl border border-purple-500/20 bg-purple-950/40 backdrop-blur-sm"
          data-testid="weekly-schedule"
        >
          <div className="border-b border-purple-500/20 p-6">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-purple-400" />
              <div>
                <h3 className="font-semibold text-purple-100">This Week&apos;s Schedule</h3>
                <p className="text-sm text-purple-200/50">Household task roster</p>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-7 gap-2">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, index) => {
                const isToday = index === 3
                return (
                  <div
                    key={day}
                    className={`rounded-xl p-3 text-center ${isToday ? "border border-purple-500/40 bg-purple-500/30" : "border border-purple-500/10 bg-purple-950/50"}`}
                  >
                    <p
                      className={`mb-1 text-sm font-medium ${isToday ? "text-purple-300" : "text-purple-200/60"}`}
                    >
                      {day}
                    </p>
                    <p
                      className={`text-lg font-bold ${isToday ? "text-purple-100" : "text-purple-100/80"}`}
                    >
                      {16 + index}
                    </p>
                    <div className="mt-2 space-y-1">
                      {index < 5 && (
                        <>
                          <div className="h-1 rounded-full bg-purple-500/60" />
                          <div className="h-1 rounded-full bg-amber-500/60" />
                        </>
                      )}
                      {index === 5 && <div className="h-1 rounded-full bg-purple-500/40" />}
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="mt-4 flex items-center gap-4 text-sm text-purple-200/60">
              <div className="flex items-center gap-2">
                <div className="h-1 w-3 rounded-full bg-purple-500/60" />
                <span>Cleaning</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-1 w-3 rounded-full bg-amber-500/60" />
                <span>Cooking</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
