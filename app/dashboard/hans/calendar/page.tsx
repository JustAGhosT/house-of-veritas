"use client"

import DashboardLayout from '@/components/dashboard-layout'
import { CalendarPanel } from '@/components/calendar-panel'

export default function CalendarPage() {
  return (
    <DashboardLayout persona="hans">
      <div className="space-y-6">
        <CalendarPanel />
      </div>
    </DashboardLayout>
  )
}
