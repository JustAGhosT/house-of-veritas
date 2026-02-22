"use client"

import { useState } from "react"
import { useRealTime, useEmitEvent } from "@/lib/hooks/use-realtime"
import { useAuth } from "@/lib/auth-context"
import { useNotifications } from "@/lib/notification-context"
import { RealTimeEvent } from "@/lib/realtime/event-store"
import { logger } from "@/lib/logger"
import {
  Wifi,
  WifiOff,
  Activity,
  Bell,
  CheckCircle,
  Clock,
  DollarSign,
  ClipboardList,
  AlertTriangle,
  X,
} from "lucide-react"

interface RealTimeProviderProps {
  children: React.ReactNode
}

// Event type icons and colors
const eventConfig: Record<string, { icon: any; color: string; label: string }> = {
  task_created: { icon: ClipboardList, color: "text-blue-400", label: "New Task" },
  task_updated: { icon: ClipboardList, color: "text-amber-400", label: "Task Updated" },
  task_completed: { icon: CheckCircle, color: "text-green-400", label: "Task Completed" },
  expense_created: { icon: DollarSign, color: "text-purple-400", label: "New Expense" },
  expense_approved: { icon: DollarSign, color: "text-green-400", label: "Expense Approved" },
  expense_rejected: { icon: DollarSign, color: "text-red-400", label: "Expense Rejected" },
  clock_in: { icon: Clock, color: "text-green-400", label: "Clocked In" },
  clock_out: { icon: Clock, color: "text-amber-400", label: "Clocked Out" },
  notification: { icon: Bell, color: "text-blue-400", label: "Notification" },
  approval_required: { icon: AlertTriangle, color: "text-amber-400", label: "Approval Required" },
  system_alert: { icon: AlertTriangle, color: "text-red-400", label: "System Alert" },
}

export function RealTimeIndicator() {
  const { user } = useAuth()
  const { addNotification } = useNotifications()
  const [showToast, setShowToast] = useState(false)
  const [toastEvent, setToastEvent] = useState<RealTimeEvent | null>(null)

  const handleEvent = (event: RealTimeEvent) => {
    // Show toast for important events
    if (["approval_required", "system_alert", "task_created", "expense_approved", "expense_rejected"].includes(event.type)) {
      setToastEvent(event)
      setShowToast(true)
      
      // Auto-hide after 5 seconds
      setTimeout(() => setShowToast(false), 5000)

      // Also add to notifications
      if (event.type !== "system_alert") {
        addNotification({
          type: event.type.includes("task") ? "task" : event.type.includes("expense") ? "expense" : "system",
          title: eventConfig[event.type]?.label || "Update",
          message: event.data?.title || event.data?.message || JSON.stringify(event.data),
          userId: user?.id || "hans",
          priority: event.type === "approval_required" ? "high" : "medium",
        })
      }
    }
  }

  const { isConnected, lastEvent, events } = useRealTime({
    userId: user?.id || "hans",
    onEvent: handleEvent,
    onConnect: () => logger.info("Real-time connected"),
    onDisconnect: () => logger.info("Real-time disconnected"),
  })

  const config = toastEvent ? eventConfig[toastEvent.type] : null
  const ToastIcon = config?.icon || Activity

  return (
    <>
      {/* Connection Status Indicator */}
      <div className="flex items-center gap-2">
        <div
          className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs ${
            isConnected
              ? "bg-green-500/10 text-green-400"
              : "bg-red-500/10 text-red-400"
          }`}
          title={isConnected ? "Real-time updates active" : "Disconnected - attempting to reconnect"}
        >
          {isConnected ? (
            <>
              <Wifi className="w-3 h-3" />
              <span className="hidden sm:inline">Live</span>
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            </>
          ) : (
            <>
              <WifiOff className="w-3 h-3" />
              <span className="hidden sm:inline">Offline</span>
            </>
          )}
        </div>
      </div>

      {/* Toast Notification */}
      {showToast && toastEvent && (
        <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
          <div className="bg-[#0d0d12] border border-white/10 rounded-xl p-4 shadow-2xl max-w-sm">
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-lg bg-white/5 ${config?.color}`}>
                <ToastIcon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium text-sm">
                  {config?.label || "Update"}
                </p>
                <p className="text-white/60 text-sm mt-1 line-clamp-2">
                  {toastEvent.data?.title || toastEvent.data?.message || "New update received"}
                </p>
                <p className="text-white/40 text-xs mt-2">
                  Just now
                </p>
              </div>
              <button
                onClick={() => setShowToast(false)}
                className="p-1 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// Activity Feed Component for dashboards
export function RealTimeActivityFeed({ maxItems = 5 }: { maxItems?: number }) {
  const { user } = useAuth()
  const { events } = useRealTime({
    userId: user?.id || "hans",
  })

  const recentEvents = events.slice(0, maxItems)

  if (recentEvents.length === 0) {
    return (
      <div className="text-center py-8 text-white/40">
        <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No recent activity</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {recentEvents.map((event) => {
        const config = eventConfig[event.type] || { icon: Activity, color: "text-white/60", label: "Event" }
        const Icon = config.icon

        return (
          <div
            key={event.id}
            className="flex items-start gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
          >
            <div className={`p-2 rounded-lg bg-white/5 ${config.color}`}>
              <Icon className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium">{config.label}</p>
              <p className="text-white/50 text-xs mt-0.5 line-clamp-1">
                {event.data?.title || event.data?.message || event.data?.name || "Activity"}
              </p>
            </div>
            <span className="text-white/30 text-xs whitespace-nowrap">
              {formatTimeAgo(event.timestamp)}
            </span>
          </div>
        )
      })}
    </div>
  )
}

function formatTimeAgo(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - new Date(date).getTime()
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHour = Math.floor(diffMin / 60)

  if (diffSec < 60) return "Just now"
  if (diffMin < 60) return `${diffMin}m ago`
  if (diffHour < 24) return `${diffHour}h ago`
  return new Date(date).toLocaleDateString()
}

export default RealTimeIndicator
