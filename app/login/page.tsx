"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { Lock, Mail, Eye, EyeOff, ArrowRight, Shield, Phone, Smartphone, ArrowLeft } from "lucide-react"

export default function LoginPage() {
  const { login, isLoading: authLoading } = useAuth()
  const [view, setView] = useState<"login" | "reset">("login")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [resetEmail, setResetEmail] = useState("")
  const [resetMethod, setResetMethod] = useState<"sms" | "email">("sms")
  const [resetSuccess, setResetSuccess] = useState<string | null>(null)
  const [demoPassword, setDemoPassword] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) return

    setIsLoading(true)
    setError("")

    const result = await login(email, password)

    if (!result.success) {
      setError(result.error || "Login failed")
    }
    setIsLoading(false)
  }

  const handleResetPassword = async () => {
    if (!resetEmail) {
      setError("Please enter your email address")
      return
    }

    setIsLoading(true)
    setError("")
    setResetSuccess(null)
    setDemoPassword(null)

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: resetEmail,
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

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col">
      {/* Background Pattern */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-blue-950/30 via-[#0a0a0f] to-purple-950/20" />
      <div className="fixed inset-0 -z-10 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:50px_50px]" />

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
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Login View */}
          {view === "login" && (
            <div className="bg-[#0d0d12]/80 border border-white/10 rounded-2xl p-8 backdrop-blur-xl" data-testid="login-card">
              {/* Header */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-500/20 border border-blue-500/30 mb-4">
                  <Shield className="w-8 h-8 text-blue-400" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Welcome Back</h2>
                <p className="text-white/60">Sign in to access your dashboard</p>
              </div>

              {/* Form */}
              <form onSubmit={handleLogin} className="space-y-5" data-testid="login-form">
                <div>
                  <label htmlFor="email" className="block text-white/80 text-sm font-medium mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@houseofv.com"
                      className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
                      data-testid="email-input"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="block text-white/80 text-sm font-medium mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="w-full pl-12 pr-12 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
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

                <button
                  type="submit"
                  disabled={isLoading || !email || !password}
                  className={`w-full py-3 px-4 rounded-xl font-medium flex items-center justify-center gap-2 transition-all ${
                    isLoading || !email || !password
                      ? "bg-white/10 text-white/40 cursor-not-allowed"
                      : "bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-500 hover:to-blue-600"
                  }`}
                  data-testid="login-submit"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Sign In</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setView("reset")
                    setError("")
                    setResetEmail(email)
                  }}
                  className="w-full text-center text-white/50 hover:text-white text-sm transition-colors"
                  data-testid="forgot-password"
                >
                  Forgot your password?
                </button>
              </form>

              {/* Demo Credentials */}
              <div className="mt-8 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <p className="text-amber-400 text-sm font-medium mb-2">Demo Credentials</p>
                <div className="grid grid-cols-2 gap-2 text-xs text-white/60">
                  <div>hans@houseofv.com</div>
                  <div className="text-white/40">hans123</div>
                  <div>charl@houseofv.com</div>
                  <div className="text-white/40">charl123</div>
                  <div>lucky@houseofv.com</div>
                  <div className="text-white/40">lucky123</div>
                  <div>irma@houseofv.com</div>
                  <div className="text-white/40">irma123</div>
                </div>
              </div>
            </div>
          )}

          {/* Password Reset View */}
          {view === "reset" && (
            <div className="bg-[#0d0d12]/80 border border-white/10 rounded-2xl p-8 backdrop-blur-xl" data-testid="reset-card">
              {/* Back Button */}
              <button
                onClick={() => {
                  setView("login")
                  setResetSuccess(null)
                  setDemoPassword(null)
                  setError("")
                }}
                className="flex items-center gap-2 text-white/60 hover:text-white mb-6 transition-colors"
                data-testid="back-to-login"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to login</span>
              </button>

              {/* Header */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/30 mb-4">
                  <Lock className="w-8 h-8 text-amber-400" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Reset Password</h2>
                <p className="text-white/60">We'll send a new password to your phone or email</p>
              </div>

              {/* Email Input */}
              <div className="mb-6">
                <label htmlFor="reset-email" className="block text-white/80 text-sm font-medium mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                  <input
                    id="reset-email"
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="you@houseofv.com"
                    className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 transition-all"
                    data-testid="reset-email-input"
                    required
                  />
                </div>
              </div>

              {/* Reset Method Selection */}
              <div className="space-y-3 mb-6" data-testid="reset-method-selection">
                <p className="text-white/60 text-sm mb-2">Delivery method:</p>
                <button
                  type="button"
                  onClick={() => setResetMethod("sms")}
                  className={`w-full p-4 rounded-xl border flex items-center gap-4 transition-all ${
                    resetMethod === "sms"
                      ? "bg-blue-500/10 border-blue-500/30"
                      : "bg-white/5 border-white/10 hover:border-white/20"
                  }`}
                  data-testid="reset-method-sms"
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    resetMethod === "sms" ? "bg-blue-500/20" : "bg-white/10"
                  }`}>
                    <Smartphone className={`w-5 h-5 ${resetMethod === "sms" ? "text-blue-400" : "text-white/60"}`} />
                  </div>
                  <div className="flex-1 text-left">
                    <p className={`font-medium ${resetMethod === "sms" ? "text-white" : "text-white/80"}`}>SMS</p>
                    <p className="text-white/50 text-sm">Send to registered cellphone</p>
                  </div>
                  <div className={`w-4 h-4 rounded-full border-2 ${
                    resetMethod === "sms" ? "border-blue-400 bg-blue-400" : "border-white/30"
                  }`} />
                </button>

                <button
                  type="button"
                  onClick={() => setResetMethod("email")}
                  className={`w-full p-4 rounded-xl border flex items-center gap-4 transition-all ${
                    resetMethod === "email"
                      ? "bg-blue-500/10 border-blue-500/30"
                      : "bg-white/5 border-white/10 hover:border-white/20"
                  }`}
                  data-testid="reset-method-email"
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    resetMethod === "email" ? "bg-blue-500/20" : "bg-white/10"
                  }`}>
                    <Mail className={`w-5 h-5 ${resetMethod === "email" ? "text-blue-400" : "text-white/60"}`} />
                  </div>
                  <div className="flex-1 text-left">
                    <p className={`font-medium ${resetMethod === "email" ? "text-white" : "text-white/80"}`}>Email</p>
                    <p className="text-white/50 text-sm">Send to registered email</p>
                  </div>
                  <div className={`w-4 h-4 rounded-full border-2 ${
                    resetMethod === "email" ? "border-blue-400 bg-blue-400" : "border-white/30"
                  }`} />
                </button>
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
                disabled={isLoading || !resetEmail}
                className={`w-full py-3 px-4 rounded-xl font-medium flex items-center justify-center gap-2 transition-all ${
                  isLoading || !resetEmail
                    ? "bg-white/10 text-white/40 cursor-not-allowed"
                    : "bg-gradient-to-r from-amber-600 to-amber-700 text-white hover:from-amber-500 hover:to-amber-600"
                }`}
                data-testid="reset-submit"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Send New Password</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {resetSuccess && (
                <button
                  onClick={() => {
                    setView("login")
                    setResetSuccess(null)
                    setDemoPassword(null)
                  }}
                  className="w-full mt-4 py-3 px-4 rounded-xl font-medium bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-all border border-blue-500/30"
                  data-testid="return-to-login"
                >
                  Return to Login
                </button>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 py-6">
        <div className="container mx-auto px-6 text-center">
          <p className="text-white/40 text-sm">
            © 2026 House of Veritas. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
