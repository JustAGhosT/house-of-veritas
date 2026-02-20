"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { useRouter, usePathname } from "next/navigation"

interface User {
  id: string
  name: string
  email: string
  phone: string
  role: string
  description: string
  color: string
  icon: string
  specialty: string[]
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Storage keys
const USER_STORAGE_KEY = "hov_user"

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  // Load user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem(USER_STORAGE_KEY)
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (e) {
        localStorage.removeItem(USER_STORAGE_KEY)
      }
    }
    setIsLoading(false)
  }, [])

  // Protect routes
  useEffect(() => {
    if (isLoading) return

    const isAuthPage = pathname === "/login"
    const isDashboardPage = pathname?.startsWith("/dashboard")

    if (!user && isDashboardPage) {
      // Not logged in, trying to access dashboard
      router.push("/login")
    } else if (user && isAuthPage) {
      // Logged in, on login page - redirect to their dashboard
      router.push(`/dashboard/${user.id}`)
    } else if (user && isDashboardPage) {
      // Check if user is accessing their own dashboard or has permission
      const dashboardUser = pathname?.split("/")[2]
      if (dashboardUser && dashboardUser !== user.id) {
        // Only Hans (admin) can view other dashboards
        if (user.id !== "hans") {
          router.push(`/dashboard/${user.id}`)
        }
      }
    }
  }, [user, isLoading, pathname, router])

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        return { success: false, error: data.error || "Login failed" }
      }

      // Store user in state and localStorage
      setUser(data.user)
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(data.user))

      // Redirect to user's dashboard
      router.push(data.redirectTo)

      return { success: true }
    } catch (error) {
      return { success: false, error: "Connection error. Please try again." }
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem(USER_STORAGE_KEY)
    router.push("/login")
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

// HOC to protect pages
export function withAuth<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  options?: { allowedUsers?: string[] }
) {
  return function ProtectedComponent(props: P) {
    const { user, isLoading, isAuthenticated } = useAuth()
    const router = useRouter()

    useEffect(() => {
      if (!isLoading && !isAuthenticated) {
        router.push("/login")
      }

      // Check if user is allowed to access this page
      if (!isLoading && user && options?.allowedUsers) {
        if (!options.allowedUsers.includes(user.id) && user.id !== "hans") {
          router.push(`/dashboard/${user.id}`)
        }
      }
    }, [isLoading, isAuthenticated, user, router])

    if (isLoading) {
      return (
        <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
        </div>
      )
    }

    if (!isAuthenticated) {
      return null
    }

    return <WrappedComponent {...props} />
  }
}
