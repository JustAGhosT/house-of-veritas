import type React from "react"
import type { Metadata } from "next"
import { Manrope, Inter } from "next/font/google"
import { Providers } from "@/components/providers"
import { ErrorBoundary } from "@/components/error-boundary"
import "./globals.css"

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
})

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

export const viewport = {
  themeColor: "#1E40AF",
  width: "device-width",
  initialScale: 1,
}

export const metadata: Metadata = {
  title: "House of Veritas - Digital Governance & Estate Management",
  description:
    "Secure platform for estate management, document compliance, and operational accountability. BCEA-compliant with full audit trails.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "House of Veritas",
  },
  formatDetection: {
    telephone: true,
  },
  icons: {
    icon: "/icons/icon.svg",
    apple: "/icons/icon-192x192.svg",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${manrope.variable} ${inter.variable} font-sans antialiased`}>
        <div className="noise-overlay" aria-hidden="true" />
        <Providers>
          <ErrorBoundary>{children}</ErrorBoundary>
        </Providers>
      </body>
    </html>
  )
}
