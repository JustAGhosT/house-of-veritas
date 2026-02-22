"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  LogOut,
  User,
  Phone,
  Key,
  RotateCcw,
  ChevronDown,
  Settings,
} from "lucide-react"
import Image from "next/image"

const colorClasses: Record<string, string> = {
  blue: "from-blue-500 to-blue-700",
  amber: "from-amber-500 to-amber-700",
  green: "from-green-500 to-green-700",
  purple: "from-purple-500 to-purple-700",
  gray: "from-gray-500 to-gray-700",
}

interface UserProfileDropdownProps {
  user: { id: string; name: string; email: string; phone?: string; role: string; color?: string; icon?: string; photoUrl?: string }
  personaInfo: { name: string; role: string; color: string; icon: string }
  onLogout: () => void
  onRepeatTutorial?: () => void
  compact?: boolean
}

export function UserProfileDropdown({
  user,
  personaInfo,
  onLogout,
  onRepeatTutorial,
  compact = false,
}: UserProfileDropdownProps) {
  const router = useRouter()
  const [editOpen, setEditOpen] = useState(false)
  const [passwordOpen, setPasswordOpen] = useState(false)
  const [phone, setPhone] = useState(user.phone || "")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (editOpen) setPhone(user.phone || "")
  }, [editOpen, user.phone])

  const color = user.color || personaInfo.color || "blue"
  const icon = user.icon || personaInfo.icon || "👤"

  const handleSaveProfile = async () => {
    setSaving(true)
    setError("")
    try {
      const res = await fetch("/api/users/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      })
      if (res.ok) {
        setEditOpen(false)
        router.refresh()
      } else {
        const data = await res.json()
        setError(data.error || "Failed to save")
      }
    } finally {
      setSaving(false)
    }
  }

  const handleSavePassword = async () => {
    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }
    setSaving(true)
    setError("")
    try {
      const res = await fetch("/api/users/me/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      })
      if (res.ok) {
        setPasswordOpen(false)
        setPassword("")
        setConfirmPassword("")
        router.refresh()
      } else {
        const data = await res.json()
        setError(data.error || "Failed to update password")
      }
    } finally {
      setSaving(false)
    }
  }

  const handleRepeatTutorial = () => {
    onRepeatTutorial?.()
    router.push(`/dashboard/${user.id}?tutorial=1`)
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className={`
              flex items-center gap-3 p-2 rounded-xl transition-all
              ${compact ? "w-full" : ""}
              hover:bg-white/10 text-left
            `}
            data-testid="user-profile-trigger"
          >
            <div className={`w-10 h-10 rounded-full overflow-hidden shrink-0 flex items-center justify-center relative ${user.photoUrl ? "bg-transparent" : `bg-linear-to-br ${colorClasses[color] || colorClasses.blue}`}`}>
              {user.photoUrl ? (
                <Image src={user.photoUrl} alt="" fill className="object-cover" unoptimized />
              ) : (
                <span className="text-lg">{icon}</span>
              )}
            </div>
            <div className="flex-1 min-w-0 hidden sm:block">
              <p className="text-white text-sm font-medium truncate">{user.name || personaInfo.name}</p>
              <p className="text-white/50 text-xs truncate">{user.role || personaInfo.role}</p>
            </div>
            <ChevronDown className="w-4 h-4 text-white/50 shrink-0" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 bg-[#0d0d12] border-white/10">
          <DropdownMenuItem onClick={() => router.push(`/dashboard/${user.id}/settings`)} className="text-white/80 focus:bg-white/10 focus:text-white">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setEditOpen(true)} className="text-white/80 focus:bg-white/10 focus:text-white">
            <User className="w-4 h-4 mr-2" />
            Edit profile
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setPasswordOpen(true)} className="text-white/80 focus:bg-white/10 focus:text-white">
            <Key className="w-4 h-4 mr-2" />
            Change password
          </DropdownMenuItem>
          {onRepeatTutorial && (
            <DropdownMenuItem onClick={handleRepeatTutorial} className="text-white/80 focus:bg-white/10 focus:text-white">
              <RotateCcw className="w-4 h-4 mr-2" />
              Repeat tutorial
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator className="bg-white/10" />
          <DropdownMenuItem
            onClick={onLogout}
            className="text-red-400 focus:bg-red-500/20 focus:text-red-400"
            data-testid="header-logout"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="bg-[#0d0d12] border-white/10 text-white">
          <DialogHeader>
            <DialogTitle>Edit profile</DialogTitle>
            <DialogDescription className="text-white/60">
              Update your phone number and other details.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label className="text-white/80">Phone</Label>
              <Input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-2 bg-white/5 border-white/10"
                placeholder="+27..."
              />
            </div>
            {error && <p className="text-red-400 text-sm">{error}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)} className="border-white/10">
              Cancel
            </Button>
            <Button onClick={handleSaveProfile} disabled={saving} className="bg-blue-600 hover:bg-blue-700">
              {saving ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={passwordOpen} onOpenChange={(open) => { setPasswordOpen(open); if (!open) { setPassword(""); setConfirmPassword(""); setError(""); } }}>
        <DialogContent className="bg-[#0d0d12] border-white/10 text-white">
          <DialogHeader>
            <DialogTitle>Change password</DialogTitle>
            <DialogDescription className="text-white/60">
              Enter your new password. Must be at least 6 characters.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label className="text-white/80">New password</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-2 bg-white/5 border-white/10"
                placeholder="••••••••"
              />
            </div>
            <div>
              <Label className="text-white/80">Confirm password</Label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-2 bg-white/5 border-white/10"
                placeholder="••••••••"
              />
            </div>
            {error && <p className="text-red-400 text-sm">{error}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPasswordOpen(false)} className="border-white/10">
              Cancel
            </Button>
            <Button onClick={handleSavePassword} disabled={saving} className="bg-blue-600 hover:bg-blue-700">
              {saving ? "Saving..." : "Update"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
