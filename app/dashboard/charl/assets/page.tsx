"use client"

import DashboardLayout from "@/components/dashboard-layout"
import { AssetsPage } from "@/components/shared/assets-page"

export default function CharlAssetsPage() {
  return (
    <DashboardLayout persona="charl">
      <AssetsPage personaId="charl" title="Assets" />
    </DashboardLayout>
  )
}
