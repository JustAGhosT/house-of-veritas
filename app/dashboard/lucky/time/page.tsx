"use client"

import DashboardLayout from "@/components/dashboard-layout"
import { TimePage } from "@/components/shared/time-page"

export default function LuckyTimePage() {
  return (
    <DashboardLayout persona="lucky">
      <TimePage personaId="lucky" title="Time Clock" />
    </DashboardLayout>
  )
}
