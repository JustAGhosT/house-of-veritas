"use client"

import { Suspense, useEffect } from "react"
import { useSearchParams } from "next/navigation"

function InviteRedirect() {
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  useEffect(() => {
    if (token) {
      window.location.href = `/api/auth/invite-accept?token=${encodeURIComponent(token)}`
    } else {
      window.location.href = "/login?error=missing_token"
    }
  }, [token])

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
    </div>
  )
}

export default function OnboardingInvitePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
      </div>
    }>
      <InviteRedirect />
    </Suspense>
  )
}
