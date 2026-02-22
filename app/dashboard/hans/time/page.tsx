"use client"

import DashboardLayout from "@/components/dashboard-layout"
import { TimePage } from "@/components/shared/time-page"

export default function HansTimePage() {
  return (
    <DashboardLayout persona="hans">
      <TimePage personaId="hans" title="Time & Attendance" showAll />
    </DashboardLayout>
  )
}
