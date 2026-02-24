"use client"

import { useState, useEffect, useCallback } from "react"
import {
  Clock,
  CheckCircle,
  XCircle,
  DollarSign,
  FileText,
  User,
  Settings,
  Upload,
  LogIn,
  LogOut,
  ClipboardList,
  AlertTriangle,
  Filter,
  Download,
} from "lucide-react"
import type { AuditLogEntry, AuditAction } from "@/lib/audit-log"
import { logger } from "@/lib/logger"
import { apiFetch } from "@/lib/api-client"

const ACTION_CONFIG: Record<AuditAction, { icon: any; color: string; label: string }> = {
  login: { icon: LogIn, color: "text-green-400", label: "Logged in" },
  logout: { icon: LogOut, color: "text-amber-400", label: "Logged out" },
  task_created: { icon: ClipboardList, color: "text-blue-400", label: "Created task" },
  task_updated: { icon: ClipboardList, color: "text-amber-400", label: "Updated task" },
  task_completed: { icon: CheckCircle, color: "text-green-400", label: "Completed task" },
  task_deleted: { icon: XCircle, color: "text-red-400", label: "Deleted task" },
  expense_submitted: { icon: DollarSign, color: "text-purple-400", label: "Submitted expense" },
  expense_approved: { icon: DollarSign, color: "text-green-400", label: "Approved expense" },
  expense_rejected: { icon: DollarSign, color: "text-red-400", label: "Rejected expense" },
  document_signed: { icon: FileText, color: "text-blue-400", label: "Signed document" },
  document_viewed: { icon: FileText, color: "text-white/60", label: "Viewed document" },
  clock_in: { icon: Clock, color: "text-green-400", label: "Clocked in" },
  clock_out: { icon: Clock, color: "text-amber-400", label: "Clocked out" },
  profile_updated: { icon: User, color: "text-blue-400", label: "Updated profile" },
  password_reset: { icon: Settings, color: "text-amber-400", label: "Reset password" },
  file_uploaded: { icon: Upload, color: "text-purple-400", label: "Uploaded file" },
  file_deleted: { icon: XCircle, color: "text-red-400", label: "Deleted file" },
  settings_changed: { icon: Settings, color: "text-blue-400", label: "Changed settings" },
  user_created: { icon: User, color: "text-green-400", label: "Created user" },
  permission_changed: {
    icon: AlertTriangle,
    color: "text-amber-400",
    label: "Changed permissions",
  },
}

function formatTimeAgo(date: Date | string): string {
  const now = new Date()
  const then = new Date(date)
  const diffMs = now.getTime() - then.getTime()
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHour = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHour / 24)

  if (diffSec < 60) return "Just now"
  if (diffMin < 60) return `${diffMin}m ago`
  if (diffHour < 24) return `${diffHour}h ago`
  if (diffDay < 7) return `${diffDay}d ago`
  return then.toLocaleDateString()
}

interface ActivityTimelineProps {
  userId?: string
  limit?: number
  showFilters?: boolean
  compact?: boolean
}

export function ActivityTimeline({
  userId,
  limit = 20,
  showFilters = true,
  compact = false,
}: ActivityTimelineProps) {
  const [logs, setLogs] = useState<AuditLogEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<AuditAction | "">("")
  const [summary, setSummary] = useState<Record<string, number>>({})

  const fetchLogs = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ limit: limit.toString() })
      if (userId) params.append("userId", userId)
      if (filter) params.append("action", filter)

      const data = await apiFetch<{ logs?: AuditLogEntry[]; summary?: Record<string, number> }>(
        `/api/audit?${params}`,
        { label: "Audit" }
      )
      setLogs(data?.logs || [])
      setSummary(data?.summary || {})
    } catch (error) {
      logger.error("Failed to fetch audit logs", {
        error: error instanceof Error ? error.message : String(error),
      })
    } finally {
      setLoading(false)
    }
  }, [limit, userId, filter])

  useEffect(() => {
    fetchLogs()
  }, [fetchLogs])

  const downloadAuditLog = async () => {
    const params = new URLSearchParams({ format: "csv" })
    if (userId) params.append("userId", userId)
    if (filter) params.append("action", filter)

    const response = await fetch(`/api/audit?${params}`)
    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `audit-log-${new Date().toISOString().split("T")[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-500/30 border-t-blue-500" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      {showFilters && (
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-white/40" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as AuditAction | "")}
              className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
              aria-label="Filter by activity type"
            >
              <option value="">All Activities</option>
              {Object.entries(ACTION_CONFIG).map(([key, { label }]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={downloadAuditLog}
            className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2 text-sm text-white/60 transition-colors hover:bg-white/10 hover:text-white"
          >
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>
      )}

      {/* Activity Summary */}
      {!compact && Object.keys(summary).length > 0 && (
        <div className="flex flex-wrap gap-2">
          {Object.entries(summary)
            .slice(0, 5)
            .map(([action, count]) => {
              const config = ACTION_CONFIG[action as AuditAction]
              if (!config) return null
              return (
                <span
                  key={action}
                  className={`rounded-full bg-white/5 px-2 py-1 text-xs ${config.color}`}
                >
                  {count} {config.label.toLowerCase()}
                </span>
              )
            })}
        </div>
      )}

      {/* Timeline */}
      <div
        className={`space-y-1 ${compact ? "" : "relative before:absolute before:top-0 before:bottom-0 before:left-[23px] before:w-px before:bg-white/10"}`}
      >
        {logs.length === 0 ? (
          <p className="py-8 text-center text-white/50">No activity recorded</p>
        ) : (
          logs.map((log) => {
            const config = ACTION_CONFIG[log.action] || {
              icon: Clock,
              color: "text-white/40",
              label: log.action,
            }
            const Icon = config.icon

            return (
              <div
                key={log.id}
                className={`flex items-start gap-3 ${compact ? "py-2" : "py-3 pl-1"} rounded-lg transition-colors hover:bg-white/5`}
              >
                <div
                  className={`${compact ? "p-1.5" : "p-2"} rounded-lg bg-white/5 ${config.color} relative z-10`}
                >
                  <Icon className={compact ? "h-3 w-3" : "h-4 w-4"} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`font-medium ${compact ? "text-xs" : "text-sm"} text-white`}>
                      {log.userName}
                    </span>
                    <span className={`${compact ? "text-xs" : "text-sm"} text-white/60`}>
                      {config.label.toLowerCase()}
                    </span>
                  </div>
                  {log.resourceName && (
                    <p className={`${compact ? "text-xs" : "text-sm"} truncate text-white/40`}>
                      {log.resourceName}
                    </p>
                  )}
                  <p className="mt-0.5 text-xs text-white/30">{formatTimeAgo(log.timestamp)}</p>
                </div>
                {!log.success && (
                  <span className="rounded bg-red-500/20 px-2 py-0.5 text-xs text-red-400">
                    Failed
                  </span>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

export default ActivityTimeline
