"use client"

import { AuthProvider } from "@/lib/auth-context"
import { NotificationProvider } from "@/lib/notification-context"
import { I18nProvider } from "@/lib/i18n/context"
import { PWAInstallBanner, OfflineStatusBanner } from "@/lib/hooks/use-pwa"
import { LoginModalProvider } from "@/lib/login-modal-context"
import { ReactNode } from "react"

export function Providers({ children }: { children: ReactNode }) {
  return (
    <I18nProvider>
      <AuthProvider>
        <NotificationProvider>
          <LoginModalProvider>
            <OfflineStatusBanner />
            {children}
            <PWAInstallBanner />
          </LoginModalProvider>
        </NotificationProvider>
      </AuthProvider>
    </I18nProvider>
  )
}
