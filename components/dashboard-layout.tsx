"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { NotificationPanel } from "@/components/notification-panel"
import { RealTimeIndicator } from "@/components/realtime-indicator"
import { SimpleGridBackground } from "@/components/grid-room-background"
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
  ChevronDown,
  BarChart3,
  Calendar,
  Wrench,
  Boxes,
  ScanLine,
  Store,
  CheckSquare,
} from "lucide-react"

// Navigation items per role
const NAV_ITEMS = {
  hans: [
    { name: "Overview", href: "/dashboard/hans", icon: Home },
    { name: "Approvals", href: "/dashboard/hans/approvals", icon: CheckSquare },
    { name: "Calendar", href: "/dashboard/hans/calendar", icon: Calendar },
    { name: "Documents", href: "/dashboard/hans/documents", icon: FileText },
    { name: "Employees", href: "/dashboard/hans/employees", icon: Users },
    { name: "Tasks", href: "/dashboard/hans/tasks", icon: ClipboardList },
    { name: "Payroll", href: "/dashboard/hans/payroll", icon: DollarSign },
    { name: "Assets", href: "/dashboard/hans/assets", icon: Package },
    { name: "Inventory", href: "/dashboard/hans/inventory", icon: Boxes },
    { name: "OCR Scanner", href: "/dashboard/hans/ocr", icon: ScanLine },
    { name: "Marketplace", href: "/dashboard/hans/marketplace", icon: Store },
    { name: "Maintenance", href: "/dashboard/hans/maintenance", icon: Wrench },
    { name: "Time & Attendance", href: "/dashboard/hans/time", icon: Clock },
    { name: "Expenses", href: "/dashboard/hans/expenses", icon: DollarSign },
    { name: "Vehicles", href: "/dashboard/hans/vehicles", icon: Car },
    { name: "Reports", href: "/dashboard/hans/reports", icon: BarChart3 },
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
    { name: "Inventory", href: "/dashboard/lucky/inventory", icon: Boxes },
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
  const router = useRouter()
  const { user, logout, isLoading, isAuthenticated } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Auth protection
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login")
    }
  }, [isLoading, isAuthenticated, router])

  // Permission check - only Hans can access other dashboards
  useEffect(() => {
    if (!isLoading && user) {
      const dashboardOwner = pathname?.split("/")[2]
      if (dashboardOwner && dashboardOwner !== user.id && user.id !== "hans") {
        router.push(`/dashboard/${user.id}`)
      }
    }
  }, [isLoading, user, pathname, router])

  // Show loading while checking auth
  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
      </div>
    )
  }

  const navItems = NAV_ITEMS[persona]
  const personaInfo = PERSONA_INFO[persona]

  const colorClasses = {
    blue: "from-blue-600 to-blue-800",
    amber: "from-amber-600 to-amber-800",
    green: "from-green-600 to-green-800",
    purple: "from-purple-600 to-purple-800",
  }

  const handleLogout = () => {
    logout()
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] relative">
      {/* Grid Background */}
      <SimpleGridBackground />
      
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

          {/* Admin: View Other Dashboards */}
          {user?.id === "hans" && persona === "hans" && (
            <div className="pt-4 mt-4 border-t border-white/10">
              <p className="px-4 text-white/40 text-xs uppercase tracking-wider mb-2">View Team</p>
              {["charl", "lucky", "irma"].map((userId) => {
                const info = PERSONA_INFO[userId as keyof typeof PERSONA_INFO]
                return (
                  <Link
                    key={userId}
                    href={`/dashboard/${userId}`}
                    className="flex items-center gap-3 px-4 py-2 rounded-xl text-white/60 hover:text-white hover:bg-white/5 transition-all"
                  >
                    <span className="text-lg">{info.icon}</span>
                    <span className="text-sm">{info.name}</span>
                  </Link>
                )
              })}
            </div>
          )}
        </nav>

        {/* User Info */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
            <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${colorClasses[personaInfo.color as keyof typeof colorClasses]} flex items-center justify-center text-lg`}>
              {personaInfo.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">{user?.name || personaInfo.name}</p>
              <p className="text-white/50 text-xs truncate">{user?.role || personaInfo.role}</p>
            </div>
            <button 
              onClick={handleLogout}
              className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors"
              data-testid="logout-button"
            >
              <LogOut className="w-4 h-4" />
            </button>
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
                Welcome back, {user?.name || personaInfo.name}
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
              {/* Real-time Status Indicator */}
              <RealTimeIndicator />
              
              {/* Notifications */}
              <NotificationPanel />

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="hidden md:flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors text-sm"
                data-testid="header-logout"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
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
