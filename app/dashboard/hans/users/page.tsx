"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function HansUsersRedirect() {
  const router = useRouter()
  useEffect(() => {
    router.replace("/dashboard/hans/team")
  }, [router])
  return null
}
