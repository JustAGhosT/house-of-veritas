"use client"

import { useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { useLoginModal } from "@/lib/login-modal-context"

export function LoginRedirectHandler() {
  const searchParams = useSearchParams()
  const { openLoginModal } = useLoginModal()

  useEffect(() => {
    const shouldLogin = searchParams.get("login")
    if (shouldLogin === "true") {
      openLoginModal()
    }
  }, [searchParams, openLoginModal])

  return null
}
