"use client"

import DashboardLayout from "@/components/dashboard-layout"
import { ExpensesPage } from "@/components/shared/expenses-page"

export default function LuckyExpensesPage() {
  return (
    <DashboardLayout persona="lucky">
      <ExpensesPage personaId="lucky" title="Expenses" />
    </DashboardLayout>
  )
}
