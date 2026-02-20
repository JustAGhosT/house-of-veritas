"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Lock, User, ArrowRight, Shield, Eye, EyeOff, Phone, Mail, ArrowLeft, Smartphone } from "lucide-react"

// User type for display
interface UserInfo {
  id: string
  name: string
  email: string
  role: string
  description: string
  color: string
  icon: string
  specialty: string[]
}

// Persona display info
const PERSONA_COLORS: Record<string, string> = {
  blue: "from-blue-600 to-blue-800",
  amber: "from-amber-600 to-amber-800",
  green: "from-green-600 to-green-800",
  purple: "from-purple-600 to-purple-800",
}

export default function LoginPage() {
  const router = useRouter()
  const [view, setView] = useState<"select" | "login" | "reset">("select")
  const [selectedUser, setSelectedUser] = useState<UserInfo | null>(null)
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [resetMethod, setResetMethod] = useState<"sms" | "email">("sms")
  const [resetSuccess, setResetSuccess] = useState<string | null>(null)
  const [demoPassword, setDemoPassword] = useState<string | null>(null)
  const [users, setUsers] = useState<UserInfo[]>([
    {
      id: "hans",
      name: "Hans",
      email: "hans@houseofv.com",
      role: "Owner & Administrator",
      description: "Full platform access, approvals, and oversight",
      color: "blue",
      icon: "👔",
      specialty: ["Tech", "Leadership", "Electronics"],
    },
    {
      id: "charl",
      name: "Charl",
      email: "charl@houseofv.com",
      role: "Workshop Operator",
      description: "Tasks, assets, time tracking, vehicle logs",
      color: "amber",
      icon: "🔧",
      specialty: ["Tinkerer", "Electrician", "Plumber", "Magicman"],
    },
    {
      id: "lucky",
      name: "Lucky",
      email: "lucky@houseofv.com",
      role: "Gardener & Handyman",
      description: "Tasks, expenses, vehicle logs, time tracking",
      color: "green",
      icon: "🌿",
      specialty: ["Gardening", "Painting", "Manual Labour"],
    },
    {
      id: "irma",
      name: "Irma",
      email: "irma@houseofv.com",
      role: "Resident",
      description: "Household tasks, documents, limited access",
      color: "purple",
      icon: "🏠",
      specialty: ["Babysitting", "Cleaning", "Food"],
    },
  ])

  const handleSelectUser = (user: UserInfo) => {
    setSelectedUser(user)
    setView("login")
    setPassword("")
    setError("")
    setDemoPassword(null)
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedUser || !password) return

    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: selectedUser.id,
          password: password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Login failed")
        setIsLoading(false)
        return
      }

      // Redirect to dashboard
      router.push(data.redirectTo)
    } catch (err) {
      setError("Connection error. Please try again.")
      setIsLoading(false)
    }
  }

  const handleResetPassword = async () => {
    if (!selectedUser) return

    setIsLoading(true)
    setError("")
    setResetSuccess(null)
    setDemoPassword(null)

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: selectedUser.email,
          method: resetMethod,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Password reset failed")
        setIsLoading(false)
        return
      }

      setResetSuccess(data.message)
      if (data.demoPassword) {
        setDemoPassword(data.demoPassword)
      }
    } catch (err) {
      setError("Connection error. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleBackToLogin = () => {
    setView("login")
    setResetSuccess(null)
    setDemoPassword(null)
    setError("")
  }

  const handleBackToSelect = () => {
    setView("select")
    setSelectedUser(null)
    setPassword("")
    setError("")
    setResetSuccess(null)
    setDemoPassword(null)
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/40 backdrop-blur-xl">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center">
              <span className="text-white font-bold text-lg">HV</span>
            </div>
            <div>
              <h1 className="text-white font-semibold">House of Veritas</h1>
              <p className="text-white/50 text-xs">Digital Governance Platform</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          {/* User Selection View */}
          {view === "select" && (
            <>
              {/* Title */}
              <div className="text-center mb-12">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 mb-6">
                  <Shield className="w-4 h-4 text-blue-400" />
                  <span className="text-blue-400 text-sm font-medium">Secure Access</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  Select Your Profile
                </h2>
                <p className="text-white/60 max-w-md mx-auto">
                  Choose your user profile to access your personalized dashboard with role-specific features and permissions.
                </p>
              </div>

              {/* User Grid */}
              <div className="grid md:grid-cols-2 gap-6" data-testid="user-selection-grid">
                {users.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => handleSelectUser(user)}
                    data-testid={`select-user-${user.id}`}
                    className="group relative p-6 rounded-2xl border border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10 transition-all duration-300 cursor-pointer text-left"
                  >
                    {/* Gradient Background on Hover */}
                    <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${PERSONA_COLORS[user.color]} opacity-0 group-hover:opacity-5 transition-opacity`} />
                    
                    <div className="relative flex items-start gap-4">
                      {/* Avatar */}
                      <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${PERSONA_COLORS[user.color]} flex items-center justify-center text-2xl shrink-0`}>
                        {user.icon}
                      </div>
                      
                      {/* Info */}
                      <div className="flex-1 text-left">
                        <h3 className="text-lg font-semibold text-white mb-1">
                          {user.name}
                        </h3>
                        <p className={`text-sm font-medium mb-2 bg-gradient-to-r ${PERSONA_COLORS[user.color]} bg-clip-text text-transparent`}>
                          {user.role}
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {user.specialty.map((spec) => (
                            <span key={spec} className="px-2 py-0.5 text-xs rounded-full bg-white/10 text-white/60">
                              {spec}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      {/* Arrow */}
                      <div className="w-10 h-10 rounded-full flex items-center justify-center bg-white/5 text-white/40 group-hover:bg-white/10 group-hover:text-white/60 transition-all">
                        <ArrowRight className="w-5 h-5" />
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}

          {/* Login View */}
          {view === "login" && selectedUser && (
            <div className="max-w-md mx-auto">
              {/* Back Button */}
              <button
                onClick={handleBackToSelect}
                className="flex items-center gap-2 text-white/60 hover:text-white mb-8 transition-colors"
                data-testid="back-to-select"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to user selection</span>
              </button>

              {/* User Card */}
              <div className={`p-6 rounded-2xl bg-gradient-to-br ${PERSONA_COLORS[selectedUser.color]}/20 border border-white/10 mb-8`}>
                <div className="flex items-center gap-4">
                  <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${PERSONA_COLORS[selectedUser.color]} flex items-center justify-center text-3xl`}>
                    {selectedUser.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">{selectedUser.name}</h3>
                    <p className="text-white/60">{selectedUser.role}</p>
                    <p className="text-white/40 text-sm">{selectedUser.email}</p>
                  </div>
                </div>
              </div>

              {/* Login Form */}
              <form onSubmit={handleLogin} className="space-y-6" data-testid="login-form">
                <div>
                  <label htmlFor="password" className="block text-white/80 text-sm font-medium mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all pr-12"
                      data-testid="password-input"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60 transition-colors"
                      data-testid="toggle-password"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm" data-testid="login-error">
                    {error}
                  </div>
                )}

                {demoPassword && (
                  <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20" data-testid="demo-password">
                    <p className="text-amber-400 text-sm font-medium mb-1">Demo Mode - New Password:</p>
                    <p className="text-white font-mono text-lg">{demoPassword}</p>
                    <p className="text-white/50 text-xs mt-2">In production, this would be sent via SMS.</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading || !password}
                  className={`w-full py-3 px-4 rounded-xl font-medium flex items-center justify-center gap-2 transition-all ${
                    isLoading || !password
                      ? "bg-white/10 text-white/40 cursor-not-allowed"
                      : `bg-gradient-to-r ${PERSONA_COLORS[selectedUser.color]} text-white hover:opacity-90`
                  }`}
                  data-testid="login-submit"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>Sign In</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setView("reset")}
                  className="w-full text-center text-white/50 hover:text-white text-sm transition-colors"
                  data-testid="forgot-password"
                >
                  Forgot your password?
                </button>
              </form>
            </div>
          )}

          {/* Password Reset View */}
          {view === "reset" && selectedUser && (
            <div className="max-w-md mx-auto">
              {/* Back Button */}
              <button
                onClick={handleBackToLogin}
                className="flex items-center gap-2 text-white/60 hover:text-white mb-8 transition-colors"
                data-testid="back-to-login"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to login</span>
              </button>

              {/* Title */}
              <div className="text-center mb-8">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500/20 flex items-center justify-center mb-4">
                  <Lock className="w-8 h-8 text-amber-400" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Reset Password</h2>
                <p className="text-white/60">
                  We'll send a new password to {selectedUser.name}
                </p>
              </div>

              {/* Reset Method Selection */}
              <div className="space-y-3 mb-6" data-testid="reset-method-selection">
                <button
                  onClick={() => setResetMethod("sms")}
                  className={`w-full p-4 rounded-xl border flex items-center gap-4 transition-all ${
                    resetMethod === "sms"
                      ? "bg-blue-500/10 border-blue-500/30"
                      : "bg-white/5 border-white/10 hover:border-white/20"
                  }`}
                  data-testid="reset-method-sms"
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    resetMethod === "sms" ? "bg-blue-500/20" : "bg-white/10"
                  }`}>
                    <Smartphone className={`w-6 h-6 ${resetMethod === "sms" ? "text-blue-400" : "text-white/60"}`} />
                  </div>
                  <div className="flex-1 text-left">
                    <p className={`font-medium ${resetMethod === "sms" ? "text-white" : "text-white/80"}`}>
                      SMS to Cellphone
                    </p>
                    <p className="text-white/50 text-sm">
                      Send new password via SMS
                    </p>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 ${
                    resetMethod === "sms" ? "border-blue-400 bg-blue-400" : "border-white/30"
                  }`}>
                    {resetMethod === "sms" && (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-white" />
                      </div>
                    )}
                  </div>
                </button>

                <button
                  onClick={() => setResetMethod("email")}
                  className={`w-full p-4 rounded-xl border flex items-center gap-4 transition-all ${
                    resetMethod === "email"
                      ? "bg-blue-500/10 border-blue-500/30"
                      : "bg-white/5 border-white/10 hover:border-white/20"
                  }`}
                  data-testid="reset-method-email"
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    resetMethod === "email" ? "bg-blue-500/20" : "bg-white/10"
                  }`}>
                    <Mail className={`w-6 h-6 ${resetMethod === "email" ? "text-blue-400" : "text-white/60"}`} />
                  </div>
                  <div className="flex-1 text-left">
                    <p className={`font-medium ${resetMethod === "email" ? "text-white" : "text-white/80"}`}>
                      Email
                    </p>
                    <p className="text-white/50 text-sm">
                      Send new password via email
                    </p>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 ${
                    resetMethod === "email" ? "border-blue-400 bg-blue-400" : "border-white/30"
                  }`}>
                    {resetMethod === "email" && (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-white" />
                      </div>
                    )}
                  </div>
                </button>
              </div>

              {/* Destination Info */}
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 mb-6">
                <p className="text-white/60 text-sm mb-1">
                  {resetMethod === "sms" ? "Sending to:" : "Sending to:"}
                </p>
                <p className="text-white font-medium">
                  {resetMethod === "sms" ? (
                    <>Cellphone ending in ****{selectedUser.id === "hans" ? "55" : selectedUser.id === "lucky" ? "10" : "90"}</>
                  ) : (
                    selectedUser.email
                  )}
                </p>
              </div>

              {error && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-6" data-testid="reset-error">
                  {error}
                </div>
              )}

              {resetSuccess && (
                <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 mb-6" data-testid="reset-success">
                  <p className="text-green-400 font-medium">{resetSuccess}</p>
                  {demoPassword && (
                    <div className="mt-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                      <p className="text-amber-400 text-sm font-medium mb-1">Demo Mode - Your new password:</p>
                      <p className="text-white font-mono text-xl">{demoPassword}</p>
                    </div>
                  )}
                </div>
              )}

              <button
                onClick={handleResetPassword}
                disabled={isLoading}
                className={`w-full py-3 px-4 rounded-xl font-medium flex items-center justify-center gap-2 transition-all ${
                  isLoading
                    ? "bg-white/10 text-white/40 cursor-not-allowed"
                    : "bg-gradient-to-r from-amber-600 to-amber-800 text-white hover:opacity-90"
                }`}
                data-testid="reset-submit"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    {resetMethod === "sms" ? <Phone className="w-4 h-4" /> : <Mail className="w-4 h-4" />}
                    <span>Send New Password</span>
                  </>
                )}
              </button>

              {resetSuccess && (
                <button
                  onClick={handleBackToLogin}
                  className="w-full mt-4 py-3 px-4 rounded-xl font-medium bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-all"
                  data-testid="return-to-login"
                >
                  Return to Login
                </button>
              )}
            </div>
          )}

          {/* Security Notice */}
          {view === "select" && (
            <div className="mt-12 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center shrink-0">
                  <Lock className="w-4 h-4 text-amber-400" />
                </div>
                <div>
                  <h4 className="text-amber-400 font-medium mb-1">Development Mode</h4>
                  <p className="text-white/60 text-sm">
                    Default passwords: hans123, irma123, charl123, lucky123. In production, SMS-based password reset will be enabled with Twilio integration.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 py-6">
        <div className="container mx-auto px-6 text-center">
          <p className="text-white/40 text-sm">
            © 2025 House of Veritas. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
