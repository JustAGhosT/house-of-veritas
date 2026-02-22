"use client"

import DashboardLayout from "@/components/dashboard-layout"
import { TasksPage } from "@/components/shared/tasks-page"

export default function HansTasksPage() {
  return (
    <DashboardLayout persona="hans">
      <TasksPage personaId="hans" title="Tasks" showAll canAddTask />
    </DashboardLayout>
  )
}
