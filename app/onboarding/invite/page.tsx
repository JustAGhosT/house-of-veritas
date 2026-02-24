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
    <div className="flex min-h-screen items-center justify-center bg-[#0a0a0f]">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500/30 border-t-blue-500" />
    </div>
  )
}

export default function OnboardingInvitePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#0a0a0f]">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500/30 border-t-blue-500" />
        </div>
      }
    >
      <InviteRedirect />
    </Suspense>
  )
}
