"use client"

import DashboardLayout from "@/components/dashboard-layout"
import { DocumentsPage } from "@/components/shared/documents-page"

export default function IrmaDocumentsPage() {
  return (
    <DashboardLayout persona="irma">
      <DocumentsPage personaId="irma" personaName="Irma" title="My Documents" />
    </DashboardLayout>
  )
}
