"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ErrorBoundary } from "@/components/error-boundary"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Users, CheckCircle, Loader2, ArrowRight, Key, FileSignature, Camera, Bell, Shield } from "lucide-react"

const ROLE_LABELS: Record<string, string> = {
  admin: "Administrator",
  operator: "Operator",
  resident: "Resident",
  employee: "Employee",
}

export default function OnboardingPage() {
  const router = useRouter()
  const [user, setUser] = useState<{ id: string; name: string; role: string; responsibilities?: string[] } | null>(null)
  const [loading, setLoading] = useState(true)
  const [confirmedRole, setConfirmedRole] = useState(false)
  const [confirmedResponsibilities, setConfirmedResponsibilities] = useState(false)
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
    fetch("/api/users/me")
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data?.user) {
          setUser(data.user)
          if (data.user.onboardingStatus === "completed") {
            router.push(`/dashboard/${data.user.id}`)
          }
        } else {
          router.push("/login")
        }
      })
      .catch(() => router.push("/login"))
      .finally(() => setLoading(false))
  }, [router])

  useEffect(() => {
    if (!user) return
    fetch("/api/onboarding/documents")
      .then((r) => r.ok ? r.json() : null)
      .then((data) => setOnboardingDocs(data?.documents || []))
      .catch(() => setOnboardingDocs([]))
  }, [user])

  const handleSetPassword = async () => {
    if (password.length < 6) return
    if (password !== confirmPassword) return
    setSettingPassword(true)
    try {
      const res = await fetch("/api/users/me/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      })
      if (res.ok) setPasswordSet(true)
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
      const res = await fetch("/api/users/me/photo", { method: "POST", body: formData })
      if (res.ok) setPhotoUploaded(true)
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
      const res = await fetch("/api/onboarding/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateId }),
      })
      const data = await res.json()
      if (data.submissionId) {
        setDocumentsSigned(true)
      }
    } finally {
      setSigningDoc(null)
    }
  }

  const handleStartTutorial = () => {
    if (!confirmedRole || !confirmedResponsibilities) return
    router.push(`/dashboard/${user?.id}?tutorial=1`)
  }

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    )
  }

  return (
    <ErrorBoundary>
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-6">
      <Card className="w-full max-w-lg bg-[#0d0d12] border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Users className="h-6 w-6" />
            Welcome to House of Veritas
          </CardTitle>
          <CardDescription className="text-white/60">
            Please confirm your role and responsibilities to complete onboarding.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <p className="text-white/80 mb-2">Your assigned role</p>
            <p className="text-lg font-medium text-white">{ROLE_LABELS[user.role] || user.role}</p>
            <div className="flex items-center gap-2 mt-2">
              <Checkbox
                id="confirm-role"
                checked={confirmedRole}
                onCheckedChange={(v) => setConfirmedRole(!!v)}
              />
              <Label htmlFor="confirm-role" className="text-white/70 cursor-pointer">
                I confirm this is my correct role
              </Label>
            </div>
          </div>

          <div>
            <p className="text-white/80 mb-2">Your responsibilities</p>
            {user.responsibilities?.length ? (
              <ul className="list-disc list-inside text-white/70 space-y-1">
                {user.responsibilities.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
            ) : (
              <p className="text-white/50 italic">No specific responsibilities assigned yet.</p>
            )}
            <div className="flex items-center gap-2 mt-2">
              <Checkbox
                id="confirm-resp"
                checked={confirmedResponsibilities}
                onCheckedChange={(v) => setConfirmedResponsibilities(!!v)}
              />
              <Label htmlFor="confirm-resp" className="text-white/70 cursor-pointer">
                I confirm I understand my responsibilities
              </Label>
            </div>
          </div>

          <div>
            <p className="text-white/80 mb-2 flex items-center gap-2">
              <Key className="h-4 w-4" />
              Set your password
            </p>
            <p className="text-white/50 text-sm mb-2">Choose a password for future logins (min 6 characters). You can skip and set it later from your profile.</p>
            {!passwordSet ? (
              <div className="space-y-2">
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="New password"
                  className="bg-white/5 border-white/10 text-white"
                />
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm password"
                  className="bg-white/5 border-white/10 text-white"
                />
                <Button
                  onClick={handleSetPassword}
                  disabled={password.length < 6 || password !== confirmPassword || settingPassword}
                  variant="outline"
                  size="sm"
                  className="border-white/20"
                >
                  {settingPassword ? "Setting..." : "Set password"}
                </Button>
              </div>
            ) : (
              <p className="text-green-400 text-sm flex items-center gap-1">
                <CheckCircle className="h-4 w-4" />
                Password set successfully
              </p>
            )}
          </div>

          <div>
            <p className="text-white/80 mb-2 flex items-center gap-2">
              <Camera className="h-4 w-4" />
              Profile photo
            </p>
            <p className="text-white/50 text-sm mb-2">
              Upload a profile photo (from camera or file). Optional – you can add one later in Settings.
            </p>
            <div className="flex items-center gap-2">
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
                className="cursor-pointer px-4 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-white/80 text-sm"
              >
                {uploadingPhoto ? "Uploading..." : photoUploaded ? "Photo uploaded ✓" : "Take photo or upload"}
              </label>
            </div>
          </div>

          <div>
            <p className="text-white/80 mb-2 flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Notification preferences
            </p>
            <p className="text-white/50 text-sm mb-2">Choose how you want to receive notifications.</p>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-white/80">
                <input
                  type="checkbox"
                  checked={notifPrefs.email}
                  onChange={(e) => setNotifPrefs((p) => ({ ...p, email: e.target.checked }))}
                  className="rounded"
                />
                Email
              </label>
              <label className="flex items-center gap-2 text-white/80">
                <input
                  type="checkbox"
                  checked={notifPrefs.sms}
                  onChange={(e) => setNotifPrefs((p) => ({ ...p, sms: e.target.checked }))}
                  className="rounded"
                />
                SMS
              </label>
              <label className="flex items-center gap-2 text-white/80">
                <input
                  type="checkbox"
                  checked={notifPrefs.push}
                  onChange={(e) => setNotifPrefs((p) => ({ ...p, push: e.target.checked }))}
                  className="rounded"
                />
                Push notifications
              </label>
              <Button size="sm" variant="outline" onClick={handleSaveNotifPrefs} className="mt-2 border-white/20">
                Save preferences
              </Button>
            </div>
          </div>

          <div>
            <p className="text-white/80 mb-2 flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Two-factor authentication (optional)
            </p>
            <p className="text-white/50 text-sm mb-2">
              Add an extra layer of security. You can enable 2FA later in Settings → Security.
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
            <p className="text-white/80 mb-2 flex items-center gap-2">
              <FileSignature className="h-4 w-4" />
              Sign initial documents
            </p>
            <p className="text-white/50 text-sm mb-2">
              Sign your employment contract, house rules, or consent forms as applicable. You may receive an email with a signing link.
            </p>
            {onboardingDocs.length > 0 ? (
              <div className="space-y-2">
                {onboardingDocs.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-2 rounded-lg bg-white/5">
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
                  <p className="text-green-400 text-sm flex items-center gap-1">
                    <CheckCircle className="h-4 w-4" />
                    Signature request sent
                  </p>
                )}
              </div>
            ) : (
              <p className="text-white/40 text-sm italic">No documents required for your role.</p>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              onClick={handleStartTutorial}
              disabled={!confirmedRole || !confirmedResponsibilities}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Start Guided Tour
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
    </ErrorBoundary>
  )
}
