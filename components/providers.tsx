"use client"

import { AuthProvider } from "@/lib/auth-context"
import { NotificationProvider } from "@/lib/notification-context"
import { I18nProvider } from "@/lib/i18n/context"
import { PWAInstallBanner, OfflineStatusBanner } from "@/lib/hooks/use-pwa"
import { ReactNode } from "react"

export function Providers({ children }: { children: ReactNode }) {
  return (
    <I18nProvider>
      <AuthProvider>
        <NotificationProvider>
          <OfflineStatusBanner />
          {children}
          <PWAInstallBanner />
        </NotificationProvider>
      </AuthProvider>
    </I18nProvider>
  )
}
