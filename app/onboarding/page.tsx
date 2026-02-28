"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ErrorBoundary } from "@/components/error-boundary"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Users,
  CheckCircle,
  Loader2,
  ArrowRight,
  Key,
  FileSignature,
  Camera,
  Bell,
  Shield,
  X,
  User,
  ChevronDown,
} from "lucide-react"
import { apiFetch, apiFetchSafe } from "@/lib/api-client"
import { RESPONSIBILITIES } from "@/lib/access-config"
import { useLoginModal } from "@/lib/login-modal-context"
import { useAuth } from "@/lib/auth-context"

const ROLE_LABELS: Record<string, string> = {
  admin: "Administrator",
  operator: "Operator",
  resident: "Resident",
  employee: "Employee",
}

const ROLES = ["operator", "employee", "resident"] as const

export default function OnboardingPage() {
  const router = useRouter()
  const { openLoginModal } = useLoginModal()
  const { requiresAuth } = useAuth()
  const [user, setUser] = useState<{
    id: string
    name: string
    role: string
    responsibilities?: string[]
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  // Open login modal when auth is required (but not when error is showing)
  useEffect(() => {
    if (requiresAuth && !error) {
      openLoginModal()
    }
  }, [requiresAuth, openLoginModal, error])
  const [confirmedRole, setConfirmedRole] = useState(false)
  const [confirmedResponsibilities, setConfirmedResponsibilities] = useState(false)
  const [selectedResponsibilities, setSelectedResponsibilities] = useState<Set<string>>(new Set())
  const [roleRequestOpen, setRoleRequestOpen] = useState(false)
  const [requestedRole, setRequestedRole] = useState("")
  const [roleRequestSent, setRoleRequestSent] = useState(false)
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [passwordSet, setPasswordSet] = useState(false)
  const [settingPassword, setSettingPassword] = useState(false)
  const [documentsSigned, setDocumentsSigned] = useState(false)
  const [onboardingDocs, setOnboardingDocs] = useState<{ id: string; name: string }[]>([])
  const [signingDoc, setSigningDoc] = useState<string | null>(null)
  const [photoUploaded, setPhotoUploaded] = useState(false)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [notifPrefs, setNotifPrefs] = useState({ email: true, sms: false, push: true })
  const [twoFaEnabled, setTwoFaEnabled] = useState(false)

  useEffect(() => {
    apiFetchSafe<{
      user?: {
        id: string
        name: string
        role: string
        responsibilities?: string[]
        onboardingStatus?: string
      }
    } | null>("/api/users/me", null, { label: "UsersMe" })
      .then((data) => {
        if (data?.user) {
          const u = data.user as {
            id: string
            name: string
            role: string
            responsibilities?: string[]
          }
          setUser(u)
          setSelectedResponsibilities(new Set(u.responsibilities || []))
          if (data.user.onboardingStatus === "completed") {
            router.push(`/dashboard/${data.user.id}`)
          }
        }
      })
      .catch((err) => {
        console.error("Failed to fetch user:", err)
        setError(err instanceof Error ? err : new Error("Failed to fetch user"))
      })
      .finally(() => setLoading(false))
  }, [router])

  useEffect(() => {
    if (!user) return
    apiFetchSafe<{ documents?: { id: string; name: string }[] }>(
      "/api/onboarding/documents",
      { documents: [] },
      { label: "OnboardingDocs" }
    ).then((data) => setOnboardingDocs(data?.documents || []))
  }, [user])

  const handleSetPassword = async () => {
    if (password.length < 6) return
    if (password !== confirmPassword) return
    setSettingPassword(true)
    try {
      await apiFetch("/api/users/me/password", {
        method: "POST",
        body: { password },
        label: "SetPassword",
      })
      setPasswordSet(true)
    } finally {
      setSettingPassword(false)
    }
  }

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingPhoto(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      await apiFetch("/api/users/me/photo", {
        method: "POST",
        body: formData,
        label: "UploadPhoto",
      })
      setPhotoUploaded(true)
    } finally {
      setUploadingPhoto(false)
      e.target.value = ""
    }
  }

  const handleSaveNotifPrefs = () => {
    localStorage.setItem("hov_notif_prefs", JSON.stringify(notifPrefs))
  }

  const handleSignDocument = async (templateId: string) => {
    setSigningDoc(templateId)
    try {
      const data = await apiFetch<{
        submissionId?: string
        signingUrl?: string
      }>("/api/onboarding/documents", {
        method: "POST",
        body: { templateId },
        label: "SignDocument",
      })
      if (data?.submissionId) {
        setDocumentsSigned(true)
      }
      if (data?.signingUrl) {
        window.open(data.signingUrl, "_blank", "noopener,noreferrer")
      }
    } finally {
      setSigningDoc(null)
    }
  }

  const handleSubmitRoleRequest = async () => {
    if (!requestedRole.trim()) return
    try {
      await apiFetch("/api/users/me/onboarding-feedback", {
        method: "POST",
        body: { roleChangeRequest: requestedRole },
        label: "RoleRequest",
      })
      setRoleRequestSent(true)
    } catch {
      setRoleRequestSent(false)
    }
  }

  const handleSaveResponsibilities = async () => {
    try {
      await apiFetch("/api/users/me/onboarding-feedback", {
        method: "POST",
        body: { responsibilities: Array.from(selectedResponsibilities) },
        label: "Responsibilities",
      })
    } catch {
      // ignore
    }
  }

  const toggleResponsibility = (r: string) => {
    setSelectedResponsibilities((prev) => {
      const next = new Set(prev)
      if (next.has(r)) next.delete(r)
      else next.add(r)
      return next
    })
  }

  const handleStartTutorial = async () => {
    if (!user?.id) return
    await handleSaveResponsibilities()
    try {
      await apiFetch("/api/users/me/onboard", { method: "POST", label: "Onboard" })
      router.push(`/dashboard/${user.id}?tutorial=1`)
    } catch {
      router.push(`/dashboard/${user.id}?tutorial=1`)
    }
  }

  const handleClose = () => {
    router.push(`/dashboard/${user?.id || ""}`)
  }

  if (error) {
    // Log full error details for debugging, but show generic message to users
    console.error("Onboarding load error:", error)
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-black/60 p-4">
        <div className="rounded-lg border border-red-800/50 bg-red-900/20 p-6 text-center">
          <p className="mb-2 text-red-400">Unable to load onboarding</p>
          <p className="mb-4 text-sm text-red-300/70">Please try again.</p>
          <Button onClick={() => window.location.reload()} variant="outline" className="border-red-800/50">
            Retry
          </Button>
        </div>
      </div>
    )
  }

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black/60">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
        <Card className="relative w-full max-w-lg max-h-[90vh] overflow-hidden border-white/20 bg-[#0d0d12] shadow-2xl">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 z-10 rounded-lg p-2 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="overflow-y-auto max-h-[90vh]">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3 pr-10">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600/20">
                  <Users className="h-6 w-6 text-blue-400" />
                </div>
                <div>
                  <CardTitle className="text-xl text-white">Welcome to House of Veritas</CardTitle>
                  <CardDescription className="mt-1 flex items-center gap-2 text-white/70">
                    <User className="h-4 w-4" />
                    {user.name}
                  </CardDescription>
                </div>
              </div>
              <p className="mt-2 text-sm text-white/50">
                Please confirm your role and responsibilities to complete onboarding.
              </p>
            </CardHeader>

            <CardContent className="space-y-6 pb-8">
              <div>
                <p className="mb-2 text-sm font-medium text-white/80">Your assigned role</p>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-lg bg-white/10 px-3 py-1.5 text-white">
                    {ROLE_LABELS[user.role] || user.role}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-blue-400 hover:bg-blue-500/20 hover:text-blue-300"
                    onClick={() => setRoleRequestOpen(!roleRequestOpen)}
                  >
                    Request different role
                    <ChevronDown
                      className={`ml-1 h-4 w-4 transition-transform ${roleRequestOpen ? "rotate-180" : ""}`}
                    />
                  </Button>
                </div>
                {roleRequestOpen && (
                  <div className="mt-3 space-y-2">
                    <select
                      value={requestedRole}
                      onChange={(e) => setRequestedRole(e.target.value)}
                      className="w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-white"
                      title="Select role to request"
                      aria-label="Select role to request"
                    >
                      <option value="">Select role to request</option>
                      {ROLES.filter((r) => r !== user.role).map((r) => (
                        <option key={r} value={r}>
                          {ROLE_LABELS[r]}
                        </option>
                      ))}
                    </select>
                    <Button
                      size="sm"
                      onClick={handleSubmitRoleRequest}
                      disabled={!requestedRole || roleRequestSent}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {roleRequestSent ? "Request sent" : "Submit request"}
                    </Button>
                  </div>
                )}
                <div className="mt-2 flex items-center gap-2">
                  <Checkbox
                    id="confirm-role"
                    checked={confirmedRole}
                    onCheckedChange={(v) => setConfirmedRole(!!v)}
                  />
                  <Label htmlFor="confirm-role" className="cursor-pointer text-sm text-white/70">
                    I confirm this is my correct role
                  </Label>
                </div>
              </div>

              <div>
                <p className="mb-2 text-sm font-medium text-white/80">
                  Your responsibilities (select to accept, deselect to deny)
                </p>
                <div className="space-y-2 rounded-lg border border-white/10 bg-white/5 p-3">
                  {RESPONSIBILITIES.map((r) => (
                    <label
                      key={r}
                      className="flex cursor-pointer items-center gap-2 text-sm text-white/80"
                    >
                      <Checkbox
                        checked={selectedResponsibilities.has(r)}
                        onCheckedChange={() => toggleResponsibility(r)}
                      />
                      {r}
                    </label>
                  ))}
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <Checkbox
                    id="confirm-resp"
                    checked={confirmedResponsibilities}
                    onCheckedChange={(v) => {
                      setConfirmedResponsibilities(!!v)
                      if (v) handleSaveResponsibilities()
                    }}
                  />
                  <Label htmlFor="confirm-resp" className="cursor-pointer text-sm text-white/70">
                    I confirm I understand my responsibilities
                  </Label>
                </div>
              </div>

              <div>
                <p className="mb-2 flex items-center gap-2 text-sm font-medium text-white/80">
                  <Key className="h-4 w-4" />
                  Set your password
                </p>
                <p className="mb-2 text-xs text-white/50">
                  Choose a password for future logins (min 6 characters). You can skip and set it
                  later from your profile.
                </p>
                {!passwordSet ? (
                  <div className="space-y-2">
                    <Input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="New password"
                      className="border-white/10 bg-white/5 text-white"
                    />
                    <Input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm password"
                      className="border-white/10 bg-white/5 text-white"
                    />
                    <Button
                      onClick={handleSetPassword}
                      disabled={
                        password.length < 6 || password !== confirmPassword || settingPassword
                      }
                      variant="outline"
                      size="sm"
                      className="border-white/20"
                    >
                      {settingPassword ? "Setting..." : "Set password"}
                    </Button>
                  </div>
                ) : (
                  <p className="flex items-center gap-1 text-sm text-green-400">
                    <CheckCircle className="h-4 w-4" />
                    Password set successfully
                  </p>
                )}
              </div>

              <div>
                <p className="mb-2 flex items-center gap-2 text-sm font-medium text-white/80">
                  <Camera className="h-4 w-4" />
                  Profile photo
                </p>
                <input
                  type="file"
                  accept="image/*"
                  capture="user"
                  onChange={handlePhotoUpload}
                  disabled={uploadingPhoto}
                  className="hidden"
                  id="profile-photo-input"
                />
                <label
                  htmlFor="profile-photo-input"
                  className="cursor-pointer rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 hover:bg-white/10"
                >
                  {uploadingPhoto ? "Uploading..." : photoUploaded ? "Photo uploaded ✓" : "Take photo or upload"}
                </label>
              </div>

              <div>
                <p className="mb-2 flex items-center gap-2 text-sm font-medium text-white/80">
                  <Bell className="h-4 w-4" />
                  Notification preferences
                </p>
                <div className="space-y-2">
                  {(["email", "sms", "push"] as const).map((k) => (
                    <label key={k} className="flex items-center gap-2 text-sm text-white/80">
                      <input
                        type="checkbox"
                        checked={notifPrefs[k]}
                        onChange={(e) =>
                          setNotifPrefs((p) => ({ ...p, [k]: e.target.checked }))
                        }
                        className="rounded"
                      />
                      {k === "email" ? "Email" : k === "sms" ? "SMS" : "Push notifications"}
                    </label>
                  ))}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleSaveNotifPrefs}
                    className="mt-2 border-white/20"
                  >
                    Save preferences
                  </Button>
                </div>
              </div>

              <div>
                <p className="mb-2 flex items-center gap-2 text-sm font-medium text-white/80">
                  <Shield className="h-4 w-4" />
                  Two-factor authentication (optional)
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setTwoFaEnabled(true)}
                  disabled={twoFaEnabled}
                  className="border-white/20"
                >
                  {twoFaEnabled ? (
                    <span className="flex items-center gap-1">
                      <CheckCircle className="h-4 w-4" />
                      Skip for now
                    </span>
                  ) : (
                    "I'll set up 2FA later"
                  )}
                </Button>
              </div>

              <div>
                <p className="mb-2 flex items-center gap-2 text-sm font-medium text-white/80">
                  <FileSignature className="h-4 w-4" />
                  Sign initial documents
                </p>
                {onboardingDocs.length > 0 ? (
                  <div className="space-y-2">
                    {onboardingDocs.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between rounded-lg bg-white/5 p-2"
                      >
                        <span className="text-white/80">{doc.name}</span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSignDocument(doc.id)}
                          disabled={!!signingDoc}
                          className="border-white/20"
                        >
                          {signingDoc === doc.id ? "Sending..." : "Sign"}
                        </Button>
                      </div>
                    ))}
                    {documentsSigned && (
                      <p className="flex items-center gap-1 text-sm text-green-400">
                        <CheckCircle className="h-4 w-4" />
                        Signature request sent
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-white/40 italic">No documents required for your role.</p>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={handleClose}
                  className="border-white/20"
                >
                  Complete later
                </Button>
                <Button
                  onClick={handleStartTutorial}
                  disabled={!confirmedRole || !confirmedResponsibilities}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Start Guided Tour
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </div>
        </Card>
      </div>
    </ErrorBoundary>
  )
}
