"use client"

import DashboardLayout from "@/components/dashboard-layout"
import { ProjectsPageContent } from "@/components/projects-page-content"

export default function CharlProjectsPage() {
  return (
    <DashboardLayout persona="charl">
      <ProjectsPageContent persona="charl" isAdmin={false} />
    </DashboardLayout>
  )
}
