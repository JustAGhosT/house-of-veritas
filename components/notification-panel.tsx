"use client"

import { useState, useRef, useEffect } from "react"
import { useNotifications, Notification } from "@/lib/notification-context"
import { useAuth } from "@/lib/auth-context"
import {
  Bell,
  X,
  Check,
  CheckCheck,
  Trash2,
  ClipboardList,
  FileText,
  DollarSign,
  AlertTriangle,
  Settings,
  ChevronRight,
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"

const typeIcons: Record<string, any> = {
  task: ClipboardList,
  approval: CheckCheck,
  document: FileText,
  expense: DollarSign,
  alert: AlertTriangle,
  system: Settings,
}

const typeColors: Record<string, string> = {
  task: "bg-blue-500/20 text-blue-400",
  approval: "bg-purple-500/20 text-purple-400",
  document: "bg-cyan-500/20 text-cyan-400",
  expense: "bg-green-500/20 text-green-400",
  alert: "bg-red-500/20 text-red-400",
  system: "bg-gray-500/20 text-gray-400",
}

const priorityColors: Record<string, string> = {
  high: "bg-red-500",
  medium: "bg-amber-500",
  low: "bg-green-500",
}

export function NotificationPanel() {
  const [isOpen, setIsOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const { user } = useAuth()
  const {
    getNotificationsForUser,
    markAsRead,
    markAllAsRead,
    clearNotification,
  } = useNotifications()

  const notifications = user ? getNotificationsForUser(user.id) : []
  const unreadCount = notifications.filter((n) => !n.read).length

  // Close panel when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const formatTime = (date: Date) => {
    try {
      return formatDistanceToNow(date, { addSuffix: true })
    } catch {
      return "recently"
    }
  }

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors"
        data-testid="notification-bell"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      {isOpen && (
        <div
          className="absolute right-0 top-full mt-2 w-96 max-h-[500px] bg-[#0d0d12] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50"
          data-testid="notification-panel"
        >
          {/* Header */}
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <div>
              <h3 className="text-white font-semibold">Notifications</h3>
              <p className="text-white/50 text-sm">{unreadCount} unread</p>
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={() => markAllAsRead()}
                  className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors"
                  title="Mark all as read"
                  data-testid="mark-all-read"
                >
                  <CheckCheck className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors"
                data-testid="close-notifications"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-[400px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="w-12 h-12 text-white/20 mx-auto mb-3" />
                <p className="text-white/60">No notifications</p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {notifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onMarkRead={() => markAsRead(notification.id)}
                    onClear={() => clearNotification(notification.id)}
                    formatTime={formatTime}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function NotificationItem({
  notification,
  onMarkRead,
  onClear,
  formatTime,
}: {
  notification: Notification
  onMarkRead: () => void
  onClear: () => void
  formatTime: (date: Date) => string
}) {
  const Icon = typeIcons[notification.type] || Bell

  return (
    <div
      className={`p-4 hover:bg-white/5 transition-colors cursor-pointer group ${
        !notification.read ? "bg-blue-500/5" : ""
      }`}
      onClick={onMarkRead}
      data-testid={`notification-${notification.id}`}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={`p-2 rounded-lg shrink-0 ${typeColors[notification.type]}`}>
          <Icon className="w-4 h-4" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className={`font-medium text-sm ${notification.read ? "text-white/70" : "text-white"}`}>
              {notification.title}
            </p>
            {notification.priority && (
              <span className={`w-2 h-2 rounded-full shrink-0 mt-1.5 ${priorityColors[notification.priority]}`} />
            )}
          </div>
          <p className="text-white/50 text-sm mt-1 line-clamp-2">{notification.message}</p>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-white/40 text-xs">{formatTime(notification.timestamp)}</span>
            {notification.fromUser && (
              <span className="text-white/40 text-xs">
                from <span className="capitalize">{notification.fromUser}</span>
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {!notification.read && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onMarkRead()
              }}
              className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors"
              title="Mark as read"
            >
              <Check className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation()
              onClear()
            }}
            className="p-1.5 rounded-lg hover:bg-red-500/20 text-white/40 hover:text-red-400 transition-colors"
            title="Remove"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Unread indicator */}
      {!notification.read && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-500 rounded-r" />
      )}
    </div>
  )
}

export default NotificationPanel
