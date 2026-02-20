"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Home,
  FileText,
  Users,
  Package,
  ClipboardList,
  Clock,
  Car,
  AlertTriangle,
  DollarSign,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  ChevronDown,
} from "lucide-react"

// Navigation items per role
const NAV_ITEMS = {
  hans: [
    { name: "Overview", href: "/dashboard/hans", icon: Home },
    { name: "Documents", href: "/dashboard/hans/documents", icon: FileText },
    { name: "Employees", href: "/dashboard/hans/employees", icon: Users },
    { name: "Tasks", href: "/dashboard/hans/tasks", icon: ClipboardList },
    { name: "Assets", href: "/dashboard/hans/assets", icon: Package },
    { name: "Time & Attendance", href: "/dashboard/hans/time", icon: Clock },
    { name: "Expenses", href: "/dashboard/hans/expenses", icon: DollarSign },
    { name: "Vehicles", href: "/dashboard/hans/vehicles", icon: Car },
    { name: "Incidents", href: "/dashboard/hans/incidents", icon: AlertTriangle },
    { name: "Settings", href: "/dashboard/hans/settings", icon: Settings },
  ],
  charl: [
    { name: "My Dashboard", href: "/dashboard/charl", icon: Home },
    { name: "My Tasks", href: "/dashboard/charl/tasks", icon: ClipboardList },
    { name: "Time Clock", href: "/dashboard/charl/time", icon: Clock },
    { name: "Assets", href: "/dashboard/charl/assets", icon: Package },
    { name: "Vehicle Log", href: "/dashboard/charl/vehicles", icon: Car },
    { name: "My Documents", href: "/dashboard/charl/documents", icon: FileText },
  ],
  lucky: [
    { name: "My Dashboard", href: "/dashboard/lucky", icon: Home },
    { name: "My Tasks", href: "/dashboard/lucky/tasks", icon: ClipboardList },
    { name: "Time Clock", href: "/dashboard/lucky/time", icon: Clock },
    { name: "Expenses", href: "/dashboard/lucky/expenses", icon: DollarSign },
    { name: "Vehicle Log", href: "/dashboard/lucky/vehicles", icon: Car },
    { name: "My Documents", href: "/dashboard/lucky/documents", icon: FileText },
  ],
  irma: [
    { name: "My Dashboard", href: "/dashboard/irma", icon: Home },
    { name: "Household Tasks", href: "/dashboard/irma/tasks", icon: ClipboardList },
    { name: "My Documents", href: "/dashboard/irma/documents", icon: FileText },
  ],
}

const PERSONA_INFO = {
  hans: { name: "Hans", role: "Owner & Administrator", color: "blue", icon: "👔" },
  charl: { name: "Charl", role: "Workshop Operator", color: "amber", icon: "🔧" },
  lucky: { name: "Lucky", role: "Gardener & Handyman", color: "green", icon: "🌿" },
  irma: { name: "Irma", role: "Resident", color: "purple", icon: "🏠" },
}

interface DashboardLayoutProps {
  children: React.ReactNode
  persona: "hans" | "charl" | "lucky" | "irma"
}

export default function DashboardLayout({ children, persona }: DashboardLayoutProps) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)

  const navItems = NAV_ITEMS[persona]
  const personaInfo = PERSONA_INFO[persona]

  const colorClasses = {
    blue: "from-blue-600 to-blue-800",
    amber: "from-amber-600 to-amber-800",
    green: "from-green-600 to-green-800",
    purple: "from-purple-600 to-purple-800",
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-full w-64 bg-[#0d0d12] border-r border-white/10
          transform transition-transform duration-300 lg:translate-x-0
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Logo */}
        <div className="p-6 border-b border-white/10">
          <Link href="/" className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${colorClasses[personaInfo.color as keyof typeof colorClasses]} flex items-center justify-center`}>
              <span className="text-white font-bold text-lg">HV</span>
            </div>
            <div>
              <h1 className="text-white font-semibold text-sm">House of Veritas</h1>
              <p className="text-white/50 text-xs">Dashboard</p>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1 overflow-y-auto h-[calc(100%-180px)]">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl transition-all
                  ${isActive
                    ? `bg-gradient-to-r ${colorClasses[personaInfo.color as keyof typeof colorClasses]} text-white`
                    : "text-white/60 hover:text-white hover:bg-white/5"
                  }
                `}
              >
                <Icon className="w-5 h-5" />
                <span className="text-sm font-medium">{item.name}</span>
              </Link>
            )
          })}
        </nav>

        {/* User Info */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
            <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${colorClasses[personaInfo.color as keyof typeof colorClasses]} flex items-center justify-center text-lg`}>
              {personaInfo.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">{personaInfo.name}</p>
              <p className="text-white/50 text-xs truncate">{personaInfo.role}</p>
            </div>
            <Link href="/login" className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors">
              <LogOut className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-[#0a0a0f]/80 backdrop-blur-xl border-b border-white/10">
          <div className="flex items-center justify-between px-6 py-4">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Page Title - Hidden on mobile */}
            <div className="hidden lg:block">
              <h2 className="text-white font-semibold">
                Welcome back, {personaInfo.name}
              </h2>
              <p className="text-white/50 text-sm">
                {new Date().toLocaleDateString("en-ZA", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-4">
              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                  className="relative p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors"
                >
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                </button>

                {notificationsOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-[#0d0d12] border border-white/10 rounded-xl shadow-2xl overflow-hidden">
                    <div className="p-4 border-b border-white/10">
                      <h3 className="text-white font-semibold">Notifications</h3>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      <div className="p-4 hover:bg-white/5 border-b border-white/5">
                        <p className="text-white text-sm">Document requires signature</p>
                        <p className="text-white/50 text-xs mt-1">2 hours ago</p>
                      </div>
                      <div className="p-4 hover:bg-white/5 border-b border-white/5">
                        <p className="text-white text-sm">New task assigned</p>
                        <p className="text-white/50 text-xs mt-1">5 hours ago</p>
                      </div>
                      <div className="p-4 hover:bg-white/5">
                        <p className="text-white text-sm">Leave request approved</p>
                        <p className="text-white/50 text-xs mt-1">1 day ago</p>
                      </div>
                    </div>
                    <div className="p-3 border-t border-white/10">
                      <button className="w-full text-center text-sm text-blue-400 hover:text-blue-300">
                        View all notifications
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Quick Actions */}
              <Link
                href="/login"
                className="hidden md:flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors text-sm"
              >
                <span>Switch User</span>
                <ChevronDown className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
