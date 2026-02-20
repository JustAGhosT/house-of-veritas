"use client"

import DashboardLayout from '@/components/dashboard-layout'
import { PredictiveMaintenancePanel } from '@/components/predictive-maintenance'

export default function MaintenancePage() {
  return (
    <DashboardLayout persona="hans">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Predictive Maintenance</h1>
          <p className="text-white/60 mt-1">AI-powered maintenance predictions and cost forecasting</p>
        </div>

        <PredictiveMaintenancePanel />
      </div>
    </DashboardLayout>
  )
}
