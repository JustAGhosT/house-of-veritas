"use client"

import DashboardLayout from '@/components/dashboard-layout'
import { PayrollPanel } from '@/components/payroll-panel'
import { BiometricTimeClockPanel } from '@/components/biometric-time-clock'
import { DollarSign, Fingerprint } from 'lucide-react'
import { useState } from 'react'

export default function PayrollPage() {
  const [activeTab, setActiveTab] = useState<'payroll' | 'biometric'>('payroll')

  return (
    <DashboardLayout persona="hans">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Payroll & Time Management</h1>
          <p className="text-white/60 mt-1">Manage payroll, time tracking, and biometric attendance</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('payroll')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-colors ${
              activeTab === 'payroll'
                ? 'bg-green-600 text-white'
                : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            Payroll
          </button>
          <button
            onClick={() => setActiveTab('biometric')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-colors ${
              activeTab === 'biometric'
                ? 'bg-purple-600 text-white'
                : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Fingerprint className="w-4 h-4" />
            Biometric Clock
          </button>
        </div>

        {/* Content */}
        {activeTab === 'payroll' ? (
          <PayrollPanel />
        ) : (
          <BiometricTimeClockPanel />
        )}
      </div>
    </DashboardLayout>
  )
}
