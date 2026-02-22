"use client"

import DashboardLayout from "@/components/dashboard-layout"
import { EmployeesPage } from "@/components/shared/employees-page"

export default function HansEmployeesPage() {
  return (
    <DashboardLayout persona="hans">
      <EmployeesPage />
    </DashboardLayout>
  )
}
