"use client"

import { useState } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import {
  ClipboardList,
  Clock,
  DollarSign,
  Car,
  CheckCircle,
  Circle,
  AlertCircle,
  Play,
  Pause,
  Plus,
  Upload,
  ChevronRight,
} from "lucide-react"

export default function LuckyDashboard() {
  const [isClockRunning, setIsClockRunning] = useState(true)

  return (
    <DashboardLayout persona="lucky">
      {/* Time Clock Banner */}
      <div className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-green-600/20 to-green-800/20 border border-green-500/30">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-green-500/20 flex items-center justify-center">
              <Clock className="w-8 h-8 text-green-400" />
            </div>
            <div>
              <p className="text-white/60 text-sm">Today's Work Time</p>
              <p className="text-4xl font-bold text-white font-mono">05:18:42</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsClockRunning(!isClockRunning)}
              className={`
                flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-colors
                ${isClockRunning
                  ? "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                  : "bg-green-500/20 text-green-400 hover:bg-green-500/30"
                }
              `}
            >
              {isClockRunning ? (
                <>
                  <Pause className="w-5 h-5" />
                  Clock Out
                </>
              ) : (
                <>
                  <Play className="w-5 h-5" />
                  Clock In
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
          <p className="text-white/60 text-sm">Tasks Today</p>
          <p className="text-2xl font-bold text-white">4</p>
          <p className="text-green-400 text-sm">3 completed</p>
        </div>
        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
          <p className="text-white/60 text-sm">Hours This Week</p>
          <p className="text-2xl font-bold text-white">32.5</p>
          <p className="text-green-400 text-sm">On track</p>
        </div>
        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
          <p className="text-white/60 text-sm">Pending Expenses</p>
          <p className="text-2xl font-bold text-white">R320</p>
          <p className="text-amber-400 text-sm">Awaiting approval</p>
        </div>
        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
          <p className="text-white/60 text-sm">Leave Balance</p>
          <p className="text-2xl font-bold text-white">8</p>
          <p className="text-white/50 text-sm">days remaining</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* My Tasks */}
        <div className="bg-[#0d0d12] border border-white/10 rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ClipboardList className="w-5 h-5 text-green-400" />
              <div>
                <h3 className="text-white font-semibold">My Tasks</h3>
                <p className="text-white/50 text-sm">Today's garden work</p>
              </div>
            </div>
          </div>
          <div className="p-4 space-y-3">
            <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <div className="flex-1">
                <p className="text-white/50 line-through">Weekly lawn mowing</p>
                <p className="text-white/40 text-sm">Garden</p>
              </div>
              <span className="text-green-400 text-sm">Done</span>
            </div>
            <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <div className="flex-1">
                <p className="text-white/50 line-through">Trim hedges - front</p>
                <p className="text-white/40 text-sm">Garden</p>
              </div>
              <span className="text-green-400 text-sm">Done</span>
            </div>
            <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5">
              <AlertCircle className="w-5 h-5 text-amber-400" />
              <div className="flex-1">
                <p className="text-white font-medium">Fix irrigation zone 3</p>
                <p className="text-white/50 text-sm">Garden - High Priority</p>
              </div>
              <span className="text-amber-400 text-sm">In Progress</span>
            </div>
            <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5">
              <Circle className="w-5 h-5 text-white/40" />
              <div className="flex-1">
                <p className="text-white font-medium">Plant seasonal flowers</p>
                <p className="text-white/50 text-sm">Garden</p>
              </div>
              <span className="text-white/40 text-sm">Pending</span>
            </div>
          </div>
        </div>

        {/* Expenses */}
        <div className="bg-[#0d0d12] border border-white/10 rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <DollarSign className="w-5 h-5 text-green-400" />
              <div>
                <h3 className="text-white font-semibold">My Expenses</h3>
                <p className="text-white/50 text-sm">Recent submissions</p>
              </div>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors text-sm font-medium">
              <Plus className="w-4 h-4" />
              New
            </button>
          </div>
          <div className="p-4 space-y-3">
            <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5">
              <div className="flex-1">
                <p className="text-white font-medium">Garden Supplies</p>
                <p className="text-white/50 text-sm">Seeds, fertilizer</p>
              </div>
              <p className="text-white font-semibold">R320</p>
              <span className="px-2 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs">Pending</span>
            </div>
            <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5">
              <div className="flex-1">
                <p className="text-white font-medium">Fuel - Lawn Mower</p>
                <p className="text-white/50 text-sm">Petrol 10L</p>
              </div>
              <p className="text-white font-semibold">R280</p>
              <span className="px-2 py-1 rounded-full bg-green-500/20 text-green-400 text-xs">Approved</span>
            </div>
            <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5">
              <div className="flex-1">
                <p className="text-white font-medium">Hedge Trimmer Blade</p>
                <p className="text-white/50 text-sm">Replacement part</p>
              </div>
              <p className="text-white font-semibold">R450</p>
              <span className="px-2 py-1 rounded-full bg-green-500/20 text-green-400 text-xs">Approved</span>
            </div>
          </div>
          <div className="p-4 border-t border-white/10">
            <button className="w-full flex items-center justify-center gap-2 p-3 rounded-xl border border-dashed border-white/20 text-white/60 hover:text-white hover:border-white/40 transition-colors">
              <Upload className="w-4 h-4" />
              Upload Receipt
            </button>
          </div>
        </div>

        {/* Vehicle Log */}
        <div className="bg-[#0d0d12] border border-white/10 rounded-2xl overflow-hidden lg:col-span-2">
          <div className="p-6 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Car className="w-5 h-5 text-green-400" />
              <div>
                <h3 className="text-white font-semibold">Recent Vehicle Trips</h3>
                <p className="text-white/50 text-sm">Toyota Hilux usage</p>
              </div>
            </div>
            <button className="px-4 py-2 rounded-xl bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors text-sm font-medium">
              Log New Trip
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5">
                <tr>
                  <th className="text-left p-4 text-white/60 text-sm font-medium">Date</th>
                  <th className="text-left p-4 text-white/60 text-sm font-medium">Purpose</th>
                  <th className="text-left p-4 text-white/60 text-sm font-medium">Distance</th>
                  <th className="text-left p-4 text-white/60 text-sm font-medium">Fuel</th>
                  <th className="text-left p-4 text-white/60 text-sm font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                <tr className="hover:bg-white/5">
                  <td className="p-4 text-white">Today</td>
                  <td className="p-4 text-white">Garden center - supplies</td>
                  <td className="p-4 text-white">24 km</td>
                  <td className="p-4 text-white">-</td>
                  <td className="p-4"><span className="px-2 py-1 rounded-full bg-green-500/20 text-green-400 text-xs">Logged</span></td>
                </tr>
                <tr className="hover:bg-white/5">
                  <td className="p-4 text-white">Yesterday</td>
                  <td className="p-4 text-white">Hardware store</td>
                  <td className="p-4 text-white">18 km</td>
                  <td className="p-4 text-white">R150</td>
                  <td className="p-4"><span className="px-2 py-1 rounded-full bg-green-500/20 text-green-400 text-xs">Logged</span></td>
                </tr>
                <tr className="hover:bg-white/5">
                  <td className="p-4 text-white">Mon 16 Dec</td>
                  <td className="p-4 text-white">Waste disposal</td>
                  <td className="p-4 text-white">32 km</td>
                  <td className="p-4 text-white">-</td>
                  <td className="p-4"><span className="px-2 py-1 rounded-full bg-green-500/20 text-green-400 text-xs">Logged</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
