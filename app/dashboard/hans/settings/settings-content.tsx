"use client"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { useI18n, LanguageSelector } from "@/lib/i18n/context"
import { usePWA } from "@/lib/hooks/use-pwa"
import { useAuth } from "@/lib/auth-context"
import {
  User,
  Globe,
  Bell,
  Smartphone,
  Shield,
  Package,
  Plus,
  X,
  Save,
  CheckCircle,
  Trash2,
  Download,
} from "lucide-react"

function ToggleSetting({
  label,
  description,
  checked,
  onChange,
}: {
  label: string
  description: string
  checked: boolean
  onChange: (val: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-white">{label}</p>
        <p className="text-white/50 text-sm">{description}</p>
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative w-12 h-6 rounded-full transition-colors ${checked ? "bg-blue-600" : "bg-white/20"}`}
        aria-label={`${label}: ${checked ? "on" : "off"}`}
      >
        <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${checked ? "left-7" : "left-1"}`} />
      </button>
    </div>
  )
}

export function SettingsPageContent({ persona }: { persona: "hans" | "charl" | "lucky" | "irma" }) {
  const { user } = useAuth()
  const { t } = useI18n()
  const { isInstalled, canInstall, installApp, requestNotificationPermission } = usePWA()
  const [saved, setSaved] = useState(false)
  const [settings, setSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    dailyDigest: true,
    weeklyReport: false,
    darkMode: true,
  })
  const [storageOptions, setStorageOptions] = useState<string[]>([])
  const [newStorageOption, setNewStorageOption] = useState("")
  const [storageOptionsSaved, setStorageOptionsSaved] = useState(false)

  useEffect(() => {
    fetch("/api/settings/storage-options")
      .then((r) => r.json())
      .then((d) => setStorageOptions(d.options || []))
      .catch(() => setStorageOptions([]))
  }, [])

  const handleSave = () => {
    localStorage.setItem("hov_settings", JSON.stringify(settings))
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const handleEnablePush = async () => {
    const granted = await requestNotificationPermission()
    if (granted) setSettings((prev) => ({ ...prev, pushNotifications: true }))
  }

  const handleAddStorageOption = () => {
    const v = newStorageOption.trim()
    if (v && !storageOptions.includes(v)) {
      setStorageOptions((prev) => [...prev, v])
      setNewStorageOption("")
    }
  }

  const handleRemoveStorageOption = (opt: string) => {
    setStorageOptions((prev) => prev.filter((o) => o !== opt))
  }

  const handleSaveStorageOptions = async () => {
    try {
      const res = await fetch("/api/settings/storage-options", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ options: storageOptions }),
      })
      if (res.ok) {
        setStorageOptionsSaved(true)
        setTimeout(() => setStorageOptionsSaved(false), 3000)
      }
    } catch {
      // ignore
    }
  }

  const isAdmin = persona === "hans"

  return (
    <DashboardLayout persona={persona}>
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-white">{t("settings.profile")}</h1>
          <p className="text-white/60 mt-1">Manage your account settings and preferences</p>
        </div>

        <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
          <div className="p-6 border-b border-white/10 flex items-center gap-3">
            <User className="w-5 h-5 text-blue-400" />
            <h2 className="text-white font-semibold">{t("settings.profile")}</h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="settings-name" className="block text-white/60 text-sm mb-2">Name</label>
                <input id="settings-name" type="text" value={user?.name || ""} disabled className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white/60" />
              </div>
              <div>
                <label htmlFor="settings-email" className="block text-white/60 text-sm mb-2">Email</label>
                <input id="settings-email" type="email" value={user?.email || ""} disabled className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white/60" />
              </div>
              <div>
                <label htmlFor="settings-role" className="block text-white/60 text-sm mb-2">Role</label>
                <input id="settings-role" type="text" value={user?.role || ""} disabled className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white/60" />
              </div>
              <div>
                <label htmlFor="settings-phone" className="block text-white/60 text-sm mb-2">Phone</label>
                <input id="settings-phone" type="tel" value={user?.phone || ""} disabled className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white/60" />
              </div>
            </div>
          </div>
        </div>

        {isAdmin && (
          <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
            <div className="p-6 border-b border-white/10 flex items-center gap-3">
              <Package className="w-5 h-5 text-amber-400" />
              <h2 className="text-white font-semibold">Asset Storage Options</h2>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-white/60 text-sm">Manage storage locations for assets (kitchen, storeroom, garage, etc.).</p>
              <div className="flex gap-2">
                <label htmlFor="new-storage-option" className="sr-only">New storage option</label>
                <input
                  id="new-storage-option"
                  type="text"
                  value={newStorageOption}
                  onChange={(e) => setNewStorageOption(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddStorageOption())}
                  placeholder="e.g. basement"
                  className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder:text-white/40"
                />
                <button onClick={handleAddStorageOption} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors">
                  <Plus className="w-4 h-4" />
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {storageOptions.map((opt) => (
                  <span key={opt} className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/10 text-white text-sm">
                    {opt}
                    <button onClick={() => handleRemoveStorageOption(opt)} className="p-0.5 rounded hover:bg-white/20" aria-label={`Remove ${opt}`}>
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <button
                onClick={handleSaveStorageOptions}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
              >
                {storageOptionsSaved ? (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Saved
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Storage Options
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
          <div className="p-6 border-b border-white/10 flex items-center gap-3">
            <Globe className="w-5 h-5 text-green-400" />
            <h2 className="text-white font-semibold">{t("settings.language")}</h2>
          </div>
          <div className="p-6">
            <div className="flex justify-between">
              <div>
                <p className="text-white">Display Language</p>
                <p className="text-white/50 text-sm">Choose your preferred language</p>
              </div>
              <LanguageSelector />
            </div>
          </div>
        </div>

        <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
          <div className="p-6 border-b border-white/10 flex items-center gap-3">
            <Bell className="w-5 h-5 text-amber-400" />
            <h2 className="text-white font-semibold">{t("settings.notifications")}</h2>
          </div>
          <div className="p-6 space-y-4">
            <ToggleSetting label="Email Notifications" description="Receive updates via email" checked={settings.emailNotifications} onChange={(val) => setSettings((prev) => ({ ...prev, emailNotifications: val }))} />
            <ToggleSetting label="SMS Notifications" description="Receive urgent alerts via SMS" checked={settings.smsNotifications} onChange={(val) => setSettings((prev) => ({ ...prev, smsNotifications: val }))} />
            <ToggleSetting
              label="Push Notifications"
              description="Receive browser/app notifications"
              checked={settings.pushNotifications}
              onChange={(val) => (val ? handleEnablePush() : setSettings((prev) => ({ ...prev, pushNotifications: false })))}
            />
            <ToggleSetting label="Daily Digest" description="Receive a daily summary" checked={settings.dailyDigest} onChange={(val) => setSettings((prev) => ({ ...prev, dailyDigest: val }))} />
            <ToggleSetting label="Weekly Report" description="Receive a weekly report" checked={settings.weeklyReport} onChange={(val) => setSettings((prev) => ({ ...prev, weeklyReport: val }))} />
          </div>
        </div>

        <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
          <div className="p-6 border-b border-white/10 flex items-center gap-3">
            <Smartphone className="w-5 h-5 text-purple-400" />
            <h2 className="text-white font-semibold">App Settings</h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex justify-between">
              <div>
                <p className="text-white">Install App</p>
                <p className="text-white/50 text-sm">{isInstalled ? "App is installed" : "Install for offline access"}</p>
              </div>
              {isInstalled ? (
                <span className="flex items-center gap-2 text-green-400 text-sm">
                  <CheckCircle className="w-4 h-4" />
                  Installed
                </span>
              ) : canInstall ? (
                <button onClick={installApp} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors">
                  <Download className="w-4 h-4" />
                  Install
                </button>
              ) : (
                <span className="text-white/40 text-sm">Not available</span>
              )}
            </div>
            <ToggleSetting label="Dark Mode" description="Use dark theme" checked={settings.darkMode} onChange={(val) => setSettings((prev) => ({ ...prev, darkMode: val }))} />
          </div>
        </div>

        <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
          <div className="p-6 border-b border-white/10 flex items-center gap-3">
            <Shield className="w-5 h-5 text-red-400" />
            <h2 className="text-white font-semibold">Security</h2>
          </div>
          <div className="p-6 space-y-4">
            <p className="text-white/60 text-sm">Change password and clear data from the profile dropdown (top right).</p>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white">Clear Local Data</p>
                <p className="text-white/50 text-sm">Remove cached data from this device</p>
              </div>
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 transition-colors">
                <Trash2 className="w-4 h-4" />
                Clear
              </button>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          {saved && (
            <span className="flex items-center gap-2 text-green-400">
              <CheckCircle className="w-4 h-4" />
              Settings saved
            </span>
          )}
          <button onClick={handleSave} className="flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors font-medium">
            <Save className="w-4 h-4" />
            Save Changes
          </button>
        </div>
      </div>
    </DashboardLayout>
  )
}
