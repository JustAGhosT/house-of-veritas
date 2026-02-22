"use client"

import DashboardLayout from "@/components/dashboard-layout"
import { ProjectsPageContent } from "@/components/projects-page-content"

export default function ProjectsPage() {
  return (
    <DashboardLayout persona="hans">
      <ProjectsPageContent persona="hans" isAdmin />
    </DashboardLayout>
  )
}
