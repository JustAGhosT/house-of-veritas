"use client"

import { useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { useLoginModal } from "@/lib/login-modal-context"

export function LoginRedirectHandler() {
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
        ? `${window.location.pathname}?${newParams.toString()}`
        : window.location.pathname
      router.replace(newUrl)
    }
  }, [searchParams, openLoginModal, router])

  return null
}
