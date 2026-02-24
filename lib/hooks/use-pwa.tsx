"use client"

import { useEffect, useState } from "react"
import { logger } from "@/lib/logger"
import { apiFetch } from "@/lib/api-client"

export function usePWA() {
  const [isInstalled, setIsInstalled] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia("(display-mode: standalone)").matches : false
  )
  const [isOnline, setIsOnline] = useState(() =>
    typeof window !== "undefined" ? navigator.onLine : true
  )
  const [canInstall, setCanInstall] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [swRegistration, setSwRegistration] = useState<ServiceWorkerRegistration | null>(null)

  useEffect(() => {
    // Register service worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          logger.info("[PWA] Service Worker registered", { scope: registration.scope })
          setSwRegistration(registration)
        })
        .catch((error) => {
          logger.error("[PWA] Service Worker registration failed", {
            error: error instanceof Error ? error.message : String(error),
          })
        })
    }

    // Handle install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setCanInstall(true)
    }

    // Handle online/offline status
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  const installApp = async () => {
    if (!deferredPrompt) return false

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === "accepted") {
      setIsInstalled(true)
      setCanInstall(false)
    }

    setDeferredPrompt(null)
    return outcome === "accepted"
  }

  const requestNotificationPermission = async () => {
    if (!("Notification" in window)) {
      logger.info("[PWA] Notifications not supported")
      return false
    }

    const permission = await Notification.requestPermission()
    return permission === "granted"
  }

  const subscribeToPush = async () => {
    if (!swRegistration) return null

    try {
      const subscription = await swRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
      })

      await apiFetch("/api/notifications/subscribe", {
        method: "POST",
        body: subscription.toJSON ? subscription.toJSON() : subscription,
        label: "PushSubscribe",
      })

      return subscription
    } catch (error) {
      logger.error("[PWA] Push subscription failed", {
        error: error instanceof Error ? error.message : String(error),
      })
      return null
    }
  }

  return {
    isInstalled,
    isOnline,
    canInstall,
    installApp,
    requestNotificationPermission,
    subscribeToPush,
    swRegistration,
  }
}

// PWA Install Banner Component
export function PWAInstallBanner() {
  const { canInstall, installApp, isInstalled } = usePWA()
  const [dismissed, setDismissed] = useState(false)

  if (isInstalled || !canInstall || dismissed) return null

  return (
    <div className="animate-in slide-in-from-bottom-5 fade-in fixed right-4 bottom-4 left-4 z-50 duration-300 md:right-4 md:left-auto md:w-96">
      <div className="rounded-xl border border-blue-500/30 bg-linear-to-r from-blue-600 to-blue-700 p-4 shadow-2xl">
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/20">
            <span className="text-lg font-bold text-white">HV</span>
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-white">Install House of Veritas</h3>
            <p className="mt-1 text-sm text-white/80">
              Install our app for quick access and offline support
            </p>
            <div className="mt-3 flex gap-2">
              <button
                onClick={installApp}
                className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-blue-600 transition-colors hover:bg-white/90"
              >
                Install
              </button>
              <button
                onClick={() => setDismissed(true)}
                className="rounded-lg bg-white/20 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/30"
              >
                Not now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Offline Status Banner
export function OfflineStatusBanner() {
  const { isOnline } = usePWA()

  if (isOnline) return null

  return (
    <div className="fixed top-0 right-0 left-0 z-50 bg-amber-500 px-4 py-2 text-center text-sm font-medium text-amber-950">
      You&apos;re offline. Some features may be limited.
    </div>
  )
}
