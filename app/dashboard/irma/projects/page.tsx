"use client"

import DashboardLayout from "@/components/dashboard-layout"
import { ProjectsPageContent } from "@/components/projects-page-content"

export default function IrmaProjectsPage() {
  return (
    <DashboardLayout persona="irma">
      <ProjectsPageContent persona="irma" isAdmin={false} />
    </DashboardLayout>
  )
}
