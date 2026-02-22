"use client"

import DashboardLayout from "@/components/dashboard-layout"
import { TasksPage } from "@/components/shared/tasks-page"

export default function IrmaTasksPage() {
  return (
    <DashboardLayout persona="irma">
      <TasksPage personaId="irma" title="Household Tasks" />
    </DashboardLayout>
  )
}
