"use client"

import DashboardLayout from "@/components/dashboard-layout"
import { ExpensesPage } from "@/components/shared/expenses-page"

export default function HansExpensesPage() {
  return (
    <DashboardLayout persona="hans">
      <ExpensesPage personaId="hans" title="Expenses" showAll />
    </DashboardLayout>
  )
}
