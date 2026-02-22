"use client"

import DashboardLayout from "@/components/dashboard-layout"
import { DocumentsPage } from "@/components/shared/documents-page"

export default function CharlDocumentsPage() {
  return (
    <DashboardLayout persona="charl">
      <DocumentsPage personaId="charl" personaName="Charl" title="My Documents" />
    </DashboardLayout>
  )
}
