"use client"

import DashboardLayout from "@/components/dashboard-layout"
import { DocumentsPage } from "@/components/shared/documents-page"

export default function HansDocumentsPage() {
  return (
    <DashboardLayout persona="hans">
      <DocumentsPage personaId="hans" personaName="Hans" title="Documents" />
    </DashboardLayout>
  )
}
