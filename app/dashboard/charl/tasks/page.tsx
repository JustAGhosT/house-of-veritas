"use client"

import DashboardLayout from "@/components/dashboard-layout"
import { TasksPage } from "@/components/shared/tasks-page"

export default function CharlTasksPage() {
  return (
    <DashboardLayout persona="charl">
      <TasksPage personaId="charl" title="My Tasks" />
    </DashboardLayout>
  )
}
