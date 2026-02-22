"use client"

import DashboardLayout from "@/components/dashboard-layout"
import { DocumentsPage } from "@/components/shared/documents-page"

export default function LuckyDocumentsPage() {
  return (
    <DashboardLayout persona="lucky">
      <DocumentsPage personaId="lucky" personaName="Lucky" title="My Documents" />
    </DashboardLayout>
  )
}
