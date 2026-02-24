"use client"

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react"
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
  photoUrl?: string
  onboardingStatus?: string
  responsibilities?: string[]
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  const checkSession = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me")
      if (res.ok) {
        const data = await res.json()
        setUser(data.user)
      } else {
        setUser(null)
      }
    } catch {
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    checkSession()
  }, [checkSession])

  useEffect(() => {
    if (isLoading) return

    const isAuthPage = pathname === "/login"
    const isDashboardPage = pathname?.startsWith("/dashboard")
    const isOnboardingPage = pathname === "/onboarding"

    if (!user && isDashboardPage) {
      router.push("/login")
    } else if (user && isAuthPage) {
      router.push(`/dashboard/${user.id}`)
    } else if (user && isOnboardingPage && user.onboardingStatus === "completed") {
      router.push(`/dashboard/${user.id}`)
    } else if (
      user &&
      isDashboardPage &&
      user.role !== "admin" &&
      user.onboardingStatus !== "completed"
    ) {
      router.push("/onboarding")
    } else if (user && isDashboardPage) {
      const dashboardUser = pathname?.split("/")[2]
      if (dashboardUser && dashboardUser !== user.id) {
        if (user.role !== "admin") {
          router.push(`/dashboard/${user.id}`)
        }
      }
    }
  }, [user, isLoading, pathname, router])

  const login = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
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

      setUser(data.user)
      router.push(data.redirectTo)
      return { success: true }
    } catch {
      return { success: false, error: "Connection error. Please try again." }
    }
  }

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
    } catch {
      // Clear state even if server call fails
    }
    setUser(null)
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

      if (!isLoading && user && options?.allowedUsers) {
        if (!options.allowedUsers.includes(user.id) && user.role !== "admin") {
          router.push(`/dashboard/${user.id}`)
        }
      }
    }, [isLoading, isAuthenticated, user, router])

    if (isLoading) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-[#0a0a0f]">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500/30 border-t-blue-500" />
        </div>
      )
    }

    if (!isAuthenticated) {
      return null
    }

    return <WrappedComponent {...props} />
  }
}
