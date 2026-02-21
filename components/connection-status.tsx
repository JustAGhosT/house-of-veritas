"use client"

import { useEffect, useState } from "react"
import { Wifi, WifiOff } from "lucide-react"

export function ConnectionStatus() {
  const [status, setStatus] = useState<"connected" | "mock" | "error" | "loading">("loading")

  useEffect(() => {
    async function check() {
      try {
        const res = await fetch("/api/stats")
        if (!res.ok) {
          setStatus("error")
          return
        }
        const data = await res.json()
        setStatus(data.dataSource === "live" ? "connected" : "mock")
      } catch {
        setStatus("error")
      }
    }
    check()
    const interval = setInterval(check, 60_000)
    return () => clearInterval(interval)
  }, [])

  if (status === "loading") return null

  if (status === "connected") return null

  return (
    <div
      className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${
        status === "mock"
          ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
          : "bg-red-500/10 text-red-400 border border-red-500/20"
      }`}
    >
      {status === "error" ? (
        <>
          <WifiOff className="h-3 w-3" />
          Services Offline
        </>
      ) : (
        <>
          <Wifi className="h-3 w-3" />
          Demo Mode
        </>
      )}
    </div>
  )
}
