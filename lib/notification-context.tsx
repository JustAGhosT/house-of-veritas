"use client"

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react"

export interface Notification {
  id: string
  type: "task" | "approval" | "document" | "expense" | "alert" | "system"
  title: string
  message: string
  timestamp: Date
  read: boolean
  actionUrl?: string
  userId: string // Target user
  fromUser?: string // Who triggered it
  priority?: "low" | "medium" | "high"
}

interface NotificationContextType {
  notifications: Notification[]
  unreadCount: number
  addNotification: (notification: Omit<Notification, "id" | "timestamp" | "read">) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  clearNotification: (id: string) => void
  clearAll: () => void
  getNotificationsForUser: (userId: string) => Notification[]
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

const STORAGE_KEY = "hov_notifications"

// Initial demo notifications
const initialNotifications: Notification[] = [
  {
    id: "1",
    type: "approval",
    title: "Expense Pending Approval",
    message: "Charl submitted R850 expense for Workshop Materials",
    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 min ago
    read: false,
    actionUrl: "/dashboard/hans",
    userId: "hans",
    fromUser: "charl",
    priority: "high",
  },
  {
    id: "2",
    type: "approval",
    title: "Leave Request",
    message: "Charl requested 3 days annual leave (Dec 20-22)",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    read: false,
    actionUrl: "/dashboard/hans",
    userId: "hans",
    fromUser: "charl",
    priority: "medium",
  },
  {
    id: "3",
    type: "task",
    title: "New Task Assigned",
    message: "Fix electrical outlet - Kitchen assigned to you",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3), // 3 hours ago
    read: false,
    actionUrl: "/dashboard/charl",
    userId: "charl",
    fromUser: "hans",
    priority: "high",
  },
  {
    id: "4",
    type: "document",
    title: "Document Expiring Soon",
    message: "Emergency Contact List expires in 7 days",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
    read: false,
    actionUrl: "/dashboard/hans",
    userId: "hans",
    priority: "high",
  },
  {
    id: "5",
    type: "task",
    title: "Task Completed",
    message: "Lucky completed 'Weekly lawn mowing'",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 hours ago
    read: true,
    userId: "hans",
    fromUser: "lucky",
    priority: "low",
  },
  {
    id: "6",
    type: "expense",
    title: "Expense Approved",
    message: "Your fuel expense (R280) has been approved by Hans",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6), // 6 hours ago
    read: false,
    userId: "lucky",
    fromUser: "hans",
    priority: "medium",
  },
  {
    id: "7",
    type: "task",
    title: "Meal Reminder",
    message: "Dinner preparation starts at 3:00 PM - Lamb Curry",
    timestamp: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
    read: false,
    actionUrl: "/dashboard/irma",
    userId: "irma",
    priority: "medium",
  },
  {
    id: "8",
    type: "system",
    title: "Time Clock Reminder",
    message: "Don't forget to clock out at end of shift",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8), // 8 hours ago
    read: true,
    userId: "charl",
    priority: "low",
  },
  {
    id: "9",
    type: "alert",
    title: "Irrigation Leak Detected",
    message: "Zone 3 irrigation system has a detected leak - requires attention",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    read: false,
    actionUrl: "/dashboard/lucky",
    userId: "lucky",
    priority: "high",
  },
  {
    id: "10",
    type: "approval",
    title: "Expense Pending",
    message: "Lucky submitted R320 expense for Garden Supplies",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3), // 3 hours ago
    read: false,
    actionUrl: "/dashboard/hans",
    userId: "hans",
    fromUser: "lucky",
    priority: "medium",
  },
]

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>(() => {
    if (typeof window === 'undefined') return initialNotifications
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        return parsed.map((n: any) => ({ ...n, timestamp: new Date(n.timestamp) }))
      } catch {
        return initialNotifications
      }
    }
    return initialNotifications
  })

  // Save to localStorage when notifications change
  useEffect(() => {
    if (notifications.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications))
    }
  }, [notifications])

  const addNotification = useCallback((notification: Omit<Notification, "id" | "timestamp" | "read">) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date(),
      read: false,
    }
    setNotifications((prev) => [newNotification, ...prev])
  }, [])

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    )
  }, [])

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }, [])

  const clearNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }, [])

  const clearAll = useCallback(() => {
    setNotifications([])
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  const getNotificationsForUser = useCallback(
    (userId: string) => {
      // Hans can see all notifications, others only see their own
      if (userId === "hans") {
        return notifications.filter((n) => n.userId === "hans")
      }
      return notifications.filter((n) => n.userId === userId)
    },
    [notifications]
  )

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        clearNotification,
        clearAll,
        getNotificationsForUser,
      }}
    >
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error("useNotifications must be used within a NotificationProvider")
  }
  return context
}
