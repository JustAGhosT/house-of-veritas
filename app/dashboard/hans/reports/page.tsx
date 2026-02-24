"use client"

import DashboardLayout from "@/components/dashboard-layout"
import { ReportsPanel } from "@/components/reports-panel"
import { ActivityTimeline } from "@/components/activity-timeline"
import { FileText, History } from "lucide-react"
import { useState } from "react"

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState<"reports" | "activity">("reports")

  return (
    <DashboardLayout persona="hans">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Reports & Activity</h1>
          <p className="mt-1 text-white/60">Generate reports and view activity logs</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("reports")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 transition-colors ${
              activeTab === "reports"
                ? "bg-blue-600 text-white"
                : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
            }`}
          >
            <FileText className="h-4 w-4" />
            Reports
          </button>
          <button
            onClick={() => setActiveTab("activity")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 transition-colors ${
              activeTab === "activity"
                ? "bg-blue-600 text-white"
                : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
            }`}
          >
            <History className="h-4 w-4" />
            Activity Log
          </button>
        </div>

        {/* Content */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          {activeTab === "reports" ? (
            <ReportsPanel />
          ) : (
            <div>
              <h2 className="mb-4 font-semibold text-white">Activity Timeline</h2>
              <ActivityTimeline showFilters limit={50} />
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
