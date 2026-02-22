"use client"

import DashboardLayout from "@/components/dashboard-layout"
import { VehiclesPage } from "@/components/shared/vehicles-page"

export default function HansVehiclesPage() {
  return (
    <DashboardLayout persona="hans">
      <VehiclesPage personaId="hans" title="Vehicles" showAll />
    </DashboardLayout>
  )
}
