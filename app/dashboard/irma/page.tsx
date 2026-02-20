"use client"

import DashboardLayout from "@/components/dashboard-layout"
import {
  ClipboardList,
  FileText,
  CheckCircle,
  Circle,
  AlertCircle,
  Home,
  Calendar,
  ChevronRight,
} from "lucide-react"

export default function IrmaDashboard() {
  return (
    <DashboardLayout persona="irma">
      {/* Welcome Banner */}
      <div className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-purple-600/20 to-purple-800/20 border border-purple-500/30">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-xl bg-purple-500/20 flex items-center justify-center text-3xl">
            🏠
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Good Morning, Irma</h2>
            <p className="text-white/60">Here's your household overview for today</p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
          <div className="flex items-center gap-3 mb-2">
            <ClipboardList className="w-5 h-5 text-purple-400" />
            <p className="text-white/60 text-sm">Today's Tasks</p>
          </div>
          <p className="text-2xl font-bold text-white">3</p>
          <p className="text-purple-400 text-sm">2 completed</p>
        </div>
        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
          <div className="flex items-center gap-3 mb-2">
            <FileText className="w-5 h-5 text-purple-400" />
            <p className="text-white/60 text-sm">Documents</p>
          </div>
          <p className="text-2xl font-bold text-white">4</p>
          <p className="text-green-400 text-sm">All signed</p>
        </div>
        <div className="p-4 rounded-xl bg-white/5 border border-white/10 col-span-2 md:col-span-1">
          <div className="flex items-center gap-3 mb-2">
            <Calendar className="w-5 h-5 text-purple-400" />
            <p className="text-white/60 text-sm">This Week</p>
          </div>
          <p className="text-2xl font-bold text-white">8</p>
          <p className="text-white/50 text-sm">tasks scheduled</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Household Tasks */}
        <div className="bg-[#0d0d12] border border-white/10 rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Home className="w-5 h-5 text-purple-400" />
              <div>
                <h3 className="text-white font-semibold">Household Tasks</h3>
                <p className="text-white/50 text-sm">Today's roster</p>
              </div>
            </div>
          </div>
          <div className="p-4 space-y-3">
            <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer group">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <div className="flex-1">
                <p className="text-white/50 line-through">Morning kitchen clean</p>
                <p className="text-white/40 text-sm">Completed at 8:30 AM</p>
              </div>
              <ChevronRight className="w-4 h-4 text-white/40 group-hover:text-white/60" />
            </div>
            <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer group">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <div className="flex-1">
                <p className="text-white/50 line-through">Laundry - bedding</p>
                <p className="text-white/40 text-sm">Completed at 10:15 AM</p>
              </div>
              <ChevronRight className="w-4 h-4 text-white/40 group-hover:text-white/60" />
            </div>
            <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer group">
              <AlertCircle className="w-5 h-5 text-amber-400" />
              <div className="flex-1">
                <p className="text-white font-medium">Meal preparation - dinner</p>
                <p className="text-white/50 text-sm">Due by 5:00 PM</p>
              </div>
              <ChevronRight className="w-4 h-4 text-white/40 group-hover:text-white/60" />
            </div>
          </div>
          <div className="p-4 border-t border-white/10">
            <button className="w-full text-center text-purple-400 hover:text-purple-300 text-sm font-medium">
              View weekly schedule
            </button>
          </div>
        </div>

        {/* My Documents */}
        <div className="bg-[#0d0d12] border border-white/10 rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-purple-400" />
              <div>
                <h3 className="text-white font-semibold">My Documents</h3>
                <p className="text-white/50 text-sm">Signed agreements</p>
              </div>
            </div>
          </div>
          <div className="p-4 space-y-3">
            <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer group">
              <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-400" />
              </div>
              <div className="flex-1">
                <p className="text-white font-medium">Resident Agreement</p>
                <p className="text-white/50 text-sm">Signed Jan 2024 · Valid until Jan 2026</p>
              </div>
              <button className="text-purple-400 text-sm hover:text-purple-300">View</button>
            </div>
            <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer group">
              <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-400" />
              </div>
              <div className="flex-1">
                <p className="text-white font-medium">House Rules</p>
                <p className="text-white/50 text-sm">Signed Jan 2024 · Annual review</p>
              </div>
              <button className="text-purple-400 text-sm hover:text-purple-300">View</button>
            </div>
            <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer group">
              <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-400" />
              </div>
              <div className="flex-1">
                <p className="text-white font-medium">POPIA Consent</p>
                <p className="text-white/50 text-sm">Signed Jan 2024 · 3-year validity</p>
              </div>
              <button className="text-purple-400 text-sm hover:text-purple-300">View</button>
            </div>
            <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer group">
              <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-400" />
              </div>
              <div className="flex-1">
                <p className="text-white font-medium">Emergency Contact List</p>
                <p className="text-white/50 text-sm">Acknowledged Dec 2024</p>
              </div>
              <button className="text-purple-400 text-sm hover:text-purple-300">View</button>
            </div>
          </div>
        </div>

        {/* Weekly Schedule Preview */}
        <div className="bg-[#0d0d12] border border-white/10 rounded-2xl overflow-hidden lg:col-span-2">
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-purple-400" />
              <div>
                <h3 className="text-white font-semibold">This Week's Schedule</h3>
                <p className="text-white/50 text-sm">Household task roster</p>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-7 gap-2">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, index) => (
                <div key={day} className={`text-center p-4 rounded-xl ${index === 3 ? "bg-purple-500/20 border border-purple-500/30" : "bg-white/5"}`}>
                  <p className={`text-sm font-medium mb-2 ${index === 3 ? "text-purple-400" : "text-white/60"}`}>{day}</p>
                  <p className={`text-2xl font-bold ${index === 3 ? "text-white" : "text-white/80"}`}>{16 + index}</p>
                  <div className="mt-2 space-y-1">
                    {index < 5 && (
                      <>
                        <div className="h-1 rounded-full bg-purple-500/40" />
                        <div className="h-1 rounded-full bg-purple-500/40" />
                      </>
                    )}
                    {index === 5 && (
                      <div className="h-1 rounded-full bg-purple-500/40" />
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center gap-4 text-sm text-white/60">
              <div className="flex items-center gap-2">
                <div className="w-3 h-1 rounded-full bg-purple-500/40" />
                <span>Tasks scheduled</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
