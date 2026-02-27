"use client"

import { AuthProvider } from "@/lib/auth-context"
import { OfflineStatusBanner, PWAInstallBanner } from "@/lib/hooks/use-pwa"
import { I18nProvider } from "@/lib/i18n/context"
import { LoginModalProvider } from "@/lib/login-modal-context"
import { MotionProvider } from "@/lib/motion-context"
import { NotificationProvider } from "@/lib/notification-context"
import { ReactNode } from "react"

export function Providers({ children }: { children: ReactNode }) {
  return (
    <I18nProvider>
      <MotionProvider>
        <AuthProvider>
          <NotificationProvider>
            <LoginModalProvider>
              <OfflineStatusBanner />
              {children}
              <PWAInstallBanner />
            </LoginModalProvider>
          </NotificationProvider>
        </AuthProvider>
      </MotionProvider>
    </I18nProvider>
  )
}
