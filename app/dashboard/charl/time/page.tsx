"use client"

import DashboardLayout from "@/components/dashboard-layout"
import { TimePage } from "@/components/shared/time-page"

export default function CharlTimePage() {
  return (
    <DashboardLayout persona="charl">
      <TimePage personaId="charl" title="Time Clock" />
    </DashboardLayout>
  )
}
