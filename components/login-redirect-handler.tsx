"use client"

import { useLoginModal } from "@/lib/login-modal-context"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect } from "react"

function LoginRedirectHandlerContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { openLoginModal } = useLoginModal()

  useEffect(() => {
    const shouldLogin = searchParams.get("login")
    if (shouldLogin === "true") {
      openLoginModal()
      // Remove the login query param to prevent reopening on remount
      const newParams = new URLSearchParams(searchParams.toString())
      newParams.delete("login")
      const newUrl = newParams.toString()
        ? `${window.location.pathname}?${newParams.toString()}${window.location.hash}`
        : `${window.location.pathname}${window.location.hash}`
      router.replace(newUrl)
    }
  }, [searchParams, openLoginModal, router])

  return null
}

export function LoginRedirectHandler() {
  return <LoginRedirectHandlerContent />
}
