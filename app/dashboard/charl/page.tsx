"use client"

import { useState } from "react"
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
} from "lucide-react"

// Task Item Component
function TaskItem({
  title,
  project,
  priority,
  dueDate,
  status,
}: {
  title: string
  project: string
  priority: "high" | "medium" | "low"
  dueDate: string
  status: "not_started" | "in_progress" | "completed"
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
    <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer group">
      <button className="shrink-0">
        {statusIcons[status]}
      </button>
      <div className="flex-1 min-w-0">
        <p className={`font-medium ${status === "completed" ? "text-white/50 line-through" : "text-white"}`}>
          {title}
        </p>
        <p className="text-white/50 text-sm">{project}</p>
      </div>
      <div className={`px-2 py-1 rounded-full text-xs font-medium ${priorityColors[priority]}`}>
        {priority}
      </div>
      <p className="text-white/40 text-sm">{dueDate}</p>
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
    checked_out: "Checked Out",
    maintenance: "Maintenance",
  }

  return (
    <div className="p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer">
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

export default function CharlDashboard() {
  const [isClockRunning, setIsClockRunning] = useState(true)
  const [clockTime, setClockTime] = useState("06:42:15")

  return (
    <DashboardLayout persona="charl">
      {/* Time Clock Banner */}
      <div className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-amber-600/20 to-amber-800/20 border border-amber-500/30">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-amber-500/20 flex items-center justify-center">
              <Clock className="w-8 h-8 text-amber-400" />
            </div>
            <div>
              <p className="text-white/60 text-sm">Today's Work Time</p>
              <p className="text-4xl font-bold text-white font-mono">{clockTime}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsClockRunning(!isClockRunning)}
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

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
          <p className="text-white/60 text-sm">Tasks Today</p>
          <p className="text-2xl font-bold text-white">5</p>
          <p className="text-amber-400 text-sm">3 completed</p>
        </div>
        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
          <p className="text-white/60 text-sm">Hours This Week</p>
          <p className="text-2xl font-bold text-white">38.5</p>
          <p className="text-green-400 text-sm">On track</p>
        </div>
        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
          <p className="text-white/60 text-sm">Assets Checked</p>
          <p className="text-2xl font-bold text-white">2</p>
          <p className="text-white/50 text-sm">Drill, Grinder</p>
        </div>
        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
          <p className="text-white/60 text-sm">Leave Balance</p>
          <p className="text-2xl font-bold text-white">15</p>
          <p className="text-white/50 text-sm">days remaining</p>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* My Tasks */}
        <div className="bg-[#0d0d12] border border-white/10 rounded-2xl overflow-hidden">
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
          <div className="p-4 space-y-3">
            <TaskItem
              title="Service Toyota Hilux"
              project="Vehicle Maintenance"
              priority="high"
              dueDate="Today"
              status="in_progress"
            />
            <TaskItem
              title="Organize workshop tools"
              project="Workshop"
              priority="medium"
              dueDate="Today"
              status="completed"
            />
            <TaskItem
              title="Repair fence section B"
              project="Property Maintenance"
              priority="medium"
              dueDate="Tomorrow"
              status="not_started"
            />
            <TaskItem
              title="Install new light fixtures"
              project="House"
              priority="low"
              dueDate="This week"
              status="not_started"
            />
            <TaskItem
              title="Clean workshop floor"
              project="Workshop"
              priority="low"
              dueDate="Today"
              status="completed"
            />
          </div>
        </div>

        {/* Assets */}
        <div className="bg-[#0d0d12] border border-white/10 rounded-2xl overflow-hidden">
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
              name="Socket Set"
              id="WS-004"
              status="available"
              location="Workshop"
            />
            <AssetCard
              name="Workbench"
              id="WS-003"
              status="available"
              location="Workshop"
            />
          </div>
        </div>

        {/* Vehicle Log */}
        <div className="bg-[#0d0d12] border border-white/10 rounded-2xl overflow-hidden lg:col-span-2">
          <div className="p-6 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Car className="w-5 h-5 text-amber-400" />
              <div>
                <h3 className="text-white font-semibold">Vehicle Log</h3>
                <p className="text-white/50 text-sm">Toyota Hilux - Current Trip</p>
              </div>
            </div>
            <button className="px-4 py-2 rounded-xl bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 transition-colors text-sm font-medium">
              End Trip
            </button>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
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
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
