"use client"

import DashboardLayout from "@/components/dashboard-layout"
import { TasksPage } from "@/components/shared/tasks-page"

export default function LuckyTasksPage() {
  return (
    <DashboardLayout persona="lucky">
      <TasksPage personaId="lucky" title="My Tasks" />
    </DashboardLayout>
  )
}
