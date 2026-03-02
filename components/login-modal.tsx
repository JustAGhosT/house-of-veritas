"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  Shield,
  Phone,
  Smartphone,
  ArrowLeft,
} from "lucide-react"
import { Button } from "@/components/ui/button"

interface LoginModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function LoginModal({ open, onOpenChange }: LoginModalProps) {
  const { login } = useAuth()
  const [view, setView] = useState<"login" | "reset">("login")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [resetEmail, setResetEmail] = useState("")
  const [resetMethod, setResetMethod] = useState<"sms" | "email">("sms")
  const [resetSuccess, setResetSuccess] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) return

    setIsLoading(true)
    setError("")

    try {
      const result = await login(email, password)

      if (!result.success) {
        setError(result.error || "Login failed")
      } else {
        onOpenChange(false)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handleResetPassword = async () => {
    if (!resetEmail) {
      setError("Please enter your email address")
      return
    }

    setIsLoading(true)
    setError("")
    setResetSuccess(null)

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
    } catch (err) {
      setError("Connection error. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    onOpenChange(false)
    // Reset state after animation
    setTimeout(() => {
      setView("login")
      setEmail("")
      setPassword("")
      setError("")
      setResetEmail("")
      setResetSuccess(null)
    }, 300)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="dark-scrollbar max-h-[90vh] max-w-md overflow-y-auto border-white/10 bg-[#0d0d12]/95 p-0 backdrop-blur-xl">
        {/* Login View */}
        {view === "login" && (
          <div className="p-8">
            <DialogHeader className="mb-8 text-center">
              <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl border border-blue-500/30 bg-blue-500/20">
                <Shield className="h-8 w-8 text-blue-400" />
              </div>
              <DialogTitle className="mb-2 text-2xl font-bold text-white">Welcome Back</DialogTitle>
              <DialogDescription className="text-white/60">
                Sign in to access your dashboard
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleLogin} className="space-y-5" data-testid="login-form">
              <div>
                <label htmlFor="email" className="mb-2 block text-sm font-medium text-white/80">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-white/40" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@houseofv.com"
                    className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pr-4 pl-12 text-white placeholder-white/40 transition-all focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                    data-testid="email-input"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="mb-2 block text-sm font-medium text-white/80">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-white/40" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pr-12 pl-12 text-white placeholder-white/40 transition-all focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                    data-testid="password-input"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute top-1/2 right-4 -translate-y-1/2 text-white/40 transition-colors hover:text-white/60"
                    data-testid="toggle-password"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {error && (
                <div
                  className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400"
                  data-testid="login-error"
                >
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading || !email || !password}
                className={`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 font-medium transition-all ${
                  isLoading || !email || !password
                    ? "cursor-not-allowed bg-white/10 text-white/40"
                    : "bg-linear-to-r from-blue-600 to-blue-700 text-white hover:from-blue-500 hover:to-blue-600"
                }`}
                data-testid="login-submit"
              >
                {isLoading ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="h-4 w-4" />
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
                className="w-full text-center text-sm text-white/50 transition-colors hover:text-white"
                data-testid="forgot-password"
              >
                Forgot your password?
              </button>
            </form>

            {/* Demo Credentials - Development Only */}
            {process.env.NODE_ENV === "development" && (
              <div className="mt-8 rounded-xl border border-amber-500/20 bg-amber-500/10 p-4">
                <p className="mb-2 text-sm font-medium text-amber-400">Demo Credentials</p>
                <div className="grid grid-cols-2 gap-2 text-xs text-white/60">
                  <div>demo-user-1@example.com</div>
                  <div className="text-white/40">password123</div>
                  <div>demo-user-2@example.com</div>
                  <div className="text-white/40">password123</div>
                  <div>demo-user-3@example.com</div>
                  <div className="text-white/40">password123</div>
                  <div>demo-user-4@example.com</div>
                  <div className="text-white/40">password123</div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Password Reset View */}
        {view === "reset" && (
          <div className="p-8">
            {/* Back Button */}
            <button
              onClick={() => {
                setView("login")
                setResetSuccess(null)
                setError("")
              }}
              className="mb-6 flex items-center gap-2 text-white/60 transition-colors hover:text-white"
              data-testid="back-to-login"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to login</span>
            </button>

            <DialogHeader className="mb-8 text-center">
              <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl border border-amber-500/30 bg-amber-500/20">
                <Lock className="h-8 w-8 text-amber-400" />
              </div>
              <DialogTitle className="mb-2 text-2xl font-bold text-white">
                Reset Password
              </DialogTitle>
              <DialogDescription className="text-white/60">
                We&apos;ll send a new password to your phone or email
              </DialogDescription>
            </DialogHeader>

            {/* Email Input */}
            <div className="mb-6">
              <label htmlFor="reset-email" className="mb-2 block text-sm font-medium text-white/80">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-white/40" />
                <input
                  id="reset-email"
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="you@houseofv.com"
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pr-4 pl-12 text-white placeholder-white/40 transition-all focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 focus:outline-none"
                  data-testid="reset-email-input"
                  required
                />
              </div>
            </div>

            {/* Reset Method Selection */}
            <div className="mb-6 space-y-3" data-testid="reset-method-selection">
              <p className="mb-2 text-sm text-white/60">Delivery method:</p>
              <button
                type="button"
                onClick={() => setResetMethod("sms")}
                className={`flex w-full items-center gap-4 rounded-xl border p-4 transition-all ${
                  resetMethod === "sms"
                    ? "border-blue-500/30 bg-blue-500/10"
                    : "border-white/10 bg-white/5 hover:border-white/20"
                }`}
                data-testid="reset-method-sms"
              >
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                    resetMethod === "sms" ? "bg-blue-500/20" : "bg-white/10"
                  }`}
                >
                  <Smartphone
                    className={`h-5 w-5 ${resetMethod === "sms" ? "text-blue-400" : "text-white/60"}`}
                  />
                </div>
                <div className="flex-1 text-left">
                  <p
                    className={`font-medium ${resetMethod === "sms" ? "text-white" : "text-white/80"}`}
                  >
                    SMS
                  </p>
                  <p className="text-sm text-white/50">Send to registered cellphone</p>
                </div>
                <div
                  className={`h-4 w-4 rounded-full border-2 ${
                    resetMethod === "sms" ? "border-blue-400 bg-blue-400" : "border-white/30"
                  }`}
                />
              </button>

              <button
                type="button"
                onClick={() => setResetMethod("email")}
                className={`flex w-full items-center gap-4 rounded-xl border p-4 transition-all ${
                  resetMethod === "email"
                    ? "border-blue-500/30 bg-blue-500/10"
                    : "border-white/10 bg-white/5 hover:border-white/20"
                }`}
                data-testid="reset-method-email"
              >
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                    resetMethod === "email" ? "bg-blue-500/20" : "bg-white/10"
                  }`}
                >
                  <Mail
                    className={`h-5 w-5 ${resetMethod === "email" ? "text-blue-400" : "text-white/60"}`}
                  />
                </div>
                <div className="flex-1 text-left">
                  <p
                    className={`font-medium ${resetMethod === "email" ? "text-white" : "text-white/80"}`}
                  >
                    Email
                  </p>
                  <p className="text-sm text-white/50">Send to registered email</p>
                </div>
                <div
                  className={`h-4 w-4 rounded-full border-2 ${
                    resetMethod === "email" ? "border-blue-400 bg-blue-400" : "border-white/30"
                  }`}
                />
              </button>
            </div>

            {error && (
              <div
                className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400"
                data-testid="reset-error"
              >
                {error}
              </div>
            )}

            {resetSuccess && (
              <div
                className="mb-6 rounded-xl border border-green-500/20 bg-green-500/10 p-4"
                data-testid="reset-success"
              >
                <p className="font-medium text-green-400">{resetSuccess}</p>
              </div>
            )}

            <button
              onClick={handleResetPassword}
              disabled={isLoading || !resetEmail}
              className={`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 font-medium transition-all ${
                isLoading || !resetEmail
                  ? "cursor-not-allowed bg-white/10 text-white/40"
                  : "bg-linear-to-r from-amber-600 to-amber-700 text-white hover:from-amber-500 hover:to-amber-600"
              }`}
              data-testid="reset-submit"
            >
              {isLoading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : (
                <>
                  <span>Send New Password</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>

            {resetSuccess && (
              <button
                onClick={() => {
                  setView("login")
                  setResetSuccess(null)
                }}
                className="mt-4 w-full rounded-xl border border-blue-500/30 bg-blue-500/10 px-4 py-3 font-medium text-blue-400 transition-all hover:bg-blue-500/20"
                data-testid="return-to-login"
              >
                Return to Login
              </button>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
