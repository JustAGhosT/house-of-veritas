"use client"

import { useState } from 'react'
import DashboardLayout from '@/components/dashboard-layout'
import { useI18n, LanguageSelector } from '@/lib/i18n/context'
import { usePWA } from '@/lib/hooks/use-pwa'
import { useAuth } from '@/lib/auth-context'
import {
  User,
  Globe,
  Bell,
  Smartphone,
  Shield,
  Moon,
  Download,
  Trash2,
  Save,
  CheckCircle,
} from 'lucide-react'

export default function SettingsPage() {
  const { user } = useAuth()
  const { language, t } = useI18n()
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

  const handleSave = () => {
    // In production, save to backend
    localStorage.setItem('hov_settings', JSON.stringify(settings))
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const handleEnablePush = async () => {
    const granted = await requestNotificationPermission()
    if (granted) {
      setSettings(prev => ({ ...prev, pushNotifications: true }))
    }
  }

  return (
    <DashboardLayout persona="hans">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-white">{t('settings.profile')}</h1>
          <p className="text-white/60 mt-1">Manage your account settings and preferences</p>
        </div>

        {/* Profile Section */}
        <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
          <div className="p-6 border-b border-white/10 flex items-center gap-3">
            <User className="w-5 h-5 text-blue-400" />
            <h2 className="text-white font-semibold">{t('settings.profile')}</h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-white/60 text-sm mb-2">Name</label>
                <input
                  type="text"
                  value={user?.name || ''}
                  disabled
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white/60"
                />
              </div>
              <div>
                <label className="block text-white/60 text-sm mb-2">Email</label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white/60"
                />
              </div>
              <div>
                <label className="block text-white/60 text-sm mb-2">Role</label>
                <input
                  type="text"
                  value={user?.role || ''}
                  disabled
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white/60"
                />
              </div>
              <div>
                <label className="block text-white/60 text-sm mb-2">Phone</label>
                <input
                  type="tel"
                  value={user?.phone || ''}
                  disabled
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white/60"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Language Section */}
        <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
          <div className="p-6 border-b border-white/10 flex items-center gap-3">
            <Globe className="w-5 h-5 text-green-400" />
            <h2 className="text-white font-semibold">{t('settings.language')}</h2>
          </div>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white">Display Language</p>
                <p className="text-white/50 text-sm">Choose your preferred language</p>
              </div>
              <LanguageSelector />
            </div>
          </div>
        </div>

        {/* Notifications Section */}
        <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
          <div className="p-6 border-b border-white/10 flex items-center gap-3">
            <Bell className="w-5 h-5 text-amber-400" />
            <h2 className="text-white font-semibold">{t('settings.notifications')}</h2>
          </div>
          <div className="p-6 space-y-4">
            <ToggleSetting
              label="Email Notifications"
              description="Receive updates via email"
              checked={settings.emailNotifications}
              onChange={(val) => setSettings(prev => ({ ...prev, emailNotifications: val }))}
            />
            <ToggleSetting
              label="SMS Notifications"
              description="Receive urgent alerts via SMS"
              checked={settings.smsNotifications}
              onChange={(val) => setSettings(prev => ({ ...prev, smsNotifications: val }))}
            />
            <ToggleSetting
              label="Push Notifications"
              description="Receive browser/app notifications"
              checked={settings.pushNotifications}
              onChange={(val) => {
                if (val) handleEnablePush()
                else setSettings(prev => ({ ...prev, pushNotifications: false }))
              }}
            />
            <ToggleSetting
              label="Daily Digest"
              description="Receive a daily summary of activities"
              checked={settings.dailyDigest}
              onChange={(val) => setSettings(prev => ({ ...prev, dailyDigest: val }))}
            />
            <ToggleSetting
              label="Weekly Report"
              description="Receive a weekly performance report"
              checked={settings.weeklyReport}
              onChange={(val) => setSettings(prev => ({ ...prev, weeklyReport: val }))}
            />
          </div>
        </div>

        {/* App Settings */}
        <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
          <div className="p-6 border-b border-white/10 flex items-center gap-3">
            <Smartphone className="w-5 h-5 text-purple-400" />
            <h2 className="text-white font-semibold">App Settings</h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white">Install App</p>
                <p className="text-white/50 text-sm">
                  {isInstalled ? 'App is installed' : 'Install for offline access'}
                </p>
              </div>
              {isInstalled ? (
                <span className="flex items-center gap-2 text-green-400 text-sm">
                  <CheckCircle className="w-4 h-4" />
                  Installed
                </span>
              ) : canInstall ? (
                <button
                  onClick={installApp}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Install
                </button>
              ) : (
                <span className="text-white/40 text-sm">Not available</span>
              )}
            </div>
            
            <ToggleSetting
              label="Dark Mode"
              description="Use dark theme (recommended)"
              checked={settings.darkMode}
              onChange={(val) => setSettings(prev => ({ ...prev, darkMode: val }))}
            />
          </div>
        </div>

        {/* Security Section */}
        <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
          <div className="p-6 border-b border-white/10 flex items-center gap-3">
            <Shield className="w-5 h-5 text-red-400" />
            <h2 className="text-white font-semibold">Security</h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white">Change Password</p>
                <p className="text-white/50 text-sm">Update your account password</p>
              </div>
              <button className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors">
                Change
              </button>
            </div>
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

        {/* Save Button */}
        <div className="flex items-center justify-end gap-4">
          {saved && (
            <span className="flex items-center gap-2 text-green-400">
              <CheckCircle className="w-4 h-4" />
              Settings saved
            </span>
          )}
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors font-medium"
          >
            <Save className="w-4 h-4" />
            Save Changes
          </button>
        </div>
      </div>
    </DashboardLayout>
  )
}

function ToggleSetting({ 
  label, 
  description, 
  checked, 
  onChange 
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
        onClick={() => onChange(!checked)}
        className={`relative w-12 h-6 rounded-full transition-colors ${
          checked ? 'bg-blue-600' : 'bg-white/20'
        }`}
      >
        <span
          className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
            checked ? 'left-7' : 'left-1'
          }`}
        />
      </button>
    </div>
  )
}
