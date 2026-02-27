import { Suspense } from "react"
import { SmoothScroll } from "@/components/smooth-scroll"
import { Navbar } from "@/components/navbar"
import { Hero } from "@/components/hero"
import { StatsSection } from "@/components/stats-section"
import { FeatureModules } from "@/components/feature-modules"
import { DashboardPreview } from "@/components/dashboard-preview"
import { RoleDashboards } from "@/components/role-dashboards"
import { ComplianceSection } from "@/components/compliance-section"
import { FinalCTA } from "@/components/final-cta"
import { Footer } from "@/components/footer"
import { GridPattern } from "@/components/grid-pattern"
import { LoginRedirectHandler } from "@/components/login-redirect-handler"

export default function Home() {
  return (
    <SmoothScroll>
      <main className="relative min-h-screen bg-zinc-950">
        <GridPattern />
        <div className="relative z-10">
          <Suspense fallback={null}>
            <LoginRedirectHandler />
          </Suspense>
          <Navbar />
          <Hero />
          <StatsSection />
          <FeatureModules />
          <DashboardPreview />
          <RoleDashboards />
          <ComplianceSection />
          <FinalCTA />
          <Footer />
        </div>
      </main>
    </SmoothScroll>
  )
}
