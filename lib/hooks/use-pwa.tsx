"use client"

import { useEffect, useState } from 'react'
import { logger } from '@/lib/logger'

export function usePWA() {
  const [isInstalled, setIsInstalled] = useState(false)
  const [isOnline, setIsOnline] = useState(true)
  const [canInstall, setCanInstall] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [swRegistration, setSwRegistration] = useState<ServiceWorkerRegistration | null>(null)

  useEffect(() => {
    // Check if running as PWA
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
    setIsInstalled(isStandalone)

    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          logger.info('[PWA] Service Worker registered', { scope: registration.scope })
          setSwRegistration(registration)
        })
        .catch((error) => {
          logger.error('[PWA] Service Worker registration failed', { error: error instanceof Error ? error.message : String(error) })
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

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Set initial online status
    setIsOnline(navigator.onLine)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const installApp = async () => {
    if (!deferredPrompt) return false

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    
    if (outcome === 'accepted') {
      setIsInstalled(true)
      setCanInstall(false)
    }
    
    setDeferredPrompt(null)
    return outcome === 'accepted'
  }

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      logger.info('[PWA] Notifications not supported')
      return false
    }

    const permission = await Notification.requestPermission()
    return permission === 'granted'
  }

  const subscribeToPush = async () => {
    if (!swRegistration) return null

    try {
      const subscription = await swRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
      })
      
      // Send subscription to server
      await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscription),
      })

      return subscription
    } catch (error) {
      logger.error('[PWA] Push subscription failed', { error: error instanceof Error ? error.message : String(error) })
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
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
      <div className="bg-linear-to-r from-blue-600 to-blue-700 rounded-xl p-4 shadow-2xl border border-blue-500/30">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
            <span className="text-white font-bold text-lg">HV</span>
          </div>
          <div className="flex-1">
            <h3 className="text-white font-semibold">Install House of Veritas</h3>
            <p className="text-white/80 text-sm mt-1">
              Install our app for quick access and offline support
            </p>
            <div className="flex gap-2 mt-3">
              <button
                onClick={installApp}
                className="px-4 py-2 rounded-lg bg-white text-blue-600 font-medium text-sm hover:bg-white/90 transition-colors"
              >
                Install
              </button>
              <button
                onClick={() => setDismissed(true)}
                className="px-4 py-2 rounded-lg bg-white/20 text-white font-medium text-sm hover:bg-white/30 transition-colors"
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
    <div className="fixed top-0 left-0 right-0 z-50 bg-amber-500 text-amber-950 px-4 py-2 text-center text-sm font-medium">
      You're offline. Some features may be limited.
    </div>
  )
}
