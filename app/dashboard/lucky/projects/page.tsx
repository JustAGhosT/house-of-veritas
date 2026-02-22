"use client"

import DashboardLayout from "@/components/dashboard-layout"
import { ProjectsPageContent } from "@/components/projects-page-content"

export default function LuckyProjectsPage() {
  return (
    <DashboardLayout persona="lucky">
      <ProjectsPageContent persona="lucky" isAdmin={false} />
    </DashboardLayout>
  )
}
