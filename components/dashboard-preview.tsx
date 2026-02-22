"use client"

import { motion, useInView } from "framer-motion"
import { useRef, useEffect, useState } from "react"
import { TrendingUp, CheckCircle2, AlertCircle, Clock } from "lucide-react"

interface ContractorData {
  contractors: Array<{
    name: string
    project: string
    progress: number
    totalPaid: number
    remaining: number
  }>
  summary: {
    totalPaid: number
    totalRemaining: number
    averageProgress: number
  }
}

function ContractorMilestones() {
  const [data, setData] = useState<ContractorData | null>(null)

  useEffect(() => {
    fetch('/api/contractors')
      .then(res => res.json())
      .then(setData)
  }, [])

  if (!data) return <div className="text-zinc-500 text-sm">Loading...</div>

  return (
    <div className="space-y-3">
      {data.contractors.slice(0, 3).map((contractor, i) => (
        <div key={i} className="p-3 bg-zinc-900/50 rounded-lg border border-zinc-800">
          <div className="flex justify-between items-start mb-2">
            <div>
              <div className="text-sm font-semibold text-white">{contractor.name}</div>
              <div className="text-xs text-zinc-500">{contractor.project}</div>
            </div>
            <div className="text-xs text-green-400">{contractor.progress}%</div>
          </div>
          <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-green-500"
              initial={{ width: 0 }}
              animate={{ width: `${contractor.progress}%` }}
              transition={{ duration: 1, delay: i * 0.2 }}
            />
          </div>
          <div className="flex justify-between mt-2 text-xs">
            <span className="text-zinc-500">Paid: R{(contractor.totalPaid / 1000).toFixed(1)}k</span>
            <span className="text-zinc-400">Remaining: R{(contractor.remaining / 1000).toFixed(1)}k</span>
          </div>
        </div>
      ))}
    </div>
  )
}

function QuickStats() {
  const [stats, setStats] = useState<any>(null)

  useEffect(() => {
    Promise.all([
      fetch('/api/stats').then(r => r.json()),
      fetch('/api/tasks').then(r => r.json()),
      fetch('/api/documents').then(r => r.json()),
    ]).then(([statsData, tasksData, docsData]) => {
      setStats({
        tasksCompleted: tasksData.summary.completed,
        tasksTotal: tasksData.summary.total,
        docsExpiringSoon: docsData.filter((d: any) => d.expiryDays < 60).length,
        budgetUsed: statsData.budget.percentage
      })
    })
  }, [])

  if (!stats) return null

  const metrics = [
    { 
      icon: CheckCircle2, 
      label: "Tasks Completed", 
      value: `${stats.tasksCompleted}/${stats.tasksTotal}`,
      color: "text-green-400"
    },
    { 
      icon: AlertCircle, 
      label: "Docs Expiring Soon", 
      value: stats.docsExpiringSoon,
      color: "text-orange-400"
    },
    { 
      icon: TrendingUp, 
      label: "Budget Used", 
      value: `${stats.budgetUsed}%`,
      color: "text-blue-400"
    },
    { 
      icon: Clock, 
      label: "Hours This Week", 
      value: "86.5",
      color: "text-emerald-400"
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-3">
      {metrics.map((metric, i) => {
        const Icon = metric.icon
        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="p-4 bg-zinc-900/50 rounded-lg border border-zinc-800"
          >
            <Icon className={`w-5 h-5 ${metric.color} mb-2`} />
            <div className="text-2xl font-bold text-white">{metric.value}</div>
            <div className="text-xs text-zinc-500">{metric.label}</div>
          </motion.div>
        )
      })}
    </div>
  )
}

function DocumentExpiry() {
  const [docs, setDocs] = useState<any[]>([])

  useEffect(() => {
    fetch('/api/documents')
      .then(res => res.json())
      .then(data => setDocs(data.slice(0, 5)))
  }, [])

  return (
    <div className="space-y-2">
      {docs.map((doc, i) => (
        <div key={i} className="flex items-center justify-between p-2 bg-zinc-900/30 rounded">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${
              doc.urgency === 'green' ? 'bg-green-500' :
              doc.urgency === 'yellow' ? 'bg-yellow-500' :
              'bg-orange-500'
            }`} />
            <span className="text-sm text-zinc-300">{doc.name}</span>
          </div>
          <span className="text-xs text-zinc-500">{doc.expiryDays}d</span>
        </div>
      ))}
    </div>
  )
}

export function DashboardPreview() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section id="dashboard" className="py-24 px-4 bg-zinc-950/50">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2
            className="text-3xl sm:text-4xl font-bold text-white mb-4"
            style={{ fontFamily: "var(--font-inter)" }}
          >
            Hans&apos; Admin Dashboard
          </h2>
          <p className="text-zinc-400 max-w-2xl mx-auto">
            Real-time visibility into all operations, compliance status, and financial tracking.
            Everything you need at a glance.
          </p>
        </motion.div>

        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative p-8 rounded-3xl bg-linear-to-br from-zinc-900 to-zinc-950 border border-zinc-800 shadow-2xl"
        >
          {/* Dashboard Header */}
          <div className="flex justify-between items-center mb-8 pb-4 border-b border-zinc-800">
            <div>
              <h3 className="text-2xl font-bold text-white">Overview Dashboard</h3>
              <p className="text-sm text-zinc-500">Real-time operational metrics</p>
            </div>
            <div className="flex gap-2">
              <span className="px-3 py-1.5 text-xs bg-green-900/30 text-green-400 rounded-full border border-green-800/50">
                All Systems Operational
              </span>
            </div>
          </div>

          {/* Dashboard Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Quick Stats */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">Quick Stats</h4>
              <QuickStats />
            </div>

            {/* Contractor Milestones */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">
                Contractor Milestones
              </h4>
              <ContractorMilestones />
            </div>

            {/* Document Expiry */}
            <div className="lg:col-span-2 space-y-4">
              <h4 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">
                Document Expiry Tracking
              </h4>
              <DocumentExpiry />
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="mt-8 pt-6 border-t border-zinc-800 flex flex-wrap gap-3">
            <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors">
              View Full Dashboard
            </button>
            <button className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm rounded-lg transition-colors">
              Export Report
            </button>
            <button className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm rounded-lg transition-colors">
              Manage Alerts
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
